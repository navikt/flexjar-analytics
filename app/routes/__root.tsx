import { Theme } from "@navikt/ds-react/Theme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
/// <reference types="vite/client" />
import type * as React from "react";

// Import Aksel Darkside styles (supports light/dark mode)
import akselStyles from "@navikt/ds-css/darkside?url";
import { ThemeProvider, useTheme } from "~/lib/ThemeContext";
import globalStyles from "~/styles/global.css?url";

// Create QueryClient outside component to avoid recreation on each render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
    },
  },
});

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "robots", content: "noindex" },
      { title: "Flexjar Analytics" },
    ],
    links: [
      { rel: "stylesheet", href: akselStyles },
      { rel: "stylesheet", href: globalStyles },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/static/flexjar.png",
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <RootDocument>
          <Outlet />
        </RootDocument>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

declare global {
  interface Window {
    __theme: "light" | "dark";
  }
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <html lang="no" suppressHydrationWarning>
      <head>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Needed for theme init
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  localStorage.removeItem('theme');
                  var localTheme = localStorage.getItem('flexjar-theme-preference');
                  var supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches === true;
                  if (!localTheme && supportDarkMode) localTheme = 'dark';
                  if (!localTheme) localTheme = 'light';
                  
                  document.documentElement.setAttribute('data-theme', localTheme);
                  document.documentElement.style.colorScheme = localTheme;
                  document.body.setAttribute('data-theme', localTheme);
                  document.body.style.colorScheme = localTheme;
                  window.__theme = localTheme;
                } catch (e) {}
              })();
            `,
          }}
        />
        <HeadContent />
      </head>
      <body>
        <Theme theme={theme} hasBackground={false}>
          {children}
        </Theme>
        <Scripts />
      </body>
    </html>
  );
}
