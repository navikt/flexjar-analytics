import {
  getToken,
  requestAzureOboToken,
  validateAzureToken,
} from "@navikt/oasis";
import { createMiddleware } from "@tanstack/react-start";

const BACKEND_URL = process.env.FLEXJAR_BACKEND_URL || "http://localhost:8080";
const BACKEND_AUDIENCE =
  process.env.FLEXJAR_BACKEND_AUDIENCE ||
  "api://dev-gcp.flex.flexjar-analytics-api/.default";

export interface AuthContext {
  backendUrl: string;
  oboToken: string | null;
}

/**
 * Reusable authentication middleware for server functions.
 *
 * - In NAIS environment: Validates Azure token and exchanges for OBO token
 * - In local dev: Returns null token (mock data mode)
 *
 * Provides AuthContext to downstream handlers with backendUrl and oboToken.
 */
export const authMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const isNais = !!process.env.NAIS_CLUSTER_NAME;

    if (!isNais) {
      // Local development: no authentication required
      return next({
        context: {
          backendUrl: BACKEND_URL,
          oboToken: null,
        } as AuthContext,
      });
    }

    // Production: validate and exchange token
    const token = getToken(request);

    if (!token) {
      throw new Error("Unauthorized: No token provided");
    }

    const validation = await validateAzureToken(token);
    if (!validation.ok) {
      throw new Error("Unauthorized: Invalid token");
    }

    const oboResult = await requestAzureOboToken(token, BACKEND_AUDIENCE);
    if (!oboResult.ok) {
      console.error("OBO token exchange failed");
      throw new Error("Token exchange failed");
    }

    return next({
      context: {
        backendUrl: BACKEND_URL,
        oboToken: oboResult.token,
      } as AuthContext,
    });
  },
);
