# EL&BE Restaurant Website - Product Requirements Document

## Original Problem Statement
Build a modern, responsive website for "EL&BE" restaurant with online ordering capabilities.

## Core Requirements

### Frontend
- Homepage with hero section (rustic/woody theme)
- Menu section with categories (appetizers, main courses, desserts, drinks)
- Items display with images, names, descriptions, and prices
- Google Maps embed with restaurant address
- Contact section with address, phone, and opening hours
- Multilingual support: Romanian (default), English, Hungarian

### Online Ordering
- Guest checkout (no authentication required)
- Shopping cart with add/remove/quantity controls
- Extras/toppings recommendation modal when adding items
- Per-item notes support
- Same item with different toppings shown as separate cart entries
- Payment: Stripe (credit card) + Cash on pickup
- Order confirmation

### Backend
- MongoDB database for orders
- API endpoints for menu and orders

---

## Completed Features

### December 2025
- [x] Rustic/woody UI theme with Tailwind CSS
- [x] Logo and hero image integration
- [x] Menu system with categories and items
- [x] Cart functionality (add/remove/quantity)
- [x] Extras modal for upselling toppings/drinks
- [x] Per-item notes in cart
- [x] Backend order creation with price calculation
- [x] **BUG FIX (2025-03-04)**: Cart instanceId fix - same items with different extras now display correctly as separate entries
- [x] **FEATURE (2025-03-04)**: Cart now shows extras prices and item subtotals (food + extras)

---

## Current Status
- **Project Health**: Working
- **Testing Status**: Cart bug verified fixed (7/7 tests passed)

---

## Backlog

### P1 - High Priority
- [ ] Multilingual support (i18next) - RO/EN/HU
- [ ] Stripe payment integration (frontend)

### P2 - Medium Priority
- [ ] Google Maps embed in contact section

### P3 - Future
- [ ] Admin panel for menu management
- [ ] Order history page for restaurant

---

## Technical Stack
- **Frontend**: React, Tailwind CSS, lucide-react
- **Backend**: FastAPI, Pydantic
- **Database**: MongoDB (motor driver)
- **State**: React Context (CartContext)

## Key Files
- `backend/server.py` - API endpoints
- `backend/menu_data.py` - Menu data (hardcoded)
- `frontend/src/contexts/CartContext.js` - Cart state management
- `frontend/src/pages/CheckoutPage.js` - Cart/checkout UI
- `frontend/src/components/restaurant/ExtrasModal.js` - Extras upsell modal
