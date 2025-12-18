# King Neon - Sprint Plan (December 2025)

> **Last Updated:** 2025-12-18
> **Focus:** Complete MVP features before payment integration

---

## 📊 Current Status Overview

| Component             | Done                                  | Missing                                     |
| --------------------- | ------------------------------------- | ------------------------------------------- |
| **API**               | Auth, Products CRUD, Orders CRUD      | Payment module                              |
| **Web**               | Landing, Collections, Cart            | Checkout completion, Account pages          |
| **Admin**             | Dashboard, Products list, Orders list | Product Edit, Delete confirm, Customer mgmt |
| **Neon Configurator** | Basic UI exists                       | Preview engine, pricing                     |

---

## � INCOMPLETE Features (Must Fix First)

### Admin Panel - Missing CRUD Operations

| Feature                                   | Status     | Priority |
| ----------------------------------------- | ---------- | -------- |
| Product Edit page (`/products/edit/[id]`) | ❌ Missing | P0       |
| Product Delete (confirmation modal)       | ⚠️ Partial | P0       |
| Product Create (form validation)          | ⚠️ Partial | P0       |
| Order Detail (customer info display)      | ⚠️ Partial | P1       |
| Customer Management page                  | ❌ Missing | P1       |
| Neon Config CRUD (fonts, colors)          | ❌ Missing | P1       |
| Settings page                             | ❌ Missing | P2       |

### Web Storefront - Incomplete Features

| Feature                          | Status         | Priority |
| -------------------------------- | -------------- | -------- |
| Checkout form validation         | ❌ Missing     | P0       |
| Checkout → Order API integration | ❌ Missing     | P0       |
| Account page (order history)     | ⚠️ Partial     | P1       |
| Wishlist                         | ❌ Not planned | P2       |
| Product Reviews                  | ❌ Not planned | P2       |

### API - Missing Modules

| Feature                 | Status     | Priority |
| ----------------------- | ---------- | -------- |
| Payment module (Stripe) | ❌ Missing | P0       |
| Email notifications     | ❌ Missing | P1       |
| File upload (images)    | ❌ Missing | P1       |

---

## 🎯 Sprint 2A: Complete Admin CRUD (Recommended First)

**Duration:** 2-3 days

### Tasks

1. **Product Edit Page** - `/products/edit/[id]`
   - Fetch product by ID
   - Pre-fill form with existing data
   - Update API call (PATCH /products/:id)
   - Redirect to list after save

2. **Product Create Enhancement**
   - Form validation
   - Image URL input (or upload later)
   - Category dropdown
   - Price, description fields

3. **Delete Confirmation**
   - Modal instead of window.confirm
   - Show product name in confirmation

4. **Customer Management**
   - List customers (GET /users)
   - View customer orders
   - Basic customer details

---

## 📋 Sprint 2B: Complete Checkout Flow

**Duration:** 3-4 days

### Tasks

1. **Checkout Form**
   - Shipping address validation
   - Contact info (email, phone)
   - React Hook Form + Zod

2. **Order Creation**
   - Connect to POST /orders
   - Send cart items to API
   - Handle success/error

3. **Order Confirmation Page**
   - `/checkout/success?order=[id]`
   - Display order details
   - Next steps info

---

## 📋 Sprint 3: Payment Integration

**Duration:** 3-5 days (After Sprint 2A & 2B)

### Tasks

1. Stripe API setup
2. Payment Intent creation
3. Stripe Elements in checkout
4. Webhook handling
5. Email confirmation

---

## 📋 Sprint 4: Neon Configurator

**Duration:** 7-10 days

### Tasks

1. Preview engine (canvas-based)
2. Font rendering with glow
3. Color picker connected to DB
4. Real-time pricing
5. Save custom design to order

---

## � Technical Debt

| Item                              | Priority |
| --------------------------------- | -------- |
| Replace `<img>` with `next/image` | Low      |
| Sass @import deprecation warnings | Low      |
| Loading skeletons consistency     | Medium   |
| Error boundaries                  | Medium   |
| API error handling improvement    | Medium   |

---

## ✅ What to Do Next

**Recommended Order:**

1. **Admin Product Edit** ← Start here
2. Admin Product Create form
3. Admin Delete confirmation modal
4. Checkout form validation
5. Checkout → Orders API connection
6. Then Payment integration

**Bạn muốn bắt đầu với Admin Product Edit không?**
