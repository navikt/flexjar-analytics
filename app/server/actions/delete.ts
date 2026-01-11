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
import type { DeleteSurveyResult } from "~/types/api";
import type { FeedbackPage } from "~/types/api";
import { DeleteFeedbackSchema, DeleteSurveySchema } from "~/types/schemas";
import { handleApiResponse } from "../fetchUtils";

/**
 * Delete all feedback for a specific survey.
 */
export const deleteSurveyServerFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(zodValidator(DeleteSurveySchema))
  .handler(async ({ data, context }): Promise<DeleteSurveyResult> => {
    const { backendUrl, oboToken } = context as AuthContext;

    if (isMockMode()) {
      await mockDelay();
      return { deletedCount: 42, surveyId: data.surveyId };
    }

    const headers = getHeaders(oboToken);
    const pageSize = 200;

    let page = 0;
    let deletedCount = 0;

    // Backend deletes are soft-delete (clears text answers) per feedback item.
    // This function batches by paging through feedback for the survey.
    while (true) {
      const listUrl = buildUrl(backendUrl, "/api/v1/intern/feedback", {
        surveyId: data.surveyId,
        page: String(page),
        size: String(pageSize),
      });

      const listResponse = await fetch(listUrl, { headers });
      await handleApiResponse(listResponse);

      const feedbackPage = (await listResponse.json()) as FeedbackPage;

      // Safety: avoid infinite loops on unexpected paging.
      if (feedbackPage.content.length === 0) {
        break;
      }

      for (const item of feedbackPage.content) {
        const deleteUrl = `${backendUrl}/api/v1/intern/feedback/${encodeURIComponent(item.id)}`;
        const deleteResponse = await fetch(deleteUrl, {
          method: "DELETE",
          headers,
        });
        await handleApiResponse(deleteResponse);
        deletedCount += 1;
      }

      if (!feedbackPage.hasNext) {
        break;
      }

      page += 1;
    }

    return { deletedCount, surveyId: data.surveyId };
  });

/**
 * Delete a single feedback item by ID.
 */
export const deleteFeedbackServerFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(zodValidator(DeleteFeedbackSchema))
  .handler(async ({ data, context }): Promise<{ success: boolean }> => {
    const { backendUrl, oboToken } = context as AuthContext;

    if (isMockMode()) {
      const { deleteMockFeedback } = await import("~/mock/mockData");
      await mockDelay();
      const deleted = deleteMockFeedback(data.id);
      return { success: deleted };
    }

    const url = `${backendUrl}/api/v1/intern/feedback/${encodeURIComponent(data.id)}`;
    const response = await fetch(url, {
      method: "DELETE",
      headers: getHeaders(oboToken),
    });

    await handleApiResponse(response);

    return { success: true };
  });
