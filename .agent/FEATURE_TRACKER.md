# King Neon - Feature Tracker

> **Purpose:** Track which features from the original kingsofneon.com we are building, their status, and priorities.
> **Legend:** ✅ Done | 🚧 In Progress | 📋 Planned | ❌ Not Planned

---

## 1. E-commerce Core

| Feature                | Status | Notes                                        |
| ---------------------- | ------ | -------------------------------------------- |
| Product Catalog        | 🚧     | API done, Web listing page done              |
| Product Detail Page    | ✅     | Image gallery, Add to Cart, Related Products |
| Product Search         | 📋     | -                                            |
| Product Filtering      | 📋     | -                                            |
| Collections/Categories | 📋     | Simplified version (not 160 collections)     |
| Shopping Cart          | ✅     | Redux-based, sidebar cart                    |
| Wishlist               | ❌     | Not in scope                                 |
| Order Management       | ✅     | List, Detail, Status Updates                 |
| Checkout Flow          | 📋     | Priority: High                               |
| Payment (Stripe)       | 📋     | -                                            |
| Order Confirmation     | 📋     | -                                            |
| Order History          | 📋     | Account page started                         |
| User Registration      | ✅     | Working                                      |
| User Login             | ✅     | Working                                      |
| User Account           | 🚧     | Basic profile done                           |
| Guest Checkout         | 📋     | -                                            |

---

## 2. Neon Configurator (Core Differentiator)

| Feature            | Status | Notes                      |
| ------------------ | ------ | -------------------------- |
| Text Input         | 📋     | Priority: Critical         |
| Font Selection     | 📋     | NeonFont entity ready      |
| Color Selection    | 📋     | NeonColor entity ready     |
| Size Selection     | 📋     | NeonSize entity ready      |
| Backboard Options  | 📋     | NeonBackboard entity ready |
| Material Selection | 📋     | NeonMaterial entity ready  |
| Real-time Preview  | 📋     | Priority: Critical         |
| Dynamic Pricing    | 📋     | Calculate endpoint ready   |
| Save Design        | 📋     | CustomDesign entity ready  |
| Add to Cart        | 📋     | -                          |

---

## 3. Admin Panel

| Feature                  | Status | Notes                         |
| ------------------------ | ------ | ----------------------------- |
| Admin Login              | ✅     | Role-based auth               |
| Dashboard Overview       | ✅     | Stats cards, recent orders    |
| Product List             | ✅     | With search, filter           |
| Product Create           | ✅     | Form with validation          |
| Product Edit             | 📋     | -                             |
| Product Delete           | ✅     | Confirmation dialog           |
| Order List               | 📋     | Priority: High                |
| Order Detail             | 📋     | -                             |
| Order Status Update      | 📋     | Kanban/Pipeline UI planned    |
| Custom Design Preview    | 📋     | Critical for order processing |
| Neon Config Options CRUD | 📋     | Manage fonts, colors, sizes   |
| Customer List            | 📋     | -                             |
| Analytics/Reports        | ❌     | Nice-to-have, low priority    |

---

## 4. Static Pages (via Strapi CMS)

| Page               | Status | Notes                        |
| ------------------ | ------ | ---------------------------- |
| Homepage           | 🚧     | Hero, featured products done |
| About Us           | 📋     | Strapi content type          |
| Contact            | 📋     | Form submission needed       |
| FAQ                | 📋     | Strapi content type          |
| Privacy Policy     | 📋     | Strapi content type          |
| Terms & Conditions | 📋     | Strapi content type          |
| Blog               | 📋     | Strapi blog setup            |

---

## 5. Landing Pages (Marketing)

| Page              | Status | Priority | Notes                |
| ----------------- | ------ | -------- | -------------------- |
| Weddings          | 📋     | Medium   | High conversion      |
| Business          | 📋     | Medium   | B2B                  |
| Bar Signs         | ❌     | Low      | -                    |
| Home Decor        | 📋     | Medium   | -                    |
| Events            | ❌     | Low      | -                    |
| City-specific SEO | ❌     | -        | Not in initial scope |

---

## 6. SEO & Performance

| Feature            | Status | Notes          |
| ------------------ | ------ | -------------- |
| Meta Tags          | 📋     | -              |
| OpenGraph          | 📋     | -              |
| Sitemap Generation | 📋     | -              |
| Image Optimization | 📋     | next/image     |
| Core Web Vitals    | 📋     | -              |
| Structured Data    | 📋     | Product schema |

---

## 7. Technical Infrastructure

| Feature           | Status | Notes                        |
| ----------------- | ------ | ---------------------------- |
| Monorepo Setup    | ✅     | Turborepo + pnpm             |
| NestJS API        | ✅     | All entities done            |
| TypeORM Models    | ✅     | -                            |
| JWT Auth          | ✅     | Working                      |
| Next.js Web App   | ✅     | App Router                   |
| Next.js Admin App | ✅     | Glassmorphism UI             |
| Strapi CMS        | ✅     | Running                      |
| PostgreSQL        | ✅     | Docker                       |
| Redis             | ✅     | Docker                       |
| MinIO (S3)        | ✅     | Docker                       |
| CI/CD             | ❌     | Not started                  |
| Production Deploy | ❌     | Not started                  |
| Seed Data System  | ✅     | Admin, Products, Neon Config |

---

## 8. Priority Matrix

### P0 - Critical (MVP)

- [ ] Product Detail Page
- [ ] Checkout Flow
- [ ] Neon Configurator (basic)
- [ ] Order Management (Admin)
- [ ] Payment Integration

### P1 - High

- [ ] Product Search/Filter
- [ ] Collections
- [ ] Neon Configurator (full preview)
- [ ] Email Notifications
- [ ] Guest Checkout

### P2 - Medium

- [ ] Static Pages (About, FAQ, etc.)
- [ ] Blog
- [ ] Landing Pages (Weddings, Business)
- [ ] Neon Config CRUD (Admin)

### P3 - Low/Nice-to-have

- [ ] Analytics Dashboard
- [ ] Advanced Filtering
- [ ] Wishlist
- [ ] City-specific SEO pages

---

## 9. What We're NOT Building (vs. Original)

| Feature              | Reason                            |
| -------------------- | --------------------------------- |
| 160 Collections      | Simplified to ~10 core categories |
| 40+ City SEO Pages   | Not needed for initial launch     |
| Rental/Hire          | Business model difference         |
| Multi-region (AU/US) | Single region first               |
| 4000+ Products       | Starting with core catalog        |
| Shopify Backend      | Custom NestJS instead             |
| Logo Upload Tool     | Phase 2 (text configurator first) |

---

## 10. Progress Summary

| App   | Progress | Next Steps                |
| ----- | -------- | ------------------------- |
| API   | 85%      | Payment integration       |
| Web   | 50%      | Checkout, Configurator    |
| Admin | 50%      | Order Management          |
| CMS   | 20%      | Content types, Blog setup |

_Last updated: December 2025_
