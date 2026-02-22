from fastapi import FastAPI, APIRouter, Request, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone
from menu_data import MENU_ITEMS, CATEGORIES

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
stripe_api_key = os.environ.get('STRIPE_API_KEY')

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
    return {"items": MENU_ITEMS, "categories": CATEGORIES}

@api_router.get("/menu/{category}")
async def get_menu_by_category(category: str):
    items = [i for i in MENU_ITEMS if i["category"] == category]
    return {"items": items}

# --- Order Endpoints ---
def calculate_order_total(items: List[CartItem]) -> float:
    menu_map = {item["id"]: item["price"] for item in MENU_ITEMS}
    total = 0.0
    for cart_item in items:
        price = menu_map.get(cart_item.item_id, 0)
        total += price * cart_item.quantity
    return round(total, 2)

@api_router.post("/orders")
async def create_order(order: OrderCreate):
    total = calculate_order_total(order.items)
    order_id = str(uuid.uuid4())[:8].upper()

    items_detail = []
    menu_map = {item["id"]: item for item in MENU_ITEMS}
    for cart_item in order.items:
        menu_item = menu_map.get(cart_item.item_id)
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

@api_router.get("/orders/{order_id}")
async def get_order(order_id: str):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

# --- Stripe Payment Endpoints ---
@api_router.post("/checkout/session")
async def create_checkout_session(req: CheckoutRequest, http_request: Request):
    from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest

    order = await db.orders.find_one({"id": req.order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    host_url = str(http_request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)

    success_url = f"{req.origin_url}/order-confirmation?order_id={req.order_id}&session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{req.origin_url}/checkout"

    amount = float(order["total"])

    checkout_request = CheckoutSessionRequest(
        amount=amount,
        currency="ron",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={"order_id": req.order_id}
    )

    session = await stripe_checkout.create_checkout_session(checkout_request)

    # Create payment transaction record
    await db.payment_transactions.insert_one({
        "session_id": session.session_id,
        "order_id": req.order_id,
        "amount": amount,
        "currency": "ron",
        "payment_status": "initiated",
        "metadata": {"order_id": req.order_id},
        "created_at": datetime.now(timezone.utc).isoformat()
    })

    return {"url": session.url, "session_id": session.session_id}

@api_router.get("/checkout/status/{session_id}")
async def get_checkout_status(session_id: str, http_request: Request):
    from emergentintegrations.payments.stripe.checkout import StripeCheckout

    host_url = str(http_request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)

    status = await stripe_checkout.get_checkout_status(session_id)

    # Update payment transaction
    tx = await db.payment_transactions.find_one({"session_id": session_id})
    if tx:
        new_status = status.payment_status
        if tx.get("payment_status") != "paid":
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {"payment_status": new_status, "status": status.status, "updated_at": datetime.now(timezone.utc).isoformat()}}
            )
            if new_status == "paid":
                order_id = tx.get("order_id") or (tx.get("metadata") or {}).get("order_id")
                if order_id:
                    await db.orders.update_one(
                        {"id": order_id},
                        {"$set": {"payment_status": "paid", "status": "confirmed"}}
                    )

    return {
        "status": status.status,
        "payment_status": status.payment_status,
        "amount_total": status.amount_total,
        "currency": status.currency
    }

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    from emergentintegrations.payments.stripe.checkout import StripeCheckout

    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)

    body = await request.body()
    signature = request.headers.get("Stripe-Signature", "")

    try:
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        if webhook_response.payment_status == "paid":
            order_id = (webhook_response.metadata or {}).get("order_id")
            if order_id:
                await db.payment_transactions.update_one(
                    {"session_id": webhook_response.session_id},
                    {"$set": {"payment_status": "paid", "updated_at": datetime.now(timezone.utc).isoformat()}}
                )
                await db.orders.update_one(
                    {"id": order_id},
                    {"$set": {"payment_status": "paid", "status": "confirmed"}}
                )
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return {"status": "error"}

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
