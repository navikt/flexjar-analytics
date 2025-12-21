import { createServerFn } from "@tanstack/react-start";
import { zodValidator } from "@tanstack/zod-adapter";
import { getMockTags } from "~/mock/mockData";
import { authMiddleware } from "~/server/middleware/auth";
import {
  type AuthContext,
  buildUrl,
  getHeaders,
  isMockMode,
  mockDelay,
} from "~/server/utils";
import { TagActionSchema } from "~/types/schemas";

/**
 * Fetch all available tags.
 */
export const fetchTagsServerFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<string[]> => {
    const { backendUrl, oboToken } = context as AuthContext;

    if (isMockMode()) {
      await mockDelay();
      return getMockTags();
    }

    const url = buildUrl(backendUrl, "/api/v1/intern/feedback/tags");
    const response = await fetch(url, {
      headers: getHeaders(oboToken),
    });

    if (!response.ok) {
      throw new Error(`Backend request failed: ${response.status}`);
    }

    return response.json() as Promise<string[]>;
  });

/**
 * Add a tag to a feedback item.
 */
export const addTagServerFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(zodValidator(TagActionSchema))
  .handler(async ({ data, context }): Promise<{ success: boolean }> => {
    const { backendUrl, oboToken } = context as AuthContext;

    if (isMockMode()) {
      await mockDelay(300);
      return { success: true };
    }

    const url = `${backendUrl}/api/v1/intern/feedback/${encodeURIComponent(data.feedbackId)}/tags/${encodeURIComponent(data.tag)}`;
    const response = await fetch(url, {
      method: "POST",
      headers: getHeaders(oboToken),
    });

    if (!response.ok) {
      throw new Error("Failed to add tag");
    }

    return { success: true };
  });

/**
 * Remove a tag from a feedback item.
 */
export const removeTagServerFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(zodValidator(TagActionSchema))
  .handler(async ({ data, context }): Promise<{ success: boolean }> => {
    const { backendUrl, oboToken } = context as AuthContext;

    if (isMockMode()) {
      await mockDelay(300);
      return { success: true };
    }

    const url = `${backendUrl}/api/v1/intern/feedback/${encodeURIComponent(data.feedbackId)}/tags/${encodeURIComponent(data.tag)}`;
    const response = await fetch(url, {
      method: "DELETE",
      headers: getHeaders(oboToken),
    });

    if (!response.ok) {
      throw new Error("Failed to remove tag");
    }

    return { success: true };
  });
