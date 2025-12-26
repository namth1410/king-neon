# King Neon - Business Logic Documentation

> **Purpose**: This document is for AI Agents to understand the project's business logic without reading the entire source code. Last updated: 2025-12-23.

---

## 1. Project Overview

**King Neon** is an E-commerce platform for custom LED Neon signs, inspired by [Kings Of Neon](https://kingsofneon.com).

### Key Features:

- **Pre-made Products**: Catalog of ready-made LED Neon sign designs
- **Custom Design Builder**: Customers can create custom Neon signs with their own text, choosing fonts, colors, and sizes
- **Quote Requests**: B2B support for bulk orders and special customization requests

---

## 2. System Architecture

### Tech Stack

| Layer       | Technology              | Port (Dev)                 |
| ----------- | ----------------------- | -------------------------- |
| Frontend    | Next.js 15 + TypeScript | 3000                       |
| Admin       | Next.js 15 + TypeScript | 3001                       |
| Backend API | NestJS + TypeScript     | 4000                       |
| Database    | PostgreSQL 16           | 5434                       |
| Cache       | Redis 7                 | 6380                       |
| Storage     | MinIO (S3-compatible)   | 9002 (API), 9003 (Console) |

### Monorepo Structure

```
king-neon/
├── apps/
│   ├── web/        # Public customer-facing website
│   ├── admin/      # Admin management panel
│   └── api/        # Backend API (NestJS)
├── packages/
│   ├── shared/     # Shared types & utilities
│   └── ui/         # Shared UI components
└── docker-compose.yml
```

---

## 3. Database Entities Quick Reference

| Entity        | Table             | Description                            |
| ------------- | ----------------- | -------------------------------------- |
| User          | `users`           | Customer/Admin accounts                |
| Product       | `products`        | Pre-made neon sign products            |
| Category      | `categories`      | Product categories                     |
| Cart          | `carts`           | Shopping carts                         |
| CartItem      | `cart_items`      | Items in cart                          |
| Order         | `orders`          | Customer orders                        |
| OrderItem     | `order_items`     | Items in orders                        |
| Quote         | `quotes`          | B2B quote requests                     |
| CustomDesign  | `custom_designs`  | User-created neon sign designs         |
| NeonFont      | `neon_fonts`      | Available fonts for custom designs     |
| NeonColor     | `neon_colors`     | Available LED colors                   |
| NeonSize      | `neon_sizes`      | Available sizes with price multipliers |
| NeonMaterial  | `neon_materials`  | LED material types                     |
| NeonBackboard | `neon_backboards` | Backboard options                      |

### Key Relationships:

- `User` 1:N `Order` - User places multiple orders
- `User` 1:N `Quote` - User submits multiple quotes
- `User` 1:N `CustomDesign` - User creates multiple designs
- `Product` N:1 `Category` - Products belong to categories
- `Order` 1:N `OrderItem` - Orders contain multiple items
- `CustomDesign` N:1 `NeonFont/Color/Size/Material/Backboard` - Design references config options

---

## 4. API Endpoints Summary

### Authentication (`/api/auth`)

| Endpoint    | Method | Auth | Description                  |
| ----------- | ------ | ---- | ---------------------------- |
| `/register` | POST   | No   | Create new account           |
| `/login`    | POST   | No   | Login (returns JWT + cookie) |
| `/logout`   | POST   | No   | Clear auth cookie            |
| `/me`       | GET    | Yes  | Get current user profile     |

### Products (`/api/products`)

| Endpoint                  | Method | Auth  | Description                    |
| ------------------------- | ------ | ----- | ------------------------------ |
| `/`                       | GET    | No    | List products (filterable)     |
| `/featured`               | GET    | No    | Get featured products          |
| `/categories-with-counts` | GET    | No    | Categories with product counts |
| `/slug/:slug`             | GET    | No    | Get product by URL slug        |
| `/:id`                    | GET    | No    | Get product by ID              |
| `/`                       | POST   | Admin | Create product                 |
| `/:id`                    | PATCH  | Admin | Update product                 |
| `/:id`                    | DELETE | Admin | Delete product                 |

### Cart (`/api/cart`) - All endpoints require JWT

| Endpoint         | Method | Description                  |
| ---------------- | ------ | ---------------------------- |
| `/`              | GET    | Get user's cart              |
| `/items`         | POST   | Add item to cart             |
| `/items/:itemId` | PATCH  | Update item quantity         |
| `/items/:itemId` | DELETE | Remove item from cart        |
| `/`              | DELETE | Clear entire cart            |
| `/merge`         | POST   | Merge guest cart after login |

### Orders (`/api/orders`)

| Endpoint              | Method | Auth  | Description           |
| --------------------- | ------ | ----- | --------------------- |
| `/`                   | POST   | User  | Create new order      |
| `/`                   | GET    | Admin | List all orders       |
| `/my-orders`          | GET    | User  | Get user's own orders |
| `/track/:orderNumber` | GET    | No    | Track order publicly  |
| `/:id`                | GET    | User  | Get order details     |
| `/:id`                | PATCH  | Admin | Update order          |
| `/:id/cancel`         | POST   | User  | Cancel order          |

### Payments (`/api/payments`)

| Endpoint                 | Method | Description                  |
| ------------------------ | ------ | ---------------------------- |
| `/create-payment-intent` | POST   | Create Stripe Payment Intent |
| `/webhook`               | POST   | Handle Stripe webhooks       |

### Quotes (`/api/quotes`)

| Endpoint     | Method | Auth  | Description          |
| ------------ | ------ | ----- | -------------------- |
| `/`          | POST   | No    | Submit quote request |
| `/`          | GET    | Admin | List all quotes      |
| `/my-quotes` | GET    | User  | Get user's quotes    |
| `/:id`       | GET    | No    | Get quote details    |
| `/:id`       | PATCH  | Admin | Respond to quote     |

### Neon Config (`/api/neon`)

| Endpoint       | Method | Auth  | Description               |
| -------------- | ------ | ----- | ------------------------- |
| `/config`      | GET    | No    | Get all config options    |
| `/fonts`       | GET    | No    | List available fonts      |
| `/colors`      | GET    | No    | List available colors     |
| `/sizes`       | GET    | No    | List available sizes      |
| `/materials`   | GET    | No    | List available materials  |
| `/backboards`  | GET    | No    | List available backboards |
| CRUD endpoints | \*     | Admin | Manage config options     |

---

## 5. Core Business Flows

### 5.1 Order Creation Flow

```
1. Customer adds products to cart (POST /cart/items)
2. Customer proceeds to checkout
3. API creates order with status=PENDING (POST /orders)
4. Frontend requests Stripe Payment Intent (POST /payments/create-payment-intent)
5. Customer completes payment via Stripe Elements
6. Stripe sends webhook (payment_intent.succeeded)
7. API updates order.paymentStatus = PAID
8. API sends confirmation email to customer
9. API sends notification email to admin
```

### 5.2 Order Status Lifecycle

```
PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
                                           ↘ CANCELLED
```

### 5.3 Quote Request Flow

```
1. Customer/Guest submits quote form (POST /quotes)
2. Quote created with status=PENDING
3. Admin reviews and updates status to REVIEWING
4. Admin provides quotedPrice and updates to QUOTED
5. Customer accepts (ACCEPTED) or rejects (REJECTED)
```

---

## 6. Authentication & Authorization

### JWT Token Authentication

- Tokens issued on login/register
- Token stored in HTTP-only cookie (`auth_token`) AND returned in response
- Token expiration configurable via `JWT_EXPIRATION`

### Role-Based Access Control

| Role     | Permissions                                   |
| -------- | --------------------------------------------- |
| customer | View products, manage own cart/orders/account |
| admin    | Full access: CRUD all resources               |

### Guards Used

- `JwtAuthGuard`: Validates JWT token
- `RolesGuard` + `@Roles(UserRole.ADMIN)`: Admin-only endpoints

---

## 7. Custom Design Pricing Logic

Price calculation for custom neon signs:

```typescript
price =
  basePrice +
  size.priceMultiplier * textLength +
  material.additionalPrice +
  backboard.additionalPrice;
```

Factors affecting price:

1. **Size**: Has a `priceMultiplier` factor
2. **Material**: Has a `basePrice` add-on
3. **Backboard**: Has an additional price
4. **Text Length**: May affect final price

---

## 8. Image Handling

- All images stored in **MinIO** (S3-compatible object storage)
- Database stores **image keys** (e.g., `products/abc123.jpg`)
- API transforms keys to full URLs when returning data
- Upload endpoint: `POST /api/upload`

---

## 9. Rate Limiting

| Endpoint Type         | Limit     |
| --------------------- | --------- |
| Auth (login/register) | 5 req/min |
| Quote submit          | 3 req/min |

---

## 10. Security Measures

- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: class-validator decorators on DTOs
- **Cookie Security**: httpOnly, secure (production), sameSite: lax
- **CORS**: Configured for allowed frontend domains
- **Webhook Verification**: Stripe signature validation
- **Idempotency**: Duplicate webhook handling protection

---

## 11. Key Development Notes

1. **Image URLs**: Backend stores keys, transforms to full URLs on response
2. **Payment Source of Truth**: Stripe webhooks, not client-side callbacks
3. **Order Snapshots**: OrderItem stores product info snapshot at order time
4. **TypeORM**: Uses decorators for schema, auto-generates migrations
5. **DTO Validation**: Required for all POST/PATCH endpoints

---

_This documentation should be updated when business logic changes._
