---
applyTo: "app/**/*.{tsx,ts}"
---

# TanStack Start with Aksel Design System (flexjar-analytics)

This repo uses **TanStack Start** (`@tanstack/react-start`) + **TanStack Router** file-based routes (`app/routes/*`), built with Vite.

🚫 Avoid Next.js-specific concepts (App Router, `NextResponse`, Server/Client Components, etc.).

## Spacing Rules

**CRITICAL**: Always use Nav DS spacing tokens, never Tailwind padding/margin utilities.

### ✅ Correct Patterns

```tsx
import { Box, VStack, HGrid } from "@navikt/ds-react";

// Page container
<main>
  <Box
    paddingBlock={{ xs: "space-16", md: "space-24" }}
    paddingInline={{ xs: "space-16", md: "space-40" }}
  >
    {children}
  </Box>
</main>

// Component with responsive padding
<Box
  background="surface-subtle"
  padding={{ xs: "space-12", sm: "space-16", md: "space-24" }}
  borderRadius="large"
>
  <Heading size="large" level="2">Title</Heading>
  <BodyShort>Content</BodyShort>
</Box>

// Directional padding
<Box
  paddingBlock="space-16"    // Top and bottom
  paddingInline="space-24"   // Left and right
>
```

### ❌ Incorrect Patterns

```tsx
// Never use Tailwind padding/margin
<div className="p-4 md:p-6">  // ❌ Wrong
<div className="mx-4 my-2">   // ❌ Wrong
<Box padding="4">             // ❌ Wrong - no space- prefix
```

## Spacing Tokens

Available spacing tokens (always with `space-` prefix):

- `space-4` (4px)
- `space-8` (8px)
- `space-12` (12px)
- `space-16` (16px)
- `space-20` (20px)
- `space-24` (24px)
- `space-32` (32px)
- `space-40` (40px)

## Responsive Design

Mobile-first approach with breakpoints:

- `xs`: 0px (mobile)
- `sm`: 480px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

```tsx
<HGrid columns={{ xs: 1, md: 2, lg: 3 }} gap="space-16">
  {items.map(item => <Card key={item.id} {...item} />)}
</HGrid>

<Box
  padding={{ xs: "space-16", sm: "space-20", md: "space-24" }}
>
```

## Component Patterns

### Layout Components

```tsx
import { Box, VStack, HStack, HGrid } from "@navikt/ds-react";

// Vertical stack with spacing
<VStack gap="space-16">
  <Component1 />
  <Component2 />
  <Component3 />
</VStack>

// Horizontal stack
<HStack gap="space-16" align="center">
  <Icon />
  <Text />
</HStack>

// Responsive grid
<HGrid columns={{ xs: 1, md: 2, lg: 3 }} gap="space-16">
  {/* Grid items */}
</HGrid>
```

### Typography

```tsx
import { Heading, BodyShort, Label } from "@navikt/ds-react";

<Heading size="large|medium|small" level="1-6">
  Title
</Heading>

<BodyShort size="large|medium|small">
  Regular text content
</BodyShort>

<BodyShort weight="semibold">
  Bold text
</BodyShort>

<Label size="large|medium|small">
  Input label
</Label>
```

### Background Colors

```tsx
<Box background="surface-default">     {/* White */}
<Box background="surface-subtle">      {/* Light gray */}
<Box background="surface-action-subtle">  {/* Light blue */}
<Box background="surface-success-subtle"> {/* Light green */}
<Box background="surface-warning-subtle"> {/* Light orange */}
<Box background="surface-danger-subtle">  {/* Light red */}
```

## Number Formatting

Use Norwegian locale explicitly to avoid browser/CI differences:

```ts
const formatted = totalCount.toLocaleString("no-NO")
```

## Routing (TanStack Router)

Routes are file-based under `app/routes/*` using `createFileRoute()`.

```tsx
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/feedback")({
  component: FeedbackPage,
});

function FeedbackPage() {
  return (
    <Link to="/export" search={(prev) => prev}>
      Gå til eksport
    </Link>
  );
}
```

## Server Functions (TanStack Start)

Server-side calls live under `app/server/actions/*` and use `createServerFn()`.
Prefer Zod validation + auth middleware (matches repo patterns).

```ts
import { createServerFn } from "@tanstack/react-start";
import { zodValidator } from "@tanstack/zod-adapter";
import { authMiddleware } from "~/server/middleware/auth";
import { StatsParamsSchema } from "~/types/schemas";

export const fetchStatsServerFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(zodValidator(StatsParamsSchema))
  .handler(async ({ data, context }) => {
    // fetch from backend with OBO token from context
  });
```

## Internal Endpoints (Health + Metrics)

Internal endpoints are implemented as **server handlers** in route files under `app/routes/api/internal/*`.

- `GET /api/internal/isAlive`
- `GET /api/internal/isReady`
- `GET /api/internal/metrics` (Prometheus)

Example metrics route:

```ts
import { createFileRoute } from "@tanstack/react-router";
import { collectDefaultMetrics, register } from "prom-client";

collectDefaultMetrics();

export const Route = createFileRoute("/api/internal/metrics")({
  server: {
    handlers: {
      GET: async () => {
        const metrics = await register.metrics();
        return new Response(metrics, {
          headers: { "Content-Type": register.contentType },
        });
      },
    },
  },
});
```

## Testing

This repo uses **Vitest** + Testing Library.

- Run unit tests: `npm test`
- Run E2E tests: `npm run e2e`

```ts
import { describe, expect, it } from "vitest";

describe("number formatting", () => {
  it("formats with no-NO", () => {
    expect((151354).toLocaleString("no-NO")).toBe("151 354");
  });
});
```


## Boundaries

### ✅ Always

- Use Aksel Design System components
- Use spacing tokens with `space-` prefix
- Mobile-first responsive design
- Norwegian number formatting
- Explicit error handling in API routes

### ⚠️ Ask First

- Adding custom CSS that bypasses Aksel primitives
- Deviating from Aksel patterns
- Changing authentication flow
- Modifying data aggregation logic

### 🚫 Never

- Use Tailwind padding/margin utilities (`p-*`, `m-*`)
- Use numeric spacing without `space-` prefix
- Ignore accessibility requirements
- Skip responsive props
- Add code comments unless explicitly requested
