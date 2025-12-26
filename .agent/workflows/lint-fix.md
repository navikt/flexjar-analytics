---
description: Fix linting and formatting issues
---

# Lint & Format Workflow

// turbo-all

Use this workflow to fix code quality issues before committing.

## Step 1: Run Linter

```bash
cd /Users/kreps1/IdeaProjects/flexjar-analytics
npm run lint
```

## Step 2: Auto-fix Linting Issues

```bash
npm run lint -- --fix
```

## Step 3: Format with Biome

```bash
npm run format
```

## Step 4: Check for Type Errors

```bash
npx tsc --noEmit
```

## All-in-One Command

Run all checks:
```bash
npm run lint && npm run format && npx tsc --noEmit
```

## Common Issues

### Unused imports
Biome will flag unused imports. Remove them or use:
```bash
npx biome check --write .
```

### Import order
Biome enforces import sorting. Run `npm run format` to auto-fix.

### TypeScript any warnings
Avoid using `any`. Use proper types or `unknown` with type guards.
