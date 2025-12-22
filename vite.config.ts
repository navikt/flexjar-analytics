import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// Server-only modules that should never be bundled or referenced in client code
const serverOnlyModules = ["@navikt/oasis", "prom-client", "crypto"];

export default defineConfig({
  base:
    process.env.NODE_ENV === "production"
      ? "https://cdn.nav.no/team-esyfo/flexjar-analytics/client"
      : undefined,

  server: {
    port: 3000,
  },

  // Externalize Node.js-only dependencies from SSR bundle
  ssr: {
    external: serverOnlyModules,
    noExternal: [],
  },

  // Exclude from dependency optimization (prevents client analysis)
  optimizeDeps: {
    exclude: serverOnlyModules,
  },

  build: {
    rollupOptions: {
      // Mark as external for client build
      external: (id) => {
        return serverOnlyModules.some(
          (mod) => id === mod || id.startsWith(`${mod}/`),
        );
      },
    },
  },

  // Nitro configuration for deployment
  nitro: {
    preset: "node-server",
  },

  plugins: [
    tsconfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tanstackStart({
      // Use app directory as source (non-standard but keeps our structure)
      srcDirectory: "app",
    }),
    // Nitro handles production server deployment
    nitro(),
    // React plugin must come after TanStack Start plugin
    viteReact(),
  ],
});
