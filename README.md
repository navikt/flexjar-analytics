# Flexjar Analytics

Analytics dashboard for Flexjar survey data. Built with TanStack Start.

## Quick Start

```bash
# Prerequisites: Node.js 20+

# 1. Clone and install
git clone https://github.com/navikt/flexjar-analytics.git
cd flexjar-analytics
npm install

# 2. Set environment (optional - defaults work locally)
export FLEXJAR_BACKEND_URL=http://localhost:8080

# 3. Start development server
npm run dev
# Open http://localhost:3000
```

## Features

- 📊 **Dashboard** - Visual overview with charts and statistics
- 📈 **Charts** - Rating distribution, timeline, top apps
- 🔍 **Advanced filtering** - Date range, team, app, text search, tags
- 📤 **Export** - CSV, JSON, and Excel downloads
- 🔒 **Sensitive data protection** - PII is automatically redacted by the backend
- 🎨 **Aksel Darkside** - NAV Design System with dark mode support

## Tech Stack

- **TanStack Start** - Full-stack React framework
- **TanStack Router** - Type-safe routing
- **TanStack Query** - Server state management
- **@navikt/ds-react** - NAV Aksel components
- **Recharts** - Charts and visualizations
- **@navikt/oasis** - Azure AD authentication

## Pages

| Route | Description |
|-------|-------------|
| `/` | Dashboard with overview charts and stats |
| `/feedback` | Detailed feedback table with filters |
| `/export` | Export data in various formats |

## Development

### Prerequisites

- Node.js 20+
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `FLEXJAR_BACKEND_URL` | Backend API URL | `http://localhost:8080` |
| `FLEXJAR_BACKEND_AUDIENCE` | Azure AD audience for OBO | - |
| `NAIS_CLUSTER_NAME` | NAIS cluster (enables auth) | - |

## Deployment

Deployed to NAIS via GitHub Actions.

### URLs

- **Dev**: https://flexjar-analytics.intern.dev.nav.no
- **Prod**: https://flexjar-analytics.intern.nav.no

## Authentication

Uses Wonderwall + Azure AD for authentication:

1. User navigates to the app
2. Wonderwall intercepts and redirects to Azure AD login
3. After login, Wonderwall adds the token to requests
4. App validates token and exchanges for OBO token to call backend

## Project Structure

```
app/
├── routes/
│   ├── __root.tsx        # Root layout
│   ├── index.tsx         # Dashboard page
│   ├── feedback.tsx      # Feedback table page
│   ├── export.tsx        # Export page
│   └── api/
│       ├── backend/$.ts  # Backend proxy
│       └── internal/     # Health checks
├── components/
│   ├── FilterBar.tsx     # Filter controls
│   ├── StatsCards.tsx    # Statistics cards
│   ├── FeedbackTable.tsx # Data table
│   ├── ExportPanel.tsx   # Export options
│   └── charts/
│       ├── RatingChart.tsx
│       ├── TimelineChart.tsx
│       └── TopAppsChart.tsx
├── lib/
│   ├── api.ts            # API types and functions
│   ├── useStats.ts       # Stats query hook
│   ├── useFeedback.ts    # Feedback query hook
│   └── useSearchParams.ts # URL state management
└── styles/
    └── global.css        # Global styles
```
