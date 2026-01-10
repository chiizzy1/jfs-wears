# Antigravity IDE: Master Engineering Rules & Best Practices

---

## 1. Core Principles

### 1.1 The "Explore, Plan, Code, Commit" Workflow

**IMPORTANT**: You MUST follow this workflow for EVERY task:

1. **EXPLORE** - Read and understand relevant files, documentation, and context. Do NOT write any code during this phase.
2. **PLAN** - Create a detailed implementation plan. Present this to the user for approval.
3. **CODE** - Only after approval, implement the solution following all standards.
4. **COMMIT** - Make atomic, well-documented commits after verification.

> [!CAUTION]
> NEVER start coding without explicit user approval of your plan. This is NON-NEGOTIABLE.

### 1.2 Fundamental Engineering Principles

You MUST adhere to these principles at ALL times:

#### DRY (Don't Repeat Yourself)

- Extract repeated logic into reusable functions, utilities, or components
- Create shared constants for values used in multiple places
- Use inheritance, composition, or mixins to share behavior
- If you copy-paste code more than once, STOP and refactor
- Document in CLAUDE.md or project docs where reusable utilities exist

#### SOLID Principles

- **S**ingle Responsibility: Each module/class/function should have ONE reason to change
- **O**pen/Closed: Open for extension, closed for modification
- **L**iskov Substitution: Derived classes must be substitutable for base classes
- **I**nterface Segregation: Many specific interfaces are better than one general interface
- **D**ependency Inversion: Depend on abstractions, not concretions

#### KISS (Keep It Simple, Stupid)

- Prefer simple, readable solutions over clever ones
- Avoid premature optimization
- If a solution requires extensive comments to explain, it's too complex
- Break complex logic into smaller, named functions

#### YAGNI (You Aren't Gonna Need It)

- Implement only what is explicitly requested
- Do NOT add features "just in case"
- Do NOT create abstractions until you have at least 2-3 concrete use cases
- Ask the user before adding anything beyond the request

#### Separation of Concerns

- Keep UI logic separate from business logic
- Keep data access separate from business logic
- Keep configuration separate from code
- Each file should have a clear, single purpose

### 1.3 Required Tech Stack

You MUST use the following technologies for this project. Do not deviate without explicit approval.

- **Framework**: Next.js (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v4 + Utility Classes (`cn` helper)
- **UI Library**: Radix UI Primitives + Lucide React + Custom Shadcn-like components
- **State Management**: Zustand (Global) + React Query (Server State)
- **Forms**: React Hook Form + Zod Resolution
- **Animations**: GSAP or Framer Motion
- **Wallet**: Solana Wallet Adapter (only if building a dApp on solana)

---

## 2. Mandatory Planning Phase

### 2.1 Pre-Implementation Research

Before ANY implementation, you MUST:

1. **Read existing code** that relates to the task
2. **Understand the current architecture** and patterns used
3. **Identify dependencies** that will be affected
4. **Check for existing utilities** that can be reused
5. **Research best practices** for the specific technology or pattern
6. **List all files** that will need to be created or modified

### 2.2 Implementation Plan Document

For EVERY task that involves code changes, create an `implementation_plan.md` in the artifacts directory with:

```markdown
# [Feature/Fix Name]

## Problem Statement

[Clear description of what needs to be done and why]

## Proposed Solution

[High-level approach to solving the problem]

## Affected Components

- [List each file/module that will be modified or created]
- [Indicate whether it's NEW, MODIFY, or DELETE]

## Detailed Changes

### Component 1: [Name]

- [Specific change 1]
- [Specific change 2]

### Component 2: [Name]

- [Specific change 1]
- [Specific change 2]

## API Changes (if applicable)

- [List any API endpoint changes]
- [List any contract changes]

## Database Changes (if applicable)

- [List any schema changes]
- [List any migration requirements]

## Dependencies

- [New packages to install]
- [Packages to update]
- [Packages to remove]

## Testing Strategy

- [How will you verify the implementation works?]
- [What tests will you write/modify?]

## Rollback Plan

- [How to undo these changes if needed]

## Questions for User

- [Any clarifications needed before proceeding]
```

### 2.3 Scope Assessment

Before starting work, ALWAYS assess and communicate:

| Scope        | Description                     | User Approval Required                    |
| ------------ | ------------------------------- | ----------------------------------------- |
| **Trivial**  | Typo fixes, comment updates     | No                                        |
| **Small**    | Single file change, < 20 lines  | Ask first                                 |
| **Medium**   | 2-5 files, < 100 lines          | Plan required                             |
| **Large**    | 5+ files, architectural changes | Detailed plan + approval                  |
| **Critical** | Database/API/Security changes   | Detailed plan + explicit written approval |

---

## 3. User Approval Protocol

### 3.1 What Requires Approval

**ALWAYS wait for explicit user approval before:**

1. Writing or modifying any code files
2. Running any command that modifies state (npm install, database migrations, etc.)
3. Creating new files or directories
4. Deleting any files
5. Modifying configuration files
6. Making any API or database changes
7. Installing or updating dependencies
8. Making any changes outside the current task scope

### 3.2 How to Request Approval

When requesting approval, ALWAYS:

1. Present the implementation plan clearly
2. List ALL files that will be created, modified, or deleted
3. Explain the rationale behind key decisions
4. Highlight any risks or trade-offs
5. Ask specific questions if you need clarification
6. Wait for explicit "yes", "approved", "proceed", or similar confirmation

### 3.3 Handling Ambiguity

If the user's request is ambiguous or unclear:

1. **DO NOT assume** - Ask for clarification
2. **Present options** - Give the user choices with pros/cons
3. **Suggest a default** - Recommend a path but let user decide
4. **Document assumptions** - If you must make assumptions, document them explicitly

> [!IMPORTANT]
> When in doubt, ASK. It is ALWAYS better to ask a clarifying question than to implement the wrong thing.

---

## 4. Code Quality Standards

### 4.1 Naming Conventions

#### Variables and Functions

- Use descriptive, meaningful names that explain purpose
- Use camelCase for JavaScript/TypeScript variables and functions
- Use PascalCase for classes and React components
- Use SCREAMING_SNAKE_CASE for constants
- Prefix boolean variables with `is`, `has`, `should`, `can`
- Prefix event handlers with `handle` or `on`
- Prefix async functions with action verbs (fetch, load, get, create, update, delete)

```typescript
// ✅ GOOD
const isUserAuthenticated = true;
const handleFormSubmit = () => {};
const fetchUserProfile = async () => {};
const MAX_RETRY_ATTEMPTS = 3;

// ❌ BAD
const auth = true;
const submit = () => {};
const userData = async () => {};
const max = 3;
```

#### Files and Directories

- Use kebab-case for file names: `user-profile.tsx`, `api-client.ts`
- Group related files in directories: `components/`, `hooks/`, `utils/`
- Name test files with `.test.ts` or `.spec.ts` suffix
- Name type definition files with `.types.ts` or `.d.ts` suffix

### 4.2 Code Formatting

- Use consistent indentation (2 or 4 spaces, NEVER tabs)
- Maximum line length: 100-120 characters
- Use Prettier or similar formatter configuration
- Add blank lines between logical sections
- No trailing whitespace
- Always use semicolons (for JavaScript/TypeScript)
- Use single quotes for strings (unless project convention differs)

### 4.3 Code Organization Within Files

Every file should follow this structure:

```typescript
// 1. Imports (grouped and ordered)
// - External libraries first
// - Internal modules second
// - Types/interfaces third
// - Styles/assets last

// 2. Type definitions (if not in separate file)

// 3. Constants

// 4. Helper functions (private/internal)

// 5. Main export (component, class, or function)

// 6. Secondary exports (if any)
```

### 4.4 Function Design

- Functions should do ONE thing
- Functions should be short (ideally < 30 lines)
- Maximum 3-4 parameters; use objects for more
- Avoid side effects where possible
- Return early for error conditions
- Use meaningful parameter names
- Document complex functions with JSDoc comments

```typescript
// ✅ GOOD
function calculateTotalPrice(items: CartItem[], discountCode?: string): number {
  if (!items.length) return 0;

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = discountCode ? getDiscountAmount(discountCode, subtotal) : 0;

  return subtotal - discount;
}

// ❌ BAD
function calc(i: any[], d: any) {
  let t = 0;
  for (let x = 0; x < i.length; x++) {
    t += i[x].price * i[x].quantity;
  }
  if (d) {
    // complex discount logic inline
  }
  return t;
}
```

### 4.5 Error Handling

- Always handle errors explicitly
- Use try-catch for async operations
- Provide meaningful error messages
- Log errors with context (file, function, relevant data)
- Implement proper error boundaries in React
- Never silently swallow errors
- Create custom error classes for domain-specific errors

```typescript
// ✅ GOOD
async function fetchUserData(userId: string): Promise<User> {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`[fetchUserData] Failed to fetch user ${userId}:`, error);
    throw new UserFetchError(`Unable to fetch user data for ${userId}`, { cause: error });
  }
}

// ❌ BAD
async function fetchUserData(userId: string) {
  const response = await api.get(`/users/${userId}`);
  return response.data;
}
```

### 4.6 Comments and Documentation

Write comments that explain **WHY**, not **WHAT**:

```typescript
// ❌ BAD - explains what the code does (obvious from reading it)
// Increment counter by 1
counter++;

// ✅ GOOD - explains why this is necessary
// Increment counter to track retry attempts for rate-limiting backoff
counter++;
```

Required comments:

- Complex business logic
- Workarounds for bugs or limitations
- Non-obvious performance optimizations
- API contracts and interfaces
- Public functions and classes (JSDoc)

---

## 5. Project Structure Standards

### 5.1 Tech Stack Overview

- **Framework**: Next.js (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v4 + Utility Classes (`cn` helper)
- **UI Library**: Radix UI Primitives + Lucide React + Shadcn components + Custom Shadcn-like components (for custom UI)
- **State Management**: Zustand (Global), React Query (Server State)
- **Forms**: React Hook Form + Zod Resolution
- **Animations**: GSAP OR Framer Motion
- **Tables**: TanStack Table (React Table)

### 5.2 Specific Project Structure (Next.js App Router)

The project follows a **Feature-First** architecture for components, keeping related logic close, while separating cross-cutting concerns (services, schemas).

```
src/
├── app/                 # Next.js App Router pages
├── components/
│   ├── [feature]/       # Feature-specific components (e.g., bills, auth, dashboard)
│   │   ├── [Feature]Form.tsx
│   │   └── common/      # Feature-local shared components
│   └── ui/              # Reusable UI primitives (Buttons, Inputs, etc.)
├── hooks/               # Custom hooks (business logic & UI logic)
├── lib/                 # Utilities and libraries (utils.ts, solanatx.ts)
├── schemas/             # Zod validation schemas (Centralized)
├── services/            # API interaction layer (Decoupled from UI)
├── stores/              # Zustand global stores
├── types/               # TypeScript type definitions (apiResponses.ts, etc.)
└── utils/               # Helper functions
```

### 5.3 Pages vs. Components (Crucial Pattern)

**Rule**: Keep `src/app` files **thin**.

- `page.tsx`: Should primarily handle **Metadata** and render a **Client Component** (e.g., `<DashboardView />`).
- **Logic Location**: Move actual page logic, state, and heavy UI into `src/components/[feature]/`.
- **Why**: Keeps routing clean and separates distinct client/server concerns.

### 5.4 Core Patterns & Implementations

### 5.5 Modals (Global Management)

**Pattern**: Do NOT create local modal state in pages. Use the global `useUIStore`.

- **Component**: `src/components/ui/Modal.tsx`
- **Store**: `src/stores/uiStore.ts`
- **Usage**:
  ```typescript
  const { openModal } = useUIStore();
  // Trigger
  openModal("my-modal-id", <MyModalContent />);
  ```

### 5.6 Data Tables (Professional Setup)

**Pattern**: Use **TanStack Table** (Headless) + Custom UI.

- **Location**: `src/components/dashboard/[feature]/DataTable.tsx`
- **Components**:
  - `DataTable.tsx`: The UI shell (renders headers/rows).
  - `[Feature]Columns.tsx`: Use `createColumnHelper` to define columns.
  - `[Feature]Card.tsx`: The Controller. Initializes `useReactTable` and passes state to `DataTable`.
- **Responsive**: **MUST** implement a separate list view (e.g., `MobileActivityItem`) for mobile screens. Do not try to squash the table.

### 5.7 Sidebars (Shadcn Composition)

**Pattern**: Use the Composable Sidebar UI primitives.

- **Primitives**: `src/components/ui/sidebar.tsx` (Context-based).
- **Implementation**: See `DashboardSidebar.tsx`.
- **Structure**:
  ```tsx
  <Sidebar>
    <SidebarContent>
      <SidebarGroup>
        <SidebarMenu>
          {items.map(item => <SidebarMenuItem ... />)}
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
  </Sidebar>
  ```
- **Configuration**: Define menu items in `src/constants/index.ts`, do not hardcode in the component.

### 5.8 Forms (Zod + RHF)

**Strict Rule**: All inputs must be controlled via `react-hook-form` and validated with `zod`.

1.  **Schema**: Defined in `src/schemas/`.
2.  **Service**: Defined in `src/services/`.
3.  **Component**: Uses `useForm({ resolver: zodResolver(schema) })`.

### 5.9 Global State (Zustand)

**Pattern**: Use small, focused stores in `src/stores/`.

1.  **Creation**: Use `create<State>()(devtools(...))`.
2.  **Persistence**: For user settings (theme, defaults), use `persist` middleware with `createJSONStorage`.
    ```typescript
    // Example: src/stores/settingsStore.ts
    export const useSettingsStore = create<SettingsState>()(
      devtools(
        persist(
          (set) => ({ ... }),
          { name: "settings-store", storage: createJSONStorage(() => sessionStorage) }
        )
      )
    );
    ```
3.  **Usage**: Select specific state slices to avoid unnecessary re-renders.
    ```typescript
    const { toggle } = useStore((state) => ({ toggle: state.toggle }));
    ```

### F. Middleware & Authentication (Route Protection)

**Strategy**: Middleware performs **Lightweight Checks** with **Backend Verification**.

- **File**: `src/middleware.ts`
- **Logic**:
  1.  Reads `auth_token` cookie.
  2.  Checks expiration using `isTokenExpired()` (from `src/lib/jwt.ts`).
  3.  Redirects unauthenticated users to protected routes.
  4.  Attaches `X-Auth-Invalid` header if prompt re-login is needed.
- **Rules**:
  - Middleware does **NOT** verify signatures (costly). Backend APIs verify signatures.
  - Protect all `/dashboard` or `/admin` routes.
  - Use `src/lib/jwt.ts` for safe decoding (base64) checks.

### G. Server-Side Authentication (components & APIs)

**Pattern**: Use `src/lib/serverAuth.ts` for auth in Server Components or API routes.

- **Helpers**:
  - `getServerUser()`: Returns strictly typed `AuthUser` or `null`. Checks cookies + expiry.
  - `requireAuth()`: Throws error if user is invalid (good for Layouts/Pages).
  - `getJWTPayload()`: Access raw JWT fields safely.
- **Usage**:
  ```typescript
  // In a Server Component
  import { getServerUser } from "@/lib/serverAuth";
  const user = await getServerUser();
  if (!user) redirect("/login");
  ```
- **Note**: Like middleware, this reads the cookie but assumes signature validity is enforced by backend API calls.

### 5.10 Layer Separation (Where code goes)

| Layer        | Path            | Purpose           | Rule                                                                  |
| :----------- | :-------------- | :---------------- | :-------------------------------------------------------------------- |
| **Services** | `src/services/` | API Calls (fetch) | **Pure JS/TS**. Return typed Promises. NO Hooks. Error handling here. |
| **Hooks**    | `src/hooks/`    | Reusable Logic    | Encapsulate complex `useEffect` or logic shared across components.    |
| **Lib**      | `src/lib/`      | Utilities         | Pure functions (date formatting, string manipulation, `cn`).          |
| **Stores**   | `src/stores/`   | Global State      | Zustand stores for data needed across the app (Auth, UI, Settings).   |

### 5.11 Development Checklist

1.  **New Page**: Create `app/.../page.tsx` -> Import Client Component from `src/components`.
2.  **New Feature**:
    - Add types in `src/types`.
    - Create service in `src/services`.
    - Create Zod schema in `src/schemas`.
    - Build isolated components in `src/components`.
3.  **Styling**: Use Tailwind. Use `cn()` to merge classes. Use `cva` for variants.

### 5.12 Feature Component Pattern

- **Location**: Place feature code in `src/components/[feature]/`.
- **Pattern**: Functional Components with named exports (mostly) or default exports.
- **Styling**: `className` prop with `cn(...)` utility for merging Tailwind classes.
- **Rule**: Do not inline complex logic. Extract to custom hooks or services.

### 5.13 Component Organization

```
components/
├── ui/                      # Primitive UI components (Button, Input, Card)
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   ├── Button.styles.ts
│   │   └── index.ts
│   └── ...
├── layout/                  # Layout components (Header, Footer, Sidebar)
├── forms/                   # Form-related components
├── data-display/            # Tables, lists, cards
└── feedback/                # Modals, alerts, toasts
```

### 5.14 File Naming Conventions

| Type       | Convention                      | Example                 |
| ---------- | ------------------------------- | ----------------------- |
| Components | PascalCase                      | `UserProfile.tsx`       |
| Hooks      | camelCase with `use` prefix     | `useAuth.ts`            |
| Utilities  | camelCase                       | `formatDate.ts`         |
| Constants  | camelCase or kebab-case         | `api-endpoints.ts`      |
| Types      | PascalCase with `.types` suffix | `user.types.ts`         |
| Tests      | Same name with `.test` suffix   | `UserProfile.test.tsx`  |
| Styles     | Same name with `.styles` suffix | `UserProfile.styles.ts` |
| Stores     | camelCase with `-store` suffix  | `auth-store.ts`         |

---

### 6. Testing & Verification

### 6.1 Testing Requirements

Before marking any task complete, you MUST:

1. **Verify the code compiles** - Run type checking
2. **Run existing tests** - Ensure no regressions
3. **Test the feature manually** - Verify it works as expected
4. **Check for console errors** - No warnings or errors
5. **Test edge cases** - Empty states, error states, boundary conditions

### 6.2 Test Coverage Rules

| Complexity         | Minimum Coverage |
| ------------------ | ---------------- |
| Utility functions  | 100%             |
| Business logic     | 90%              |
| API integrations   | 80%              |
| UI components      | 70%              |
| E2E critical paths | 100%             |

### 6.3 Testing Checklist

For EVERY implementation, verify:

```markdown
- [ ] TypeScript compiles without errors
- [ ] All existing tests pass
- [ ] New tests written for new functionality
- [ ] Manual testing completed
- [ ] Edge cases tested
- [ ] Error handling tested
- [ ] Loading states tested
- [ ] Empty states tested
- [ ] Performance acceptable
- [ ] Accessibility maintained
```

### 6.4 Test Structure

```typescript
describe("ComponentName", () => {
  // Setup and teardown
  beforeEach(() => {});
  afterEach(() => {});

  // Group by functionality
  describe("when rendering", () => {
    it("should display initial state correctly", () => {});
    it("should handle empty data", () => {});
  });

  describe("when user interacts", () => {
    it("should handle click events", () => {});
    it("should validate input", () => {});
  });

  describe("when fetching data", () => {
    it("should show loading state", () => {});
    it("should handle success", () => {});
    it("should handle errors", () => {});
  });
});
```

---

## 7. Documentation Standards

### 7.1 README Requirements

Every project MUST have a README.md with:

```markdown
# Project Name

Brief description of the project.

## Quick Start

Step-by-step instructions to run the project locally.

## Prerequisites

- Required software and versions
- Required environment variables

## Installation

Exact commands to install dependencies and setup.

## Development

Commands for development workflow.

## Testing

Commands to run tests.

## Deployment

How to deploy to staging/production.

## Architecture

High-level overview of project structure.

## Contributing

Guidelines for contributing.
```

### 7.2 Code Documentation (JSDoc)

Document ALL:

- Public functions
- Public classes
- Exported interfaces/types
- Complex business logic
- API endpoints

```typescript
/**
 * Fetches paginated products with optional filtering.
 *
 * @param options - Query options for filtering and pagination
 * @param options.category - Filter by category slug
 * @param options.minPrice - Minimum price filter
 * @param options.maxPrice - Maximum price filter
 * @param options.page - Page number (1-indexed)
 * @param options.limit - Items per page (max: 100)
 *
 * @returns Promise containing products array and pagination metadata
 *
 * @throws {ValidationError} When pagination params are invalid
 * @throws {NetworkError} When API is unreachable
 *
 * @example
 * const result = await fetchProducts({ category: 'shoes', page: 1, limit: 20 });
 * console.log(result.products, result.totalPages);
 */
async function fetchProducts(options: ProductQueryOptions): Promise<ProductsResponse> {
  // Implementation
}
```

### 7.3 Architecture Decision Records (ADRs)

For significant architectural decisions, create ADRs:

```markdown
# ADR-001: Use React Query for Server State

## Status

Accepted

## Context

Need a solution for managing server state, caching, and synchronization.

## Decision

Use React Query (TanStack Query) for all server state management.

## Consequences

- Pros: Built-in caching, refetching, optimistic updates
- Cons: Additional dependency, learning curve

## Alternatives Considered

- Redux with RTK Query
- SWR
- Custom solution
```

---

## 8. Git & Version Control

### 8.1 Commit Messages

Use Conventional Commits format:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `test`: Adding or modifying tests
- `chore`: Maintenance tasks, dependencies, etc.

**Examples:**

```
feat(auth): add password reset functionality

Implemented password reset flow with email verification.
- Added reset password API endpoint
- Created reset password UI components
- Added email template for reset link

Closes #123
```

### 8.2 Branch Naming

```
<type>/<ticket-number>-<short-description>

Examples:
feature/PROJ-123-user-authentication
bugfix/PROJ-456-fix-cart-calculation
hotfix/PROJ-789-security-patch
refactor/PROJ-101-cleanup-api-layer
```

### 8.3 Git Workflow Rules

1. **Never commit directly to main/master**
2. **Create feature branches for all work**
3. **Write atomic commits** - Each commit should be a complete, working change
4. **Keep commits small** - Easy to review and revert if needed
5. **Squash commits before merging** - Clean history
6. **Update main/master frequently** - Avoid large merge conflicts

### 8.4 Pre-Commit Checklist

Before EVERY commit:

```markdown
- [ ] Code compiles without errors
- [ ] All tests pass
- [ ] No console.log statements (unless intentional)
- [ ] No commented-out code
- [ ] No TODO/FIXME (unless tracked in issue)
- [ ] Commit message follows convention
- [ ] Changes are atomic and focused
```

---

## 9. Performance & Optimization

### 9.1 Performance Principles

- **Measure first** - Don't optimize without data
- **Optimize the critical path** - Focus on user-facing performance
- **Lazy load non-critical resources** - Code splitting, dynamic imports
- **Cache appropriately** - Use caching at every layer
- **Minimize bundle size** - Tree shaking, dead code elimination

### 9.2 React-Specific Performance

```typescript
// ✅ Memoize expensive calculations
const expensiveResult = useMemo(() => computeExpensiveValue(data), [data]);

// ✅ Memoize callbacks passed to children
const handleClick = useCallback(() => {
  // handler logic
}, [dependencies]);

// ✅ Use React.memo for pure components
const ProductCard = React.memo(({ product }: Props) => {
  return <div>{product.name}</div>;
});

// ✅ Lazy load routes and heavy components
const AdminDashboard = lazy(() => import("./features/admin/Dashboard"));
```

### 9.3 API & Data Loading

- Use pagination for large datasets
- Implement proper loading states
- Cache responses where appropriate
- Use optimistic updates for better UX
- Debounce search/filter inputs
- Implement request cancellation for unmounted components

---

## 10. Security Best Practices

### 10.1 Security Checklist

For EVERY task, verify:

```markdown
- [ ] No secrets in code (API keys, passwords, tokens)
- [ ] Environment variables used for configuration
- [ ] User input is sanitized
- [ ] SQL/NoSQL injection prevented
- [ ] XSS vulnerabilities addressed
- [ ] Authentication verified on all protected routes
- [ ] Authorization checked for all sensitive operations
- [ ] CORS configured correctly
- [ ] HTTPS enforced
- [ ] Sensitive data not logged
```

### 10.2 Common Security Patterns

```typescript
// ✅ Sanitize user input
import DOMPurify from "dompurify";
const sanitizedHTML = DOMPurify.sanitize(userInput);

// ✅ Use parameterized queries
const user = await db.query("SELECT * FROM users WHERE id = $1", [userId]);

// ✅ Validate and sanitize all inputs
import { z } from "zod";
const UserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
});
const validatedData = UserSchema.parse(userInput);

// ✅ Never expose sensitive data
function sanitizeUserForClient(user: User): SafeUser {
  const { password, ssn, ...safeUser } = user;
  return safeUser;
}
```

### 10.3 Authentication & Authorization

- Never store passwords in plain text
- Use secure password hashing (bcrypt, argon2)
- Implement proper session management
- Use JWT tokens with short expiration
- Implement refresh token rotation
- Add rate limiting to auth endpoints
- Log authentication failures

---

## 11. Prompting & Communication

### 11.1 How to Ask Questions

When I need clarification, I will:

1. **Be specific** - Ask about one thing at a time
2. **Provide context** - Explain why I'm asking
3. **Suggest options** - Give the user choices when possible
4. **Number questions** - Make multiple questions scannable
5. **Prioritize** - Ask the most blocking questions first

### 11.2 Progress Communication

I will communicate progress by:

1. **Stating what I'm about to do** before doing it
2. **Explaining my reasoning** for non-obvious decisions
3. **Reporting completion** with verification results
4. **Acknowledging issues** and proposing solutions

### 11.3 Handling Mistakes

When I make a mistake:

1. **Acknowledge it clearly** - "I made an error..."
2. **Explain what went wrong** - Root cause
3. **Propose a fix** - How to resolve it
4. **Implement carefully** - Double-check the fix
5. **Learn from it** - Document if pattern-related

---

## 12. Error Handling & Debugging

### 12.1 Debugging Process

1. **Reproduce the issue** - Confirm the problem exists
2. **Gather information** - Error messages, logs, stack traces
3. **Form a hypothesis** - What might be causing it
4. **Test the hypothesis** - Minimal changes to verify
5. **Fix the root cause** - Not just the symptom
6. **Verify the fix** - Ensure it works without side effects
7. **Add tests** - Prevent regression

### 12.2 Error Logging Standards

```typescript
// Include context in error logs
console.error("[ModuleName][FunctionName] Error description:", {
  error: error.message,
  stack: error.stack,
  context: {
    userId,
    action,
    input: sanitizedInput,
  },
});
```

### 12.3 Error Recovery

- Implement retry logic for transient failures
- Provide user-friendly error messages
- Log technical details for debugging
- Implement circuit breakers for failing services
- Have fallback behaviors for non-critical features

---

## 13. Technology-Specific Guidelines

### 13.1 TypeScript

- Enable strict mode
- Avoid `any` type - use `unknown` if necessary
- Define explicit return types for functions
- Use union types over enums where appropriate
- Prefer interfaces for objects, types for unions
- Use generics for reusable types

### 13.2 React & UI Patterns

- **Functional Components**: Use functional components exclusively
- **Strict Service Layer**: **NEVER** make API calls directly inside components (useEffect). Use the Service Layer pattern in `src/services/`.
- **Forms & Validation**:
  - **MUST** use `react-hook-form` paired with `zod`.
  - Define schemas in `src/schemas/[feature]FormSchema.ts`.
  - Use `zodResolver`.
- **UI Components**:
  - Use `class-variance-authority` (cva) for managing variants in `src/components/ui/`.
  - Use `cn(...)` helper for class merging.
- **State Management**:
  - `Zustand` for global state.
  - `React Query` for server state.
- **Accessibility**: Implement proper accessibility (a11y).

### 13.3 Node.js/Backend

- Use async/await over callbacks
- Implement proper request validation
- Use dependency injection
- Implement proper logging
- Handle uncaught exceptions
- Use proper status codes

### 13.4 CSS/Styling

- Use CSS custom properties for theming
- Follow mobile-first responsive design
- Use semantic class names
- Avoid !important
- Use proper specificity hierarchy
- Implement dark mode support

---

## 14. Workflow Enforcement

### 14.1 Before Starting Any Task

1. ✅ Read and understand the request fully
2. ✅ Identify all files that will be affected
3. ✅ Check for existing patterns and utilities
4. ✅ Create implementation plan
5. ✅ Present plan to user
6. ✅ Wait for explicit approval

### 14.2 Detailed Feature Implementation Workflow

When implementing a new feature, follow this exact order to avoid circular dependencies:

1.  ✅ **Define Types**: Update `@/types` if new API responses are needed.
2.  ✅ **Create Service**: Add methods to `src/services/` to handle data fetching. (Standard `fetch` with `async/await`).
3.  ✅ **Create Schema**: Define Zod schema in `src/schemas/`.
4.  ✅ **Build Component**: Create the UI in `src/components/[feature]/` using the schema and service.
5.  ✅ **State**: If global state is needed, update/create a Zustand store in `src/stores/`.
6.  ✅ **Verify**: Test manualy and run checks.

### 14.3 During Implementation

1. ✅ Follow the approved plan
2. ✅ Make atomic changes
3. ✅ Test after each significant change
4. ✅ Update user on progress
5. ✅ Ask if scope changes are needed

### 14.3 After Implementation

1. ✅ Run all tests
2. ✅ Verify the feature works
3. ✅ Check for console errors
4. ✅ Review code quality
5. ✅ Create appropriate commit
6. ✅ Update documentation if needed
7. ✅ Report completion to user

### 14.4 Checklists and Scratchpads

For complex tasks:

- Use a markdown checklist to track progress
- Document findings and decisions as you go
- Update task.md as items are completed
- Keep notes on issues encountered

---

## Quick Reference

### The Golden Rules

1. **ALWAYS plan before coding**
2. **ALWAYS wait for user approval**
3. **NEVER assume - ask for clarification**
4. **ALWAYS verify your changes work**
5. **ALWAYS follow existing project patterns**
6. **ALWAYS write clean, testable code**
7. **ALWAYS document significant decisions**
8. **NEVER commit broken code**

### Command Sequence for Every Task

```bash
# 1. Understand
# - Read files, understand context

# 2. Plan
# - Create implementation_plan.md
# - Present to user, wait for approval

# 3. Implement
# - Follow the approved plan
# - Make atomic changes

# 4. Verify
# - Run type checking: npm run typecheck
# - Run tests: npm test
# - Manual verification

# 5. Commit
# - Stage changes: git add <files>
# - Commit: git commit -m "type(scope): description"
```

---
