import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    tsconfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tanstackStart({
      // Use app directory as source (non-standard but keeps our structure)
      srcDirectory: "app",
    }),
    // React plugin must come after TanStack Start plugin
    viteReact(),
  ],
});
