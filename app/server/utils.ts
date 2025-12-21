import type { AuthContext } from "~/server/middleware/auth";

/**
 * Check if the application is running in mock mode.
 * Checks both Vite client-side and Node.js server-side environment variables.
 */
import { publicEnv } from "~/publicEnv";
import { serverEnv } from "~/serverEnv";

/**
 * Check if the application is running in mock mode.
 * Checks both Client-side and Server-side type-safe environment variables.
 */
export function isMockMode(): boolean {
  // Try publicEnv first (Client-side)
  if (publicEnv.VITE_MOCK_DATA === "true") {
    return true;
  }
  // Fallback to env (Server-side)
  // We need to be careful accessing 'env' in client context if it wasn't stripped.
  // app/env.ts handles this by returning empty object on client.
  if (
    serverEnv.NODE_ENV === "development" &&
    process.env.VITE_MOCK_DATA === "true"
  ) {
    // Note: env.ts serverSchema doesn't have VITE_MOCK_DATA in serverSchema currently,
    // but we can add it or just rely on the publicEnv check if it works on server too (import.meta.env might be polyfilled).
    // Actually, TanStack Start makes VITE_ prefixed vars available on server via process.env usually?
    // Let's rely on publicEnv for VITE_ vars if possible, or check process.env raw if needed for now until schema update.
    return true;
  }

  return false;
}

/**
 * Build a URL with query parameters.
 */
export function buildUrl(
  baseUrl: string,
  path: string,
  params?: Record<string, string | undefined>,
): string {
  const url = new URL(path, baseUrl);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, value);
      }
    }
  }
  return url.toString();
}

/**
 * Create headers for backend requests with optional auth token.
 */
export function getHeaders(oboToken: string | null): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (oboToken) {
    headers.Authorization = `Bearer ${oboToken}`;
  }
  return headers;
}

/**
 * Simulate mock delay for realistic testing.
 */
export function mockDelay(ms = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Re-export AuthContext type for convenience
export type { AuthContext };
