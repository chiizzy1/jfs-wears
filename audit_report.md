# Deep Codebase Audit Report

## Executive Summary

A comprehensive scan of the `apps/web` codebase reveals systematic violations of the project's Engineering Rules, particularly concerning **Page Architecture (Rule 5.3)**, **Data Table Structure (Rule 5.6)**, and **Type Safety (Rule 6.1)**. While recent components like `ProductFormV2` show adoption of correct patterns, older or parallel implementations consistently deviate.

## 1. Critical Architectural Violations

### "Fat Pages" (Rule 5.3 Violation)

**Rule**: Pages should be thin shells for metadata and top-level layout. Logic must reside in Feature Components.
**Findings**:

- `src/app/account/addresses/page.tsx`: **Severe**. Contains ~350 lines of full CRUD logic, manual form state, and UI rendering.
- `src/app/admin/orders/[id]/page.tsx`: **Severe**. Contains ~400 lines of data fetching, edit state management, and manual forms.
- `src/app/admin/categories/page.tsx`: **Moderate**. Manage modals and forms locally.
- `src/app/admin/staff/page.tsx`: **Moderate**. Manages modal state locally.
- `src/app/admin/promotions/page.tsx`: **Moderate**. Manages modal state and delete handlers locally.
- `src/app/admin/storefront/page.tsx`: **Critical**. ~1000 lines. Manual forms, inline modals, mixed concerns.
- `src/app/track/page.tsx`: **Critical**. ~350 lines. Manual `<form>`, `<input>`, inline API fetching, inline UI logic.
- `src/app/reset-password/page.tsx`: **Moderate**. Manual `useState` and `apiClient` calls. Wraps a `ResetPasswordForm` but handles token verification logic inline.

### Data Table Architecture (Rule 5.6 Violation)

**Rule**: Tables must use `[Feature]Columns.tsx` for definitions and separate View/Controller components.
**Findings**:

- `src/components/admin/customers/`: Missing `CustomersColumns.tsx`. Columns defined inline in `CustomersTable.tsx`.
- `src/components/admin/promotions/`: Missing `PromotionsColumns.tsx`.
- `src/components/admin/staff/`: Missing `StaffColumns.tsx`.
- `src/components/admin/orders/OrdersTable.tsx`: Columns defined inline.

### Modal Management (Rule 5.5 Violation)

**Rule**: Use global `useUIStore` for modals, avoid local `useState`.
**Findings**:

- `CategoriesPage`, `StaffPage`, `PromotionsPage` all use `const [isModalOpen, setIsModalOpen] = useState(false)`.

## 2. Form Pattern Violations (Rule 5.8)

**Rule**: All inputs must use `react-hook-form` + `zod`.
**Findings**:

- `src/app/account/addresses/page.tsx`: Uses manual `input` bindings (`value={formData.firstName}`).
- `src/app/admin/orders/[id]/page.tsx`: Uses manual `select` and `input` for status/tracking updates.
- `src/components/admin/products/ProductFormV2.tsx`: Uses `resolver: zodResolver(schema) as any`. (Minor TS violation).

## 3. Type Safety Violations (Rule 6.1)

**Rule**: No `any`. Strict Mode enabled.
**Findings**:

- `src/services/products.service.ts`: `createProduct` accepts `data: any`.
- `src/components/admin/products/ProductEditClient.tsx`: Extensive use of `any` in maps (`t: any`, `v: any`).
- `src/components/admin/products/ProductFormV2.tsx`: Explicit `any` cast on resolver.
- `src/components/admin/profile/AdminPasswordForm.tsx`: Contains `any` usage.

## 4. Recommendations & Priorities

1.  **Refactor "Fat Pages" (High)**:

    - Extract logic from `AddressesPage`, `OrderDetailsPage`, and `TrackPage` immediately.
    - Create `AddressView`, `OrderDetailView`, and `TrackOrderView` components.
    - Decouple `StorefrontPage` into feature components.

2.  **Standardize Tables (Medium)**:

    - Extract columns for Orders, Staff, Promotions, and Customers.

3.  **Fix Forms (High)**:

    - Rewrite Address and Order update forms using RHF/Zod.

4.  **Strict Typing (High)**:
    - Eliminate `any` from Service layer first, then Components.
