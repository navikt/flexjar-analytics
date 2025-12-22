import type { Plugin } from "vite";

/**
 * Vite plugin to replace server-only modules with empty stubs in client builds.
 * This prevents bare module specifiers from appearing in browser code.
 */
export function serverOnlyPlugin(modules: string[]): Plugin {
  return {
    name: "server-only-stub",
    enforce: "pre",
    resolveId(id, _importer, options) {
      // Only stub in client builds, not in SSR
      if (options?.ssr) return null;

      // Check if this is a server-only module
      if (modules.some((mod) => id === mod || id.startsWith(`${mod}/`))) {
        return "\0server-only-stub";
      }
      return null;
    },
    load(id) {
      if (id === "\0server-only-stub") {
        // Return empty module exports for client-side
        return `
          export default {};
          export const getToken = () => null;
          export const validateAzureToken = async () => ({ ok: false });
          export const requestAzureOboToken = async () => ({ ok: false, token: null });
          export const register = { metrics: async () => '', contentType: 'text/plain' };
          export const collectDefaultMetrics = () => {};
        `;
      }
      return null;
    },
  };
}
