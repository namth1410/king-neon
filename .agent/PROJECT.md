# King Neon - Project Requirements & Business Logic

> **Document Purpose:** This document provides a comprehensive overview of the King Neon project for any AI agent or developer. It covers business logic, architecture decisions, tech stack, and coding conventions.

---

## 1. Project Overview

**King Neon** is an e-commerce platform specializing in custom LED neon signs. The core differentiator is a **real-time Neon Configurator** that allows customers to design their own neon signs (text, font, color, size, backboard) and see a live preview with dynamic pricing.

### Target Audience

- B2C: Individuals seeking personalized neon art for homes, events, weddings.
- B2B: Businesses needing branded signage.

### Core Value Proposition

- Custom neon sign design with instant preview and pricing.
- Pre-designed neon sign catalog.
- Streamlined order-to-production workflow.

---

## 2. Monorepo Architecture

```
king-neon/
├── apps/
│   ├── api/          # NestJS Backend API (GraphQL optional, REST primary)
│   ├── admin/        # Next.js Admin Panel (Custom business logic UI)
│   ├── cms/          # Strapi CMS (Blog, Static Pages, SEO)
│   └── web/          # Next.js Public Website (App Router)
├── packages/
│   └── shared/       # Shared types, enums, utilities
├── docker-compose.yml
├── turbo.json        # Turborepo config
└── pnpm-workspace.yaml
```

### Responsibility Matrix

| App     | Responsibility                                        | Port |
| ------- | ----------------------------------------------------- | ---- |
| `api`   | Auth, Products, Orders, Neon Config, Quotes, Payments | 4000 |
| `admin` | Order Management, Custom Design Preview, Product CRUD | 3001 |
| `cms`   | Blog Posts, Static Pages, SEO Management              | 1337 |
| `web`   | Public storefront, Neon Configurator, Checkout        | 3000 |

---

## 3. Tech Stack

| Layer        | Technology                                    |
| ------------ | --------------------------------------------- |
| Frontend     | Next.js 15 (App Router), React 19, TypeScript |
| Styling      | SCSS Modules, CSS Variables, Glassmorphism    |
| State        | Redux Toolkit (Cart), React Context (Auth)    |
| Backend      | NestJS, TypeORM, PostgreSQL                   |
| CMS          | Strapi 5                                      |
| Auth         | JWT (accessToken in localStorage)             |
| File Storage | MinIO (S3-compatible)                         |
| Cache        | Redis                                         |
| Build        | Turborepo, pnpm                               |

---

## 4. Key Business Entities

### 4.1 User (`apps/api/src/modules/users/user.entity.ts`)

```typescript
enum UserRole {
  CUSTOMER = "customer",
  ADMIN = "admin",
}
```

- Users can be customers or admins.
- Admin role grants access to the Admin Panel.

### 4.2 Product (`apps/api/src/modules/products/product.entity.ts`)

```typescript
enum ProductCategory {
  LED_NEON = "led-neon",
  BACKLIT_SIGNS = "backlit-signs",
  CHANNEL_LETTERS = "channel-letters",
  LIGHTBOX_SIGNS = "lightbox-signs",
}
```

- `isCustom: boolean` – Indicates if product is a pre-designed neon or requires configuration.
- `basePrice` – Starting price, modified by Neon Config options.

### 4.3 Custom Design (`apps/api/src/modules/neon-config/entities/custom-design.entity.ts`)

This is the **core business entity**. Represents a customer's custom neon sign design.

- `textLines` – Array of text lines (e.g., ["Hello", "World"])
- `fontId` → NeonFont
- `colorId` → NeonColor
- `sizeId` → NeonSize
- `materialId` → NeonMaterial
- `backboardId`→ NeonBackboard
- `calculatedPrice` – Auto-calculated from options.
- `previewImageUrl` – Server-generated preview.

### 4.4 Order (`apps/api/src/modules/orders/order.entity.ts`)

```typescript
enum OrderStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  PROCESSING = "processing", // Manufacturing
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}
```

- Orders contain `OrderItem[]`, which can reference either a `Product` or a `CustomDesign`.

### 4.5 Neon Config Entities (Lookup Tables)

| Entity          | Purpose                              |
| --------------- | ------------------------------------ |
| `NeonFont`      | Available fonts (with font file URL) |
| `NeonColor`     | LED tube colors (hex, RGB, name)     |
| `NeonSize`      | Predefined sizes (S, M, L, XL, etc.) |
| `NeonMaterial`  | Tube material (Silicone, Glass)      |
| `NeonBackboard` | Backboard types (Acrylic, Metal)     |

---

## 5. Key Workflows

### 5.1 Neon Configurator Flow (Web App)

```mermaid
graph LR
    A[User opens Configurator] --> B[Select Font]
    B --> C[Enter Text]
    C --> D[Choose Color]
    D --> E[Select Size]
    E --> F[Choose Backboard]
    F --> G[Real-time Preview & Price]
    G --> H[Add to Cart as CustomDesign]
    H --> I[Checkout]
```

### 5.2 Order Processing Flow (Admin App)

```mermaid
graph LR
    A[Order Created: PENDING] --> B{Admin Reviews}
    B -->|Approve| C[CONFIRMED]
    B -->|Reject| Z[CANCELLED]
    C --> D[PROCESSING: Manufacturing]
    D --> E[Quality Check]
    E --> F[SHIPPED]
    F --> G[DELIVERED]
```

### 5.3 Price Calculation Formula

```
calculatedPrice = basePrice
    + (fontModifier * basePrice)
    + (colorModifier * basePrice)
    + (sizeMultiplier * basePrice)
    + materialSurcharge
    + backboardSurcharge
```

---

## 6. API Design

### Base URL

- Development: `http://localhost:4000/api`
- All endpoints require `Authorization: Bearer <token>` for authenticated routes.

### Key Endpoints

| Method | Endpoint                 | Description                    |
| ------ | ------------------------ | ------------------------------ |
| POST   | `/auth/register`         | User registration              |
| POST   | `/auth/login`            | Returns `accessToken` & `user` |
| GET    | `/auth/profile`          | Get current user (protected)   |
| GET    | `/products`              | List products                  |
| POST   | `/products`              | Create product (Admin)         |
| GET    | `/neon-config/options`   | Get all config options         |
| POST   | `/neon-config/designs`   | Save custom design             |
| POST   | `/neon-config/calculate` | Calculate price                |
| GET    | `/orders`                | List orders (Admin)            |
| PATCH  | `/orders/:id/status`     | Update order status (Admin)    |

---

## 7. Frontend Conventions

### 7.1 File Structure (Next.js App Router)

```
src/
├── app/                    # Route segments
│   ├── (auth)/            # Auth group (login, register)
│   ├── (main)/            # Main layout group
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   └── ComponentName/
│       ├── ComponentName.tsx
│       └── ComponentName.module.scss
├── hooks/                 # Custom hooks
├── store/                 # Redux slices
├── utils/                 # Utility functions
│   └── api.ts            # Axios instance with interceptors
└── styles/               # Global styles
    ├── globals.scss
    ├── _variables.scss
    └── _mixins.scss
```

### 7.2 Styling Guidelines

- Use **SCSS Modules** for component styles.
- CSS Variables for theming (`--color-primary: #ff3366`).
- **Glassmorphism** aesthetic: `backdrop-filter: blur()`, semi-transparent backgrounds.
- Color Palette:
  - Primary: `#ff3366` (Neon Pink)
  - Background: `#0a0a0a` (Deep Black)
  - Glass: `rgba(20, 20, 20, 0.6)`

### 7.3 State Management

- **Redux Toolkit** for global state (Cart, potentially Auth).
- **React Context** for localized state (Modals, Toasts).
- **localStorage** for token persistence (`token` for web, `admin_token` for admin).

---

## 8. Backend Conventions

### 8.1 Module Structure (NestJS)

```
src/modules/
└── module-name/
    ├── module-name.module.ts
    ├── module-name.controller.ts
    ├── module-name.service.ts
    ├── dto/
    │   ├── create-module-name.dto.ts
    │   └── update-module-name.dto.ts
    └── entities/
        └── module-name.entity.ts
```

### 8.2 Error Handling

- Use `@king-neon/shared` `ErrorCode` enum for consistent error codes.
- API returns `ApiErrorResponse` format:

```typescript
{
  statusCode: number;
  message: string;
  code: ErrorCode;
  details?: unknown;
}
```

---

## 9. Environment Variables

### API (`apps/api/.env`)

```env
DATABASE_URL=postgresql://king_neon:king_neon_secret@localhost:5434/king_neon_db
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
REDIS_URL=redis://localhost:6380
MINIO_ENDPOINT=localhost
MINIO_PORT=9002
```

### Web (`apps/web/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_CMS_URL=http://localhost:1337
```

### Admin (`apps/admin/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

---

## 10. Development Commands

```bash
# Start all services (API, Web, Admin, CMS)
npm run dev

# Start Docker services (Postgres, Redis, MinIO)
docker compose up -d

# Build all apps
npm run build

# Run API only
pnpm --filter @king-neon/api dev

# Run Admin only
pnpm --filter @king-neon/admin dev
```

---

## 11. Current Status & Roadmap

### Completed ✅

- [x] Project setup (Monorepo, Turborepo, Docker)
- [x] Backend API (Auth, Products, Orders, Neon Config)
- [x] Web App (Homepage, Product List, Auth, Cart)
- [x] Admin App (Login, Dashboard, Product CRUD)
- [x] Strapi CMS integration

### In Progress 🚧

- [ ] Admin: Order Management (Kanban/Pipeline UI)
- [ ] Admin: Custom Design Preview
- [ ] Web: Neon Configurator (Live Preview)
- [ ] Payment Integration

### Planned 📋

- [ ] Web: Checkout Flow
- [ ] Admin: Analytics Dashboard
- [ ] Email Notifications
- [ ] Production Deployment

---

## 12. Important Notes for AI Agents

1. **Token Property Name:** Backend returns `accessToken` (camelCase), not `access_token`.
2. **Role Values:** Use lowercase (`admin`, `customer`), not uppercase.
3. **API Base URL:** Include `/api` suffix (e.g., `http://localhost:4000/api`).
4. **Port Mapping:**
   - PostgreSQL: 5434
   - Redis: 6380
   - MinIO: 9002 (API), 9003 (Console)
5. **Admin vs Strapi:**
   - Use Admin App for Orders, Custom Designs, Products.
   - Use Strapi for Blog, Static Pages, SEO.
