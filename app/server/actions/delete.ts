import { createServerFn } from "@tanstack/react-start";
import { zodValidator } from "@tanstack/zod-adapter";
import { authMiddleware } from "~/server/middleware/auth";
import {
  type AuthContext,
  getHeaders,
  isMockMode,
  mockDelay,
} from "~/server/utils";
import type { DeleteSurveyResult } from "~/types/api";
import { DeleteFeedbackSchema, DeleteSurveySchema } from "~/types/schemas";

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

    const url = `${backendUrl}/api/v1/intern/feedback/survey/${encodeURIComponent(data.surveyId)}`;
    const response = await fetch(url, {
      method: "DELETE",
      headers: getHeaders(oboToken),
    });

    if (!response.ok) {
      throw new Error("Failed to delete survey");
    }

    return response.json() as Promise<DeleteSurveyResult>;
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
      await mockDelay();
      return { success: true };
    }

    const url = `${backendUrl}/api/v1/intern/feedback/${encodeURIComponent(data.feedbackId)}`;
    const response = await fetch(url, {
      method: "DELETE",
      headers: getHeaders(oboToken),
    });

    if (!response.ok) {
      throw new Error("Failed to delete feedback");
    }

    return { success: true };
  });
