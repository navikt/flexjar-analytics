import { createServerFn } from "@tanstack/react-start";
import { zodValidator } from "@tanstack/zod-adapter";
import type {
  DeleteSurveyResult,
  FeedbackPage,
  FeedbackStats,
  MetadataKeysResponse,
  TeamsAndApps,
  TopTasksResponse,
} from "./api";
import type { AuthContext } from "./middleware/auth";
import { authMiddleware } from "./middleware/auth";
import {
  getMockFeedback,
  getMockStats,
  getMockSurveysByApp,
  getMockTags,
  getMockTeams,
  getMockTopTasksStats,
} from "./mockData";
import {
  DeleteFeedbackSchema,
  DeleteSurveySchema,
  FeedbackParamsSchema,
  MetadataKeysParamsSchema,
  StatsParamsSchema,
  TagActionSchema,
  TopTasksParamsSchema,
} from "./schemas";

// ============================================
// Helper function to build URL with params
// ============================================
function buildUrl(
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

// ============================================
// Helper to create fetch headers
// ============================================
function getHeaders(oboToken: string | null): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (oboToken) {
    headers.Authorization = `Bearer ${oboToken}`;
  }
  return headers;
}

// ============================================
// Stats Server Function
// ============================================
export const fetchStatsServerFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(zodValidator(StatsParamsSchema))
  .handler(async ({ data, context }): Promise<FeedbackStats> => {
    const { backendUrl, oboToken } = context as AuthContext;

    // Check for mock mode
    if (import.meta.env.VITE_MOCK_DATA === "true") {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(data)) {
        if (value) searchParams.set(key, value);
      }
      return getMockStats(searchParams);
    }

    const url = buildUrl(backendUrl, "/api/v1/intern/stats", data);
    const response = await fetch(url, {
      headers: getHeaders(oboToken),
    });

    if (!response.ok) {
      throw new Error(`Backend request failed: ${response.status}`);
    }

    return response.json() as Promise<FeedbackStats>;
  });

// ============================================
// Feedback Server Function
// ============================================
export const fetchFeedbackServerFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(zodValidator(FeedbackParamsSchema))
  .handler(async ({ data, context }): Promise<FeedbackPage> => {
    const { backendUrl, oboToken } = context as AuthContext;

    // Check for mock mode
    if (import.meta.env.VITE_MOCK_DATA === "true") {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(data)) {
        if (value) searchParams.set(key, value);
      }
      return getMockFeedback(searchParams);
    }

    // Convert page from 1-indexed to 0-indexed for backend
    const backendParams = { ...data };
    if (backendParams.page) {
      backendParams.page = String(Number.parseInt(backendParams.page, 10) - 1);
    }
    if (!backendParams.size) {
      backendParams.size = "20";
    }

    const url = buildUrl(backendUrl, "/api/v1/intern/feedback", backendParams);
    const response = await fetch(url, {
      headers: getHeaders(oboToken),
    });

    if (!response.ok) {
      throw new Error(`Backend request failed: ${response.status}`);
    }

    return response.json() as Promise<FeedbackPage>;
  });

// ============================================
// Top Tasks Server Function
// ============================================
export const fetchTopTasksServerFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(zodValidator(TopTasksParamsSchema))
  .handler(async ({ data, context }): Promise<TopTasksResponse> => {
    const { backendUrl, oboToken } = context as AuthContext;

    // Check for mock mode
    if (import.meta.env.VITE_MOCK_DATA === "true") {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(data)) {
        if (value) searchParams.set(key, value);
      }
      return getMockTopTasksStats(searchParams);
    }

    const url = buildUrl(backendUrl, "/api/v1/intern/stats/top-tasks", data);
    const response = await fetch(url, {
      headers: getHeaders(oboToken),
    });

    if (!response.ok) {
      throw new Error(`Backend request failed: ${response.status}`);
    }

    return response.json() as Promise<TopTasksResponse>;
  });

// ============================================
// Teams Server Function
// ============================================
export const fetchTeamsServerFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<TeamsAndApps> => {
    const { backendUrl, oboToken } = context as AuthContext;

    // Check for mock mode
    if (import.meta.env.VITE_MOCK_DATA === "true") {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return getMockTeams();
    }

    const url = buildUrl(backendUrl, "/api/v1/intern/feedback/teams");
    const response = await fetch(url, {
      headers: getHeaders(oboToken),
    });

    if (!response.ok) {
      throw new Error(`Backend request failed: ${response.status}`);
    }

    return response.json() as Promise<TeamsAndApps>;
  });

// ============================================
// Surveys by App Server Function
// ============================================
export const fetchSurveysByAppServerFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Record<string, string[]>> => {
    const { backendUrl, oboToken } = context as AuthContext;

    // Check for mock mode
    if (import.meta.env.VITE_MOCK_DATA === "true") {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return getMockSurveysByApp();
    }

    const url = buildUrl(backendUrl, "/api/v1/intern/feedback/surveys");
    const response = await fetch(url, {
      headers: getHeaders(oboToken),
    });

    if (!response.ok) {
      throw new Error(`Backend request failed: ${response.status}`);
    }

    return response.json() as Promise<Record<string, string[]>>;
  });

// ============================================
// Tags Server Function
// ============================================
export const fetchTagsServerFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<string[]> => {
    const { backendUrl, oboToken } = context as AuthContext;

    // Check for mock mode
    if (import.meta.env.VITE_MOCK_DATA === "true") {
      await new Promise((resolve) => setTimeout(resolve, 500));
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

// ============================================
// Metadata Keys Server Function
// ============================================
export const fetchMetadataKeysServerFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(zodValidator(MetadataKeysParamsSchema))
  .handler(async ({ data, context }): Promise<MetadataKeysResponse> => {
    const { backendUrl, oboToken } = context as AuthContext;

    // Check for mock mode
    if (import.meta.env.VITE_MOCK_DATA === "true") {
      await new Promise((resolve) => setTimeout(resolve, 300));
      // Return mock metadata keys based on survey
      if (data.surveyId === "ny-oppfolgingsplan-sykmeldt") {
        return {
          feedbackId: data.surveyId,
          metadataKeys: {
            harDialogmote: ["true", "false"],
            sykmeldingstype: ["avventende", "standard", "gradert"],
          },
        };
      }
      return { feedbackId: data.surveyId, metadataKeys: {} };
    }

    const url = buildUrl(backendUrl, "/api/v1/intern/feedback/metadata-keys", {
      feedbackId: data.surveyId,
    });
    const response = await fetch(url, {
      headers: getHeaders(oboToken),
    });

    if (!response.ok) {
      throw new Error(`Backend request failed: ${response.status}`);
    }

    return response.json() as Promise<MetadataKeysResponse>;
  });

// ============================================
// Add Tag Server Function
// ============================================
export const addTagServerFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(zodValidator(TagActionSchema))
  .handler(async ({ data, context }): Promise<{ success: boolean }> => {
    const { backendUrl, oboToken } = context as AuthContext;

    const url = `${backendUrl}/api/v1/intern/feedback/${data.feedbackId}/tags`;
    const response = await fetch(url, {
      method: "POST",
      headers: getHeaders(oboToken),
      body: JSON.stringify({ tag: data.tag }),
    });

    if (!response.ok) {
      throw new Error("Failed to add tag");
    }

    return { success: true };
  });

// ============================================
// Remove Tag Server Function
// ============================================
export const removeTagServerFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(zodValidator(TagActionSchema))
  .handler(async ({ data, context }): Promise<{ success: boolean }> => {
    const { backendUrl, oboToken } = context as AuthContext;

    const url = `${backendUrl}/api/v1/intern/feedback/${data.feedbackId}/tags?tag=${encodeURIComponent(data.tag)}`;
    const response = await fetch(url, {
      method: "DELETE",
      headers: getHeaders(oboToken),
    });

    if (!response.ok) {
      throw new Error("Failed to remove tag");
    }

    return { success: true };
  });

// ============================================
// Delete Survey Server Function
// ============================================
export const deleteSurveyServerFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(zodValidator(DeleteSurveySchema))
  .handler(async ({ data, context }): Promise<DeleteSurveyResult> => {
    const { backendUrl, oboToken } = context as AuthContext;

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

// ============================================
// Delete Feedback Server Function
// ============================================
export const deleteFeedbackServerFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(zodValidator(DeleteFeedbackSchema))
  .handler(async ({ data, context }): Promise<{ success: boolean }> => {
    const { backendUrl, oboToken } = context as AuthContext;

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
