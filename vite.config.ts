import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  base:
    process.env.NODE_ENV === "production"
      ? "https://cdn.nav.no/team-esyfo/flexjar-analytics/client"
      : undefined,

  server: {
    port: 3000,
  },

  // Externalize Node.js-only dependencies from client bundle
  ssr: {
    external: ["@navikt/oasis", "prom-client"],
    noExternal: [],
  },

  build: {
    rollupOptions: {
      external: ["@navikt/oasis", "prom-client", "crypto"],
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
