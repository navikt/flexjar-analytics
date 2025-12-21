import { createServerFn } from "@tanstack/react-start";
import { zodValidator } from "@tanstack/zod-adapter";
import { getMockFeedback } from "~/mock/mockData";
import { authMiddleware } from "~/server/middleware/auth";
import {
  type AuthContext,
  buildUrl,
  getHeaders,
  isMockMode,
  mockDelay,
} from "~/server/utils";
import type { FeedbackPage } from "~/types/api";
import { FeedbackParamsSchema } from "~/types/schemas";

/**
 * Fetch paginated feedback items with filtering support.
 */
export const fetchFeedbackServerFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(zodValidator(FeedbackParamsSchema))
  .handler(async ({ data, context }): Promise<FeedbackPage> => {
    const { backendUrl, oboToken } = context as AuthContext;

    if (isMockMode()) {
      await mockDelay();
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(data)) {
        if (value) searchParams.set(key, value);
      }
      // Backend uses 0-indexed pages, frontend uses 1-indexed
      const page = data.page ? String(Number.parseInt(data.page, 10) - 1) : "0";
      searchParams.set("page", page);
      return getMockFeedback(searchParams);
    }

    // Backend uses 0-indexed pages
    const backendParams = {
      ...data,
      page: data.page ? String(Number.parseInt(data.page, 10) - 1) : "0",
    };

    const url = buildUrl(backendUrl, "/api/v1/intern/feedback", backendParams);
    const response = await fetch(url, {
      headers: getHeaders(oboToken),
    });

    if (!response.ok) {
      throw new Error(`Backend request failed: ${response.status}`);
    }

    return response.json() as Promise<FeedbackPage>;
  });
