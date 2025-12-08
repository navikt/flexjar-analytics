/// <reference types="vite/client" />
import * as React from 'react'
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Theme } from '@navikt/ds-react/Theme'

// Import Aksel Darkside styles (supports light/dark mode)
import akselStyles from '@navikt/ds-css/darkside?url'
import globalStyles from '~/styles/global.css?url'

// Create QueryClient outside component to avoid recreation on each render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
    },
  },
})

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'robots', content: 'noindex' },
      { title: 'Flexjar Analytics' },
    ],
    links: [
      { rel: 'stylesheet', href: akselStyles },
      { rel: 'stylesheet', href: globalStyles },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/static/flexjar.png',
      },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootDocument>
        <Outlet />
      </RootDocument>
    </QueryClientProvider>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="no" data-theme="dark">
      <head>
        <HeadContent />
      </head>
      <body data-theme="dark">
        <Theme theme="dark">
          {children}
        </Theme>
        <Scripts />
      </body>
    </html>
  )
}
