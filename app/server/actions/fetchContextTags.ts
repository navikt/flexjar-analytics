import { createServerFn } from "@tanstack/react-start";
import { zodValidator } from "@tanstack/zod-adapter";
import { authMiddleware } from "~/server/middleware/auth";
import {
  type AuthContext,
  buildUrl,
  getHeaders,
  isMockMode,
  mockDelay,
} from "~/server/utils";
import type { ContextTagsResponse } from "~/types/api";
import { ContextTagsParamsSchema } from "~/types/schemas";
import { handleApiResponse } from "../fetchUtils";

/**
 * Fetch available context tags and values for a specific survey.
 */
export const fetchContextTagsServerFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(zodValidator(ContextTagsParamsSchema))
  .handler(async ({ data, context }): Promise<ContextTagsResponse> => {
    const { backendUrl, oboToken } = context as AuthContext;

    console.log(
      "[fetchContextTags] isMockMode:",
      isMockMode(),
      "surveyId:",
      data.surveyId,
    );

    if (isMockMode()) {
      await mockDelay(300);
      console.log("[fetchContextTags] Returning mock data for", data.surveyId);
      // Return mock context tags with realistic counts
      return {
        feedbackId: data.surveyId,
        contextTags: {
          harAktivSykmelding: [
            { value: "Ja", count: 67 },
            { value: "Nei", count: 33 },
          ],
          ukeSykefravær: [
            { value: "1", count: 45 },
            { value: "2", count: 38 },
            { value: "3", count: 32 },
            { value: "4", count: 28 },
            { value: "5", count: 22 },
            { value: "6", count: 18 },
            { value: "7", count: 12 },
            { value: "8", count: 8 },
          ],
        },
        maxCardinality: data.maxCardinality ?? 15,
      };
    }

    const url = buildUrl(backendUrl, "/api/v1/intern/feedback/context-tags", {
      feedbackId: data.surveyId,
      team: "flex", // TODO: Get from auth context
      maxCardinality: String(data.maxCardinality ?? 10),
    });
    const response = await fetch(url, {
      headers: getHeaders(oboToken),
    });

    await handleApiResponse(response);

    return response.json() as Promise<ContextTagsResponse>;
  });
