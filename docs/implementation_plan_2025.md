# Implementation Plan: 2025 Standard Features Upgrade

## Goal Description

Implement the three critical "Vibe Enhancements" identified in the gap analysis to bring `jfs-wears` up to modern 2025 e-commerce standards. The goal is to increase **Average Order Value (AOV)** via Related Products, **Customer Retention** via Newsletters, and **Conversion Rate** via Advanced Search.

**Protocol**: Safety First (Component First -> Verify -> Integrate).
**Design**: "Sharp Edge" Premium Aesthetic (No rounded corners, clean lines).

## User Review Required

> [!IMPORTANT] > **Newsletter Integration**: This plan assumes we will store email subscribers in the local Database first (new `NewsletterSubscriber` model). Do you want to integrate an external provider (e.g., Resend Audiences, Mailchimp) immediately, or start with DB storage? **Plan defaults to DB Storage + Resend API Preparation.**

## Proposed Changes

### Phase 1: Related Products (Cross-Sell)

_Logic: Show products in the same category, excluding the current product._

#### Backend (`apps/api`)

- **[MODIFY]** `src/modules/products/products.service.ts`: Add `findRelated(id: string, categoryId: string, limit: number)` method.
- **[MODIFY]** `src/modules/products/products.controller.ts`: Add endpoint `GET /:id/related`.

#### Frontend (`apps/web`)

- **[NEW]** `src/components/storefront/RelatedProducts.tsx`:
  - Usage of `ProductCard` (existing).
  - specialized layout (carousel or grid).
- **[MODIFY]** `src/lib/api.ts`: Add `fetchRelatedProducts` function.
- **[MODIFY]** `src/app/product/[slug]/page.tsx`: Integrate `RelatedProducts` component below Reviews.

### Phase 2: Newsletter & Marketing (Retention)

_Logic: Pop-up on first visit (cookies) or footer input._

#### Backend (`apps/api`)

- **[NEW]** `src/modules/newsletter/`: New module.
- **[NEW]** `src/modules/newsletter/newsletter.controller.ts`: `POST /subscribe`.
- **[NEW]** `src/modules/newsletter/newsletter.service.ts`: Handle duplicate checks and DB creation.
- **[MODIFY]** `prisma/schema.prisma`: Add `NewsletterSubscriber` model.

#### Frontend (`apps/web`)

- **[NEW]** `src/components/common/NewsletterPopup.tsx`:
  - Uses `Dialog` (Shadcn) but styled with **Sharp Corners**.
  - LocalStorage check to show only once per session/user.
- **[MODIFY]** `src/app/layout.tsx`: Mount `NewsletterPopup` (Client Component).

### Phase 3: Advanced Search & Filtering (Conversion)

_Logic: Allow simultaneous filtering of Size + Color + Price._

#### Backend (`apps/api`)

- **[MODIFY]** `src/modules/products/products.service.ts`:
  - Refactor `findAll` usage of `where`.
  - Implement `variants: { some: { AND: [{ size: ... }, { color: ... }] } }` logic for accurate filtering.

#### Frontend (`apps/web`)

- **[MODIFY]** `src/components/search/SearchFilters.tsx`:
  - Update UI to allow multi-select (Checkbox vs Radio) for sizes/colors if not already supported.
  - Ensure URL query params are generated correctly (e.g. `?size=M,L&color=Red`).

## Verification Plan

### Automated Tests

- **Backend**: Unit tests for `findRelated` ensuring it excludes the current ID.
- **Backend**: Unit tests for `findAll` ensuring filters return correct subset of products.

### Manual Verification

1.  **Related Products**:
    - Go to a Product Page.
    - Verify "Related Items" section appears.
    - Verify items are from same category.
    - Verify current product is NOT in the list.
2.  **Newsletter**:
    - Clear Cookies/Storage.
    - Refresh Homepage.
    - Verify Popup appears.
    - Submit email -> Check DB/Admin.
    - Refresh -> Verify Popup does NOT appear again.
3.  **Search**:
    - Filter by "Size: XL" AND "Color: Black".
    - Verify ONLY products with an ACTIVE Black/XL variant are shown.
