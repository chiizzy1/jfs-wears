# Comprehensive Refactoring Plan

## Problem Statement

The Deep Codebase Audit revealed systematic violations of Rules 5.3 (Thin Pages), 5.6 (Data Tables), and 5.8 (Forms) across the Admin Dashboard and Account sections. To ensure long-term maintainability and adherence to the "Master Engineering Rules", a major refactor is required.

## Phased Approach

We will tackle this in phases, prioritizing the most complex violations.

### Phase 1: Critical "Fat Pages" De-bloating

Refactor the pages that contain heavy logic and manual forms.

1.  **Order Details (`src/app/admin/orders/[id]/`)**
    - Move logic to `src/components/admin/orders/OrderDetailView.tsx`.
    - Create `OrderTrackingForm.tsx` using `src/components/ui/form.tsx`, RHF, and Zod.
    - Create `OrderStatusForm.tsx` using `src/components/ui/form.tsx`, RHF, and Zod.
2.  **Account Addresses (`src/app/account/addresses/`)**
    - Move logic to `src/components/account/AddressView.tsx`.
    - Create `AddressForm.tsx` using `src/components/ui/form.tsx`, RHF, and Zod.
3.  **Categories (`src/app/admin/categories/`)**
    - Create `src/schemas/category.schema.ts` (Zod).
    - Create `src/components/admin/categories/CategoryForm.tsx` using `src/components/ui/form.tsx` and RHF.
    - Move logic to `src/components/admin/categories/CategoriesView.tsx`.
    - Replace local modal state/markup with global `useUIStore` and `src/components/ui/modal.tsx`.
    - Ensure Category form uses `src/components/ui/form.tsx` components.

### Phase 2: Storefront CMS Overhaul (High Impact)

Refactor the massive `StorefrontPage` into manageable components.

1.  **Schemas**: Create `storefront.schema.ts` for Hero and Section.
2.  **Components**:
    - Extract `HeroesTab.tsx`, `CategoryGridTab.tsx`, `CarouselsTab.tsx`.
    - Create `HeroForm.tsx` and `SectionForm.tsx` using Shadcn Form + RHF.
3.  **View**: Move main logic to `StorefrontView.tsx`.

### Phase 3: Data Table Standardization

Extract column definitions to enforcing separation of concerns.

1.  **Orders**: Create `orders-columns.tsx`, Refactor `OrdersTable.tsx`.
2.  **Staff**: Create `staff-columns.tsx`, Refactor `StaffTable.tsx`.
3.  **Promotions**: Create `promotions-columns.tsx`, Refactor `PromotionsTable.tsx`.
4.  **Customers**: Create `customers-columns.tsx`, Refactor `CustomersTable.tsx`.

### Phase 4: Type Safety & Cleanup

Eliminate technical debt.

1.  **Service Layer**: Fix `products.service.ts` to use DTOs instead of `any`.
2.  **Product Forms**: Remove `any` cast in `ProductFormV2.tsx`.
3.  **Global UI**: Ensure all new modals usage leverages `ui-store`.

### Phase 5: Public Pages Verification (Track/Checkout)

Ensure public facing pages meet the same standard.

1.  **Track Page**:
    - Create `TrackOrderView.tsx` and `TrackOrderForm.tsx`.
    - Move API logic to `useTrackOrder` hook.
    - Replace manual input with Shadcn Form.
2.  **Reset Password**:
    - Refactor `ResetPasswordPage` to be a pure wrapper.
    - Move verification logic to `ResetPasswordView.tsx`.

## Verification Plan

### Automated

- `npx tsc --noEmit`: Ensure 0 type errors.
- `npm run build`: Ensure clean build.

### Manual Rules Checklist

For each refactored component:

- [ ] Is `page.tsx` < 50 lines?
- [ ] Are inputs using strictly `src/components/ui/form.tsx` components (`FormField`, `FormItem`, etc.)?
- [ ] Is validation handled via Zod schema (in `src/schemas/`)?
- [ ] Are columns in a separate file (e.g., `src/components/.../[feature]-columns.tsx`)?
- [ ] Is `style` done via tailwind classes only?
