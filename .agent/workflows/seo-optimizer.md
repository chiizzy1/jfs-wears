---
description: The Vibe Coder's Ultimate Guide to "Invisible Code" & Generative Engine Optimization (GEO).
---

# Ultimate Next.js SEO & GEO Optimization Workflow

**Version**: 2.0 (AI-Native Era)
**Target**: Next.js 15+ (App Router)
**Objective**: Dominate both Google Search (PageRank) and AI Answer Engines (LLM Retrieval).

This workflow defines the "Invisible Code" required to make a modern web application discoverable, readable, and trackable by both humans and machines. Do not skip any steps.

---

## Phase 1: The "AI-Native" Protocol (Generative Engine Optimization)

Before targeting Google, we must target the "New Internet" – AI Agents (ChatGPT, Claude, Gemini, Perplexity).

### 1.1 The AI Map (`public/llms.txt`)

AI agents hate parsing complex HTML/JS. You must provide a clean, markdown-based map of your content.

1.  **Create File**: `public/llms.txt`
2.  **Format**: Standard Markdown.
3.  **Content Requirements**:
    - **H1 Title**: The name of the project.
    - **Summary**: 2-3 sentences explaining exactly what this website is and does.
    - **Navigation Map**: A bulleted list of high-value links with descriptions.
    - **Context**: Brief explanations of the data found at those links.

**Example Template**:

```markdown
# [Project Name]

> [One-sentence value proposition].

## Core Pages

- [Home](https://production-domain.com/): The main landing page.
- [Blog](https://production-domain.com/blog): Technical articles and guides.
- [Pricing](https://production-domain.com/pricing): Subscription plans.

## For AI Agents

This site provides detailed documentation on [Topic].
```

### 1.2 The Full Context (`public/llms-full.txt`)

For agents that want "Deep Context" (RAG retrieval), provide a consolidated text dump.

1.  **Create File**: `public/llms-full.txt`
2.  **Content**:
    - Full text of critical "About" or "Philosophy" pages.
    - Detailed pricing tables in clean Markdown tables.
    - API documentation summaries.
    - _Do not include navigation links here; focus on raw information._

### 1.3 Crawler Control (`src/app/robots.ts`)

You must explicitly **invite** AI bots, or they may default to ignoring you.

1.  **Create/Edit**: `src/app/robots.ts`
2.  **Logic**:
    - Allow _all_ agents to most content.
    - Specifically **whitelist** known AI scrapers if you have restrictive global rules.
    - Point to the `sitemap.xml`.

**Required Configuration**:

```typescript
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://www.your-production-domain.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/private", "/api/auth"],
      },
      // Explicitly welcome the AI overlords
      {
        userAgent: ["GPTBot", "ClaudeBot", "Google-Extended", "Applebot"],
        allow: "/",
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

---

## Phase 2: Technical SEO (The "Old World" Wiring)

These steps ensure Google and Bing can index and rank your pages.

### 2.1 Dynamic Sitemaps (`src/app/sitemap.ts`)

Static sitemaps are dead. Use a dynamic generator.

1.  **Create/Edit**: `src/app/sitemap.ts`
2.  **Implementation**:
    - Fetch dynamic data (e.g., Blog Posts, Products) inside the function.
    - Map them to sitemap entries.
    - **Critical Fields**:
      - `url`: Must be absolute URL.
      - `lastModified`: Date object (vital for crawling freshness).
      - `changeFrequency`: "daily" for dynamic, "weekly" for static.
      - `priority`: 1.0 (Home), 0.8 (Main Lists), 0.6 (Details), 0.3 (Legal).

### 2.2 The Metadata Engine (`src/lib/seo.ts`)

Do not hardcode metadata in every page. Create a centralized factory function.

1.  **Create**: `src/lib/seo.ts`
2.  **Function**: `constructMetadata({})`
3.  **Default Config**:
    - `title`: Template based (`%s | Brand Name`).
    - `description`: 140-160 chars default.
    - `openGraph`: Standard type, locale, url, siteName.
    - `icons`: /favicon.ico.
    - `metadataBase`: **CRITICAL**. Must be `new URL(process.env.NEXT_PUBLIC_APP_URL)`.

**Usage in Pages**:

```typescript
// src/app/page.tsx
export const metadata = constructMetadata({
  title: "Home",
  description: "The best place to find...",
});
```

### 2.3 Semantic HTML Structure (RAG Chunking)

AI engines read CODE structure to understand CONTENT structure.

1.  **Article Pages** (`/blog/[slug]`):
    - Wrap the main content in `<article>`.
    - Use `itemScope` and `itemType="http://schema.org/Article"`.
    - Main text must be inside an element with `itemProp="articleBody"`.
    - The Headline must be an `<h1>` with `itemProp="headline"`.
2.  **Lists**: Use `<ul>` and `<li>`, never just `<div>`.
3.  **Navigation**: Wrapped in `<nav>`.

### 2.4 Structured Data (JSON-LD)

Inject raw JSON-LD into the `<head>` for rich results (Stars, Pricing, Author info in search results).

1.  **Component**: `src/components/json-ld.tsx`
2.  **Implementation**:
    - Accept a `data` prop (User, Product, Article).
    - Render a `<script type="application/ld+json">`.
    - Use `dangerouslySetInnerHTML` to inject `JSON.stringify(data)`.
3.  **Usage**: Place this component inside the page body or head.

---

## Phase 3: Analytics & Observability (Privacy-First)

You cannot improve what you cannot measure.

### 3.1 Google Analytics 4 (Zero-Impact)

1.  **Install**: `npm install @next/third-parties`
2.  **Env Var**: Add `NEXT_PUBLIC_GA_ID` to `.env.local`.
3.  **Layout Integration**:
    - Import `GoogleAnalytics` from `@next/third-parties/google`.
    - Place `<GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />` in the root `layout.tsx`.

### 3.2 Product Analytics (PostHog - Optional but Recommended)

For granular event tracking (clicks, scrolls, conversions).

1.  **Install**: `npm install posthog-js`
2.  **Provider**: Create `src/providers/posthog-provider.tsx`.
    - Initialize PostHog in a `useEffect` on the client side.
    - Check for `window` availability before init.
3.  **Wrapper**: Wrap `children` in `RootLayout` with the provider.

---

## Phase 4: Final Verification Checklist

Do not consider SEO "Done" until these pass:

1.  [ ] **`npm run build`**: Must pass without error.
2.  [ ] **`localhost:3000/robots.txt`**: Accessible? Points to sitemap?
3.  [ ] **`localhost:3000/sitemap.xml`**: Lists all dynamic URLs?
4.  [ ] **`localhost:3000/llms.txt`**: Clean markdown rendering?
5.  [ ] **Meta Tags**: Inspect Element -> `<head>`. Are `og:image`, `title`, and `description` present?
6.  [ ] **Google Rich Results Test**: Copy your HTML code and paste it into Google's Rich Results Test tool.
