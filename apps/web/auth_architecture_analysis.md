# Deep Dive: Auth & Architecture Analysis

## 1. System Architecture

The application follows a **Hybrid Rendering** model using Next.js App Router, integrated with an external backend service.

- **Frontend**: Next.js (App Router)
- **Backend**: External API (likely running on port 3001 locally)
- **Communication**: HTTP Requests via `api-client.ts`
- **Routing**: API Rewrites configured in `next.config.ts` proxy requests from `/api/*` to the external backend.

### Key Observation: API Rewrites

```typescript
// next.config.ts
async rewrites() {
  return [
    {
      source: "/api/:path*",
      destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/:path*`, // Proxy to backend
    },
  ];
}
```

**Impact**: This allows the frontend to call `/api/auth/me` and have the browser automatically attach `SameSite` cookies that belongs to the same domain (path), effectively bridging the CORS gap for credentials if the backend sets cookies on the domain.

## 2. Authentication Mechanism

The system relies on **HttpOnly Cookies** (specifically `access_token`) for security, coupled with JWTs.

### The Flow

1.  **Login**: User posts credentials to `/api/auth/login`.
    - Backend validates and responds with a `Set-Cookie` header (`access_token`).
    - Browser stores this cookie (HttpOnly, Secure in prod).
2.  **Request Protection (`proxy.ts`)**:

    - Next.js middleware (now `proxy.ts` in Next.js 16) intercepts requests.
    - It reads the `access_token` cookie.
    - It decodes the JWT (without signature verification) to check `exp` (expiration).
    - **Result**:
      - If expired/missing -> Redirect to `/login`.
      - If valid -> Allow request to proceed.

3.  **Data Fetching**:
    - Server Components & Client Components use `api-client.ts`.
    - `credentials: "include"` is set in fetch options, sending the `access_token` cookie to the backend rewrites.
    - Backend verifies the token signature and returns data.

### Security Analysis

- **Robustness**: High. Using HttpOnly cookies prevents XSS attacks from stealing tokens.
- **Performance**: High. `proxy.ts` handles redirects at the edge prevents rendering protected pages for unauthenticated users.
- **Validation**:
  - `proxy.ts` does a "soft" check (expiry only).
  - Backend does the "hard" check (signature).
  - This is a valid "Defense in Depth" strategy.

## 3. State Management

- **Store**: `useAuthStore` (Zustand) is used for client-side state (User profile, `isAuthenticated` flag).
- **Persistence**: Uses `localStorage` via `persist` middleware.
- **Current Gap**:
  - Relying purely on `localStorage` can lead to **desynchronization**.
  - _Example_: User manually clears cookies but `localStorage` remains -> UI shows "Logged In" -> User clicks link -> `proxy.ts` redirects to login (Jarring UX).
  - _Example_: Cookie expires -> `proxy.ts` redirects -> `localStorage` still has old user data.

## 4. Recommendations for Next.js 16+

### A. Leverage Server Components (RFC)

Move logic from Client to Server.

- **Current**: `account/page.tsx` uses `useEffect` to check auth.
- **Recommended**: Remove client-side checks. Trust `proxy.ts` to guard the route. Make the page a Server Component.
- **Benefit**: Faster load, zero-bundle-size for logic, no hydration mismatch/flash.

### B. Synchronization (CheckAuth)

Implement a "Session Sync" on app mount.

- **Where**: `ClientProviders.tsx`
- **Logic**: Run `useAuthStore.getState().checkAuth()` once on mount.
- **Why**: It calls `/api/auth/me`. If the cookie is invalid/missing, the backend returns 401. The store catches this and clears the stale `localStorage` data immediately.

### C. Proxy.ts

Continue using `src/proxy.ts`. It is correctly implemented for the Next.js 16 migration (rename from `middleware.ts`).

## 5. Implementation Plan Summary

1.  **Modify `ClientProviders.tsx`**: Add global `checkAuth`.
2.  **Refactor `account/page.tsx`**: Convert to Server Component (Remove `use client`).
3.  **Verify**: Ensure no "Flash of Loading" and correct redirects.
