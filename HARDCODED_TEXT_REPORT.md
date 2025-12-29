# Hardcoded Text Analysis Report

**Date:** 2025-12-29
**Project:** King Neon
**Scope:** `apps/web` and `apps/admin`

## Executive Summary

A scan of the codebase reveals significant hardcoded text strings across both the user-facing web application (`apps/web`) and the admin dashboard (`apps/admin`).

- **`apps/web`**: Heavily hardcoded in English, with a critical inconsistency in the 404 page (hardcoded Vietnamese). The checkout, authentication, and account management flows are almost entirely hardcoded English.
- **`apps/admin`**: The main dashboard (`page.tsx`) uses i18n, but inner pages (Orders, Products) revert to hardcoded English.
- **Duplicate Admin**: An admin section exists within `apps/web/src/app/admin`, seemingly distinct from the standalone `apps/admin` application.

## Detailed Findings

### 1. Web Application (`apps/web`)

#### ⚠️ Critical Issues

- **Language Mismatch**: `apps/web/src/app/not-found.tsx` is hardcoded in **Vietnamese**, while the rest of the app is **English**.
- **Hardcoded Locale**: `apps/web/src/app/layout.tsx` hardcodes `<html lang="en">` and `locale: "en_US"` in metadata, ignoring the `vi` support defined in `i18n/settings.ts`.

#### 🛒 Checkout & Order Flow

- **`src/app/checkout/page.tsx`**:
  - Titles: "Checkout", "Order Summary".
  - Labels: "First Name", "Last Name", "Email", "Phone", "Street Address", "City", "State", "ZIP Code", "Country".
  - Options: "United States", "Vietnam", "Australia", etc.
  - Financials: "Subtotal", "Shipping", "Tax (10%)", "Total".
- **`src/app/checkout/success/page.tsx`**: "Thank You for Your Order!", "Order Number:", "Processing Time", "Email Confirmation".
- **`src/components/CartSidebar/CartSidebar.tsx`**: "Your cart is empty", "Subtotal", "Shipping", "Total".
- **`src/components/PaymentForm/PaymentForm.tsx`**: "Processing...", "Secure payment powered by Stripe".

#### 👤 User Account & Auth

- **`src/app/(auth)/login/page.tsx`**: "Welcome Back", "Email", "Password", "Forgot password?", "Sign in", "or continue with".
- **`src/app/(auth)/register/page.tsx`**: "Create Account", "Confirm Password", "Already have an account?".
- **`src/app/account/page.tsx`**: "Profile Settings", "Order History", "My Designs", "No orders yet".
- **`src/app/account/designs/page.tsx`**: "No saved designs yet", "Loading...".

#### 🛍️ Product & Catalog

- **`src/app/products/[slug]/ProductDetailClient.tsx`**:
  - "Product Not Found", "Loading product...".
  - Badges: "Customizable".
  - Features: "Premium Quality", "Free Shipping", "Easy Installation".
  - Labels: "Quantity".
- **`src/components/NeonDesigner/NeonDesigner.tsx`**: "Create Your Neon Sign", "Total", placeholder "Enter your text...".
- **`src/components/NeonConfigurator3D/index.tsx`**: Labels ("Mode", "Text", "Align", "Size"), Options ("Original + Glow").
- **`src/components/RelatedProducts`**: "You May Also Like".
- **`src/components/FeaturedProducts`**: "Featured Products", "No featured products available".

#### 🧩 Components & Layout

- **`src/components/Header/Header.tsx`**: "KING NEON".
- **`src/components/Footer/Footer.tsx`**: "KING NEON", aria-labels ("Facebook", "Instagram").
- **`src/components/Shared/ImageUpload.tsx`**: "Click to upload", alt="Uploaded".
- **`src/app/layout.tsx`**: All SEO metadata (`title`, `description`, `keywords`) is hardcoded in English.

### 2. Admin Application (`apps/admin`)

#### 📄 Pages

- **`src/app/products/create/page.tsx`**: "Create New Product", "Media", "Status", "Pricing", "Active Status".
- **`src/app/products/edit/[id]/page.tsx`**: "Edit Product", "Update product information".
- **`src/app/orders/[id]/page.tsx`**: "Customer Details", "Shipping Address", "Manage Order", "Subtotal".
- **`src/app/categories/create/page.tsx`**: "Active", "Cancel".
- **`src/app/preview-backgrounds/page.tsx`**: "Preview Backgrounds", "Add New Background", "Inactive".
- **`src/app/not-found.tsx`**: Hardcoded in **Vietnamese** ("Trang không tìm thấy"), inconsistent with the rest of the dashboard which uses English strings mostly (or i18n).

#### 🧩 Components

- **`src/components/ui/pagination.tsx`**: "Previous", "Next", "More pages".
- **`src/components/ImageUpload.tsx`**: "Drag and drop images here", "Or add image URL manually".

## Action Plan

1.  **Consolidate Strings**: Move all hardcoded strings to `public/locales/{en,vi}/*.json`.
2.  **Implement `useTranslation`**: Replace text with `t('key')` in components.
3.  **Fix 404 & Metadata**: Prioritize standardizing the 404 page and making metadata dynamic based on locale.
4.  **Resolve Admin Duplication**: Clarify the role of `apps/web/src/app/admin` vs `apps/admin`.
