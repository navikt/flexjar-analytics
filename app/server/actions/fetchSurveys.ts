import { createServerFn } from "@tanstack/react-start";
import { getMockSurveysByApp } from "~/mock/mockData";
import { authMiddleware } from "~/server/middleware/auth";
import {
  type AuthContext,
  buildUrl,
  getHeaders,
  isMockMode,
  mockDelay,
} from "~/server/utils";

/**
 * Fetch surveys grouped by application.
 */
export const fetchSurveysByAppServerFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Record<string, string[]>> => {
    const { backendUrl, oboToken } = context as AuthContext;

    if (isMockMode()) {
      await mockDelay();
      return getMockSurveysByApp();
    }

    const url = buildUrl(backendUrl, "/api/v1/intern/surveys");
    const response = await fetch(url, {
      headers: getHeaders(oboToken),
    });

    if (!response.ok) {
      throw new Error(`Backend request failed: ${response.status}`);
    }

    return response.json() as Promise<Record<string, string[]>>;
  });
