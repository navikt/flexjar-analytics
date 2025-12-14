# Flexjar Analytics – AI Coding Guide

TanStack Start dashboard for viewing and exporting Flexjar survey feedback.

## Quality Standards & Workflow
- **Static Analysis**: Always run `npm run lint` (Biome) and `npm run typecheck` (TypeScript) before finishing a task.
- **Pre-commit**: This project uses `husky` and `lint-staged`. Commits will fail if linting or type checking fails.
- **Tests**: Run `npm test` when making logic changes.
- **Workflow**:
    1. Plan changes.
    2. Implement code.
    3. Verify with `npm run lint` and `npm run typecheck`.
    4. Create/Update artifacts to document work.

## Architecture

```
app/
├── routes/
│   ├── __root.tsx        # Root layout with nav
│   ├── index.tsx         # Dashboard with charts
│   ├── feedback.tsx      # Paginated feedback table
│   ├── export.tsx        # Export panel (CSV/JSON/Excel)
│   └── api/backend/$.ts  # Proxy to backend with OBO token
├── components/
│   ├── FilterBar.tsx     # Date range, team, app, tags filters
│   ├── FeedbackTable.tsx # Expandable rows with answer fields
│   └── charts/           # RatingChart, TimelineChart, TopAppsChart
├── lib/
│   ├── api.ts            # Types, `fetchFromBackend` server fn
│   ├── useFeedback.ts    # TanStack Query hook
│   ├── useStats.ts       # Dashboard stats hook
│   └── useSearchParams.ts# URL state for filters
└── styles/global.css     # Aksel Darkside overrides
```

### Key Concepts
- **Server functions**: `createServerFn` from TanStack Start handles OBO token exchange via `@navikt/oasis`
- **URL-driven filters**: All filter state lives in URL params via `useSearchParams` hook
- **Expandable rows**: `FeedbackTable` shows collapsed summary; expand for full answers
- **PII redaction**: Backend redacts sensitive data before sending—frontend just displays

## Commands
```sh
npm run dev        # Vite dev server
npm run build      # Production build + typecheck
npm run lint       # Biome check
npm run lint:fix   # Biome auto-fix
npm run typecheck  # TypeScript check (added to pre-commit)
```

## Environment Variables
| Variable | Description |
|----------|-------------|
| `FLEXJAR_BACKEND_URL` | Backend API (default: `http://localhost:8080`) |
| `FLEXJAR_BACKEND_AUDIENCE` | Azure AD audience for OBO |
| `NAIS_CLUSTER_NAME` | When set, enables auth flow |

## Conventions
1. **Aksel Darkside**: Import `@navikt/ds-css/darkside` – uses `--ax-*` tokens
2. **Query keys**: Match backend endpoint paths for cache invalidation
3. **Date handling**: Use `dayjs` for formatting, ISO strings for API params
4. **Chart colors**: Define in `COLORS` constant, not inline

## Related Repositories
- **[flexjar-analytics-api](https://github.com/navikt/flexjar-analytics-api)**: Backend API. Types in `lib/api.ts` must match DTOs in `domain/`.
- **[flexjar-widget](https://github.com/navikt/flexjar-widget)**: Survey widget that submits to the backend. Reserved keys `svar`/`feedback` appear in feedback data.

## Backend Integration
- Proxy route at `api/backend/$.ts` forwards to `FLEXJAR_BACKEND_URL`
- Types in `lib/api.ts` must match backend DTOs
- Backend handles: pagination, filtering, sorting, PII redaction
