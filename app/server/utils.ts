import type { AuthContext } from "~/server/middleware/auth";

/**
 * Check if the application is running in mock mode.
 * Checks both Vite client-side and Node.js server-side environment variables.
 */
export function isMockMode(): boolean {
  // Try import.meta.env first (Vite client-side)
  if (
    typeof import.meta !== "undefined" &&
    import.meta.env?.VITE_MOCK_DATA === "true"
  ) {
    return true;
  }
  // Fallback to process.env (server-side)
  if (
    typeof process !== "undefined" &&
    process.env?.VITE_MOCK_DATA === "true"
  ) {
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
