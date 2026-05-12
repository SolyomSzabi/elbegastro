from fastapi import FastAPI, APIRouter, Request, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import stripe
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone
from menu_data import MENU_ITEMS, CATEGORIES, CATEGORY_IMAGES, ITEM_IMAGES, EXTRAS, DRINK_RECOMMENDATIONS

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

# Stripe setup
stripe.api_key = os.environ.get('STRIPE_API_KEY')
stripe_webhook_secret = os.environ.get('STRIPE_WEBHOOK_SECRET', '')

# --- Models ---
class CartItem(BaseModel):
    item_id: str
    quantity: int

class OrderCreate(BaseModel):
    customer_name: str
    phone: str
    email: str
    notes: Optional[str] = ""
    payment_method: str  # "card" or "cash"
    items: List[CartItem]
    language: str = "ro"

class CheckoutRequest(BaseModel):
    order_id: str
    origin_url: str

# --- Menu Endpoints ---
@api_router.get("/menu")
async def get_menu():
    items_with_images = []
    for item in MENU_ITEMS:
        enriched = {**item}
        enriched["image"] = ITEM_IMAGES.get(item["id"], CATEGORY_IMAGES.get(item["category"], ""))
        items_with_images.append(enriched)
    extras_with_images = []
    for extra in EXTRAS:
        enriched = {**extra}
        enriched["image"] = ITEM_IMAGES.get(extra["id"], CATEGORY_IMAGES.get("appetizer", ""))
        extras_with_images.append(enriched)
    return {"items": items_with_images, "categories": CATEGORIES, "extras": extras_with_images, "drink_recommendations": DRINK_RECOMMENDATIONS}

@api_router.get("/menu/{category}")
async def get_menu_by_category(category: str):
    items = []
    for i in MENU_ITEMS:
        if i["category"] == category:
            enriched = {**i}
            enriched["image"] = ITEM_IMAGES.get(i["id"], CATEGORY_IMAGES.get(i["category"], ""))
            items.append(enriched)
    return {"items": items}

# --- Order Endpoints ---
def calculate_order_total(items: List[CartItem]) -> float:
    menu_map = {item["id"]: item["price"] for item in MENU_ITEMS}
    extras_map = {item["id"]: item["price"] for item in EXTRAS}
    total = 0.0
    for cart_item in items:
        price = menu_map.get(cart_item.item_id, extras_map.get(cart_item.item_id, 0))
        total += price * cart_item.quantity
    return round(total, 2)

@api_router.post("/orders")
async def create_order(order: OrderCreate):
    total = calculate_order_total(order.items)
    order_id = str(uuid.uuid4())[:8].upper()

    items_detail = []
    menu_map = {item["id"]: item for item in MENU_ITEMS}
    extras_map = {item["id"]: item for item in EXTRAS}
    for cart_item in order.items:
        menu_item = menu_map.get(cart_item.item_id) or extras_map.get(cart_item.item_id)
        if menu_item:
            lang = order.language
            name_key = f"name_{lang}" if f"name_{lang}" in menu_item else "name_ro"
            items_detail.append({
                "item_id": cart_item.item_id,
                "name": menu_item.get(name_key, menu_item["name_ro"]),
                "price": menu_item["price"],
                "quantity": cart_item.quantity,
                "subtotal": round(menu_item["price"] * cart_item.quantity, 2)
            })

    order_doc = {
        "id": order_id,
        "customer_name": order.customer_name,
        "phone": order.phone,
        "email": order.email,
        "notes": order.notes,
        "payment_method": order.payment_method,
        "payment_status": "pending" if order.payment_method == "card" else "cash",
        "items": items_detail,
        "total": total,
        "status": "pending",
        "language": order.language,
        "created_at": datetime.now(timezone.utc).isoformat()
    }

    await db.orders.insert_one({**order_doc, "_id": order_doc["id"]})

    return {
        "id": order_doc["id"],
        "total": order_doc["total"],
        "status": order_doc["status"],
        "payment_method": order_doc["payment_method"],
        "payment_status": order_doc["payment_status"],
        "items": order_doc["items"],
        "created_at": order_doc["created_at"]
    }

# --- Desktop App Endpoints ---
@api_router.get("/orders/pending")
async def get_pending_orders():
    orders = await db.orders.find(
        {"status": "pending"},
        {"_id": 0}
    ).sort("created_at", 1).to_list(100)
    return orders

@api_router.post("/orders/{order_id}/confirm")
async def confirm_order(order_id: str):
    result = await db.orders.update_one(
        {"id": order_id},
        {"$set": {"status": "confirmed", "confirmed_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"success": True}

@api_router.post("/orders/{order_id}/reject")
async def reject_order(order_id: str):
    result = await db.orders.update_one(
        {"id": order_id},
        {"$set": {"status": "rejected", "rejected_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"success": True}

@api_router.get("/orders/{order_id}")
async def get_order(order_id: str):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

# --- Stripe Payment Endpoints ---
@api_router.post("/checkout/session")
async def create_checkout_session(req: CheckoutRequest, http_request: Request):
    order = await db.orders.find_one({"id": req.order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    success_url = f"{req.origin_url}/order-confirmation?order_id={req.order_id}&session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{req.origin_url}/checkout"

    # Convert RON to bani (smallest currency unit, like cents)
    amount_bani = int(float(order["total"]) * 100)

    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        line_items=[{
            "price_data": {
                "currency": "ron",
                "product_data": {
                    "name": f"Order #{req.order_id} - EL&BE Restaurant",
                },
                "unit_amount": amount_bani,
            },
            "quantity": 1,
        }],
        mode="payment",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={"order_id": req.order_id}
    )

    # Store payment transaction
    await db.payment_transactions.insert_one({
        "session_id": session.id,
        "order_id": req.order_id,
        "amount": float(order["total"]),
        "currency": "ron",
        "payment_status": "initiated",
        "metadata": {"order_id": req.order_id},
        "created_at": datetime.now(timezone.utc).isoformat()
    })

    return {"url": session.url, "session_id": session.id}

@api_router.get("/checkout/status/{session_id}")
async def get_checkout_status(session_id: str):
    session = stripe.checkout.Session.retrieve(session_id)

    payment_status = "paid" if session.payment_status == "paid" else "pending"

    tx = await db.payment_transactions.find_one({"session_id": session_id})
    if tx and tx.get("payment_status") != "paid":
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {
                "payment_status": payment_status,
                "status": session.status,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        if payment_status == "paid":
            order_id = tx.get("order_id") or (tx.get("metadata") or {}).get("order_id")
            if order_id:
                await db.orders.update_one(
                    {"id": order_id},
                    {"$set": {"payment_status": "paid", "status": "confirmed"}}
                )

    return {
        "status": session.status,
        "payment_status": payment_status,
        "amount_total": session.amount_total,
        "currency": session.currency
    }

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("Stripe-Signature", "")

    try:
        event = stripe.Webhook.construct_event(body, signature, stripe_webhook_secret)
    except stripe.error.SignatureVerificationError:
        logger.error("Invalid Stripe webhook signature")
        raise HTTPException(status_code=400, detail="Invalid signature")
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        raise HTTPException(status_code=400, detail="Webhook error")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        if session.get("payment_status") == "paid":
            order_id = (session.get("metadata") or {}).get("order_id")
            if order_id:
                await db.payment_transactions.update_one(
                    {"session_id": session["id"]},
                    {"$set": {"payment_status": "paid", "updated_at": datetime.now(timezone.utc).isoformat()}}
                )
                await db.orders.update_one(
                    {"id": order_id},
                    {"$set": {"payment_status": "paid", "status": "confirmed"}}
                )

    return {"status": "ok"}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()