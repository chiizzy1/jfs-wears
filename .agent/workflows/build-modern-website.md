---
description: "The Ultimate Premium Website Factory. Generates production-grade, award-winning codebases with strict engineering rigor and fluid design physics."
---

# The Premium Website Factory (Strict Protocol)

You are about to build a **World-Class Web Application**. This is not a simple task. You must follow every single instruction below exactly as written. Do not improvise on the architecture. Do not skip steps. Do not be lazy.

## Step 1: The Interrogation (Input Phase)

You cannot build without a blueprint. You must ask the user strictly for these four specific inputs. Do not assume anything.

**Action:** Send a message to the user asking EXACTLY these 4 questions:

1.  **Project Name**: "What is the name of the folder I should create? (e.g., 'acme-dashboard')"
2.  **The Vibe**: "Describe the visual aesthetic in detail. (e.g., 'Swiss Minimalist with harsh grids', 'Dark Mode Cyberpunk with neon', 'Soft Organic Spa')."
3.  **Motion Physics**: "How should things move? (e.g., 'Snappy and reactive like an app', or 'Slow, cinematic, and floaty like a movie')."
4.  **Tech Depth**: "Is this a simple marketing site or a complex web application? (This determines if we build robust stores/services or just layouts)."

**STOP.** Do not proceed until the user answers all 4 questions.

---

## Step 2: The Smart Scaffolding (Construction Site)

You must determine if we are breaking ground or renovating.

1.  **Analyze Context**: Check the current directory for `package.json`.

    - **SCENARIO A: Existing Project (Retrofit Mode)**

      - **Condition**: `package.json` exists.
      - **Check**: Read `package.json`. Does it list `"next"` in dependencies?
        - **NO**: **STOP**. Tell user: "This directory contains a project, but it is not Next.js. I can only verify Next.js projects."
        - **YES**: Proceed to **Retrofit**.
          - **Action**: Scan `dependencies` for the "Luxury" list: `framer-motion`, `clsx`, `tailwind-merge`, `lucide-react`, `zustand`.
          - **Command**: `npm install [missing_packages]` (Only install what is missing).
          - **Verification**: Ensure `src` directory exists. If not, ask user if they want to migrate to `src` dir (recommended) or adapt paths. (Assume `src` for this workflow).

    - **SCENARIO B: New Project (Greenfield Mode)**
      - **Condition**: No `package.json` exists.
      - **Action**: Run `create-next-app` to set up the foundation.
      - **Command**:
        `npx create-next-app@latest [Project Name from Step 1] --typescript --eslint --tailwind --app --src-dir --import-alias "@/*" --use-npm --no-git-init`
      - **Action**: `cd [Project Name]` and run `npm install framer-motion clsx tailwind-merge lucide-react zustand`.

2.  **Enforce Architecture (The Bones)**:
    - Regardless of Scenario A or B, you must ensure the folder structure is correct. `mkdir -p` is safe to run.
    - **Command**:
      ```bash
      mkdir -p src/features             # For business logic modules (Feature-First)
      mkdir -p src/components/ui        # For base primitives (Buttons, Inputs)
      mkdir -p src/components/layout    # For Headers, Footers
      mkdir -p src/lib                  # For utilities
      mkdir -p src/hooks                # For React hooks
      mkdir -p src/styles               # For global CSS
      mkdir -p src/types                # For TypeScript definitions
      mkdir -p src/schemas              # For Zod schemas
      mkdir -p src/services             # For API services
      mkdir -p src/stores               # For Zustand stores
      mkdir -p docs/adr                 # For Architecture Decision Records
      ```

---

## Step 3: The Documentation (First Principle)

We do not write code without documentation. Start correctly.

1.  **Overwrite README.md**:

    - **Content**: Use the strict structure:

      ````markdown
      # [Project Name]

      ## Quick Start

      ```bash
      npm install
      npm run dev
      ```
      ````

      ## Architecture

      Feature-First Architecture with Next.js App Router (Proxy.ts + Server Components).
      See `.cursorrules` for strict project guidelines.

      ## Contributing

      Please read `docs/adr` for architectural decisions.

      ```

      ```

2.  **Initialize ADRs**:
    - Create `docs/adr/000-template.md`.
    - Content: Standard ADR template (Status, Context, Decision, Consequences).

---

## Step 4: The Physics Engine (Global CSS)

You are now the **Chief Design Officer**. You must configure the CSS to handle "Fluid Design". We do not use fixed pixels. We use Math.

**Action**: Overwrite `src/app/globals.css`.

**Instructions for Content**:

1.  **Delete** everything currently in `src/app/globals.css`.
2.  **Write** the new content using `@theme` (Tailwind v4 syntax) or `:root` vars.
3.  **MANDATORY**: You must define `clamp()` based variables for spacing.
    - `--space-xs: clamp(0.5rem, 0.4rem + 0.5vw, 0.75rem);`
    - `--space-md: clamp(1rem, 0.8rem + 1vw, 1.5rem);`
    - `--space-xl: clamp(2rem, 1.5rem + 2.5vw, 4rem);`
4.  **MANDATORY**: Define the "Physics" curves based on user's input (Step 1).
    - `--ease-spring: linear(0, 0.009, 0.035 2.1%, 0.141 4.4%, 0.723 12.9%, 0.938 16.7%, 1.035 20.5%, 1.043 23.5%, 1.035 26.8%, 1.022 31%, 1.009 36.7%, 1.001 50%, 1);` (Example spring)

---

## Step 5: The Law (Cursor Rules)

You must ensure that any future AI (or human) working on this project follows strict rules.

**Action**: Create a file named `.cursorrules` in the root of the project.

**Content to Write (Verbatim)**:

```markdown
# Project Rules - Safety & Quality Protocol

## 1. Feature-First Architecture

- Do NOT put all hooks in `/hooks`. Put them in `src/features/[feature-name]/hooks`.
- Do NOT put all components in `/components`. Put feature-specific ones in `src/features/[feature-name]/components`.
- Only SHARED primitives go in `src/components/ui`.

### Directory Structure Reference

src/
├── app/ # Next.js App Router pages (Thin Shells)
├── components/
│ ├── [feature]/ # Feature-specific components (e.g. auth, newsletter)
│ │ ├── [Feature]Form.tsx
│ │ └── common/ # Feature-local shared components
│ └── ui/ # Reusable UI primitives (Buttons, Inputs)
├── hooks/ # Custom hooks
├── lib/ # Utilities
├── schemas/ # Zod schemas (Centralized)
├── services/ # API interaction (Decoupled from UI)
├── stores/ # Zustand global stores
├── types/ # TypeScript definitions
└── utils/ # Helper functions

## 2. "Safety First" Workflow

- **Plan**: Always write `implementation_plan.md` before coding complex changes.
- **Verify**: Always run `npm run build` after major changes.

## 3. Premium Design Standards

- **Fluidity**: NEVER use fixed pixels (e.g., `w-[300px]`) for layout. Use percentages or `clamp()`.
- **Motion**: All interactive elements (Buttons, Cards) MUST exist/animate on hover.
- **Typography**: Use `text-balance` on headlines.

## 4. Coding Strictness

- No raw HTML `<button>`. Use `<Button>` from `@/components/ui/button`.
- No raw `<a>` tags. Use `<Link>` from `next/link`.
- No `any` types. Define interfaces in `src/types` or feature folders.
```

---

## Step 6: The Tool Belt (Base Components)

You cannot build a house without a hammer. You must create the base component primitives now.

1.  **The Utility Class**:

    - Create `src/lib/utils.ts`.
    - Paste the standard `cn` (classNames) helper using `clsx` and `tailwind-merge`.

2.  **The Security Helper (`jwt.ts`)**:

    - Create `src/lib/jwt.ts`.
    - Implement `isTokenExpired(token: string): boolean` (decode base64 part 2, check `exp`). This is required for Proxy.ts.

3.  **The Magic Button**:

    - Create `src/components/ui/button.tsx`.
    - **Requirement**: It must use `framer-motion`.
    - **Code**:
      ```tsx
      import { motion } from "framer-motion";
      // ... (Define variants: primary, ghost, outline)
      // ... (Use <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} ... />)
      ```
    - **Why?**: This ensures every single button in the app feels "physical" and premium by default.

4.  **The Container**:
    - Create `src/components/ui/container.tsx`.
    - **Code**: A simple `div` that uses `max-w-screen-xl`, `mx-auto`, and **fluid padding** (e.g., `px-[var(--space-md)]`) to ensure content never hits the edges of the screen abruptly.

---

## Step 7: The Proxy Strategy (Next.js 16 Security)

We leverage specific architectural patterns for request interception.

1. **Create `src/proxy.ts`** (NOT `middleware.ts`):

   - **Runtime**: Node.js (default).
   - **Logic**:

     ```typescript
     import { NextResponse } from "next/server";
     import type { NextRequest } from "next/server";
     import { isTokenExpired } from "@/lib/jwt";

     const PROTECTED_ROUTES = ["/dashboard", "/admin"];

     export default function proxy(request: NextRequest) {
       const { pathname } = request.nextUrl;
       const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

       if (isProtected) {
         const token = request.cookies.get("auth_token")?.value;
         if (!token || isTokenExpired(token)) {
           return NextResponse.redirect(new URL("/login", request.url));
         }
       }
       return NextResponse.next();
     }
     ```

---

## Step 8: State Machinery (Global Store)

We prevent "local state drift" by establishing the global UI store immediately.

1. **Create `src/stores/ui-store.ts`**:
   - Use `zustand` + `devtools`.
   - Implement `useUIStore` with `openModal`, `closeModal`, `toggleSidebar`.
   - **Why**: This forces future AI to use this store instead of inventing new state mechanisms.

---

## Step 9: The "Golden Sample" (Reference Feature)

You need to show the project how to behave. You will build one feature properly.

**Feature**: "Newsletter Signup" (or a specific feature based on User's Vibe).

1.  **Create Directory**: `src/features/newsletter`.
2.  **Create Schema**: `src/features/newsletter/newsletter.schema.ts` (Use Zod if installed, or just strict TS types).
3.  **Create Service**: `src/features/newsletter/newsletter.service.ts` (Mock function `subscribeToNewsletter(email)`).
4.  **Create Component**: `src/features/newsletter/components/NewsletterForm.tsx`.
    - Use the `<Button>` you made in Step 6.
    - Use the `<Input>` primitive.
    - Handle state (loading, success, error).

---

## Step 10: The Showroom (Style Guide)

You must prove that your design system works. You will create a secret page to showcase the "Vibe".

1.  **Create Page**: `src/app/design/page.tsx`.
2.  **Content**:
    - **Typography Section**: Display H1, H2, H3, P using your fluid utility classes. Show them scaling.
    - **Color Palette**: Create a grid showing the primary, secondary, and accent colors (using the CSS vars).
    - **Physics Lab**: Place your `<Button>` and `<Input>` components here. Add a "Motion Test" area where the user can click things to feel the spring physics.
    - **Grid Test**: Show a responsive grid layout to prove `clamp()` spacing works.

---

## Step 11: Final Assembly & Launchpad

1.  **Update Layout**:
    - Open `src/app/layout.tsx`.
    - Import the Font (from `next/font/google`) that matches the Vibe.
    - Add `antialiased` to the body class.
2.  **Update Page**:
    - Open `src/app/page.tsx`.
    - Delete the Next.js boilerplate.
    - Import your `NewsletterForm` (Golden Sample) and place it inside a `<Container>`.
    - Add a Headline using Fluid Typography classes.
    - Add a link to `/design` so the user can inspect the system.
3.  **Git Hygiene**:
    - Run `git init`.
    - Run `git branch -M main`.
    - Run `git checkout -b feature/initial-setup`.
    - Run `git add .` and `git commit -m "feat: initial project structure with Master Rules"`.

## Step 12: Verification

1.  **Run Check**: `npm run build`.
    - If it fails, you have failed the user. You must fix it immediately.
2.  **Report**: Tell the user: "I have constructed your premium architecture. The 'Bones' are set, the 'Physics' are tuned, and the 'Rules' are written. Git initialized on branch 'feature/initial-setup'. check the style guide at /design"
