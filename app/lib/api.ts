const PROXY_BASE_PATH = "/api/backend";

// Utility function to proxy API calls to the backend with OBO token
async function fetchFromBackend(
  path: string,
  params?: Record<string, string>,
): Promise<unknown> {
  const searchParams = new URLSearchParams();
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.set(key, String(value));
      }
    }
  }

  const queryString = searchParams.toString();
  const targetUrl = `${PROXY_BASE_PATH}${path}${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(targetUrl, {
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Backend request failed: ${response.status}`);
  }

  return response.json();
}

// ============================================
// Answer Types - Den nye strukturen
// ============================================

export type FieldType =
  | "RATING"
  | "TEXT"
  | "SINGLE_CHOICE"
  | "MULTI_CHOICE"
  | "DATE";

export type SurveyType = "rating" | "topTasks" | "custom";

export interface ChoiceOption {
  id: string;
  label: string;
}

export interface Question {
  label: string;
  description?: string;
  options?: ChoiceOption[]; // For choice-typer
}

export interface BaseAnswer {
  fieldId: string;
  fieldType: FieldType;
  question: Question;
}

export interface RatingAnswer extends BaseAnswer {
  fieldType: "RATING";
  value: { type: "rating"; rating: number };
}

export interface TextAnswer extends BaseAnswer {
  fieldType: "TEXT";
  value: { type: "text"; text: string };
}

export interface SingleChoiceAnswer extends BaseAnswer {
  fieldType: "SINGLE_CHOICE";
  value: { type: "singleChoice"; selectedOptionId: string };
}

export interface MultiChoiceAnswer extends BaseAnswer {
  fieldType: "MULTI_CHOICE";
  value: { type: "multiChoice"; selectedOptionIds: string[] };
}

export interface DateAnswer extends BaseAnswer {
  fieldType: "DATE";
  value: { type: "date"; date: string };
}

export type Answer =
  | RatingAnswer
  | TextAnswer
  | SingleChoiceAnswer
  | MultiChoiceAnswer
  | DateAnswer;

// ============================================
// Field Stats Types - Statistikk per felt
// ============================================

export interface RatingStats {
  type: "rating";
  average: number;
  distribution: Record<number, number>; // 1-5 -> count
}

export interface TextStats {
  type: "text";
  responseCount: number;
  responseRate: number; // 0-1
}

export interface ChoiceStats {
  type: "choice";
  distribution: Record<
    string,
    { label: string; count: number; percentage: number }
  >;
}

export type FieldStats = RatingStats | TextStats | ChoiceStats;

export interface FieldStat {
  fieldId: string;
  fieldType: FieldType;
  label: string;
  stats: FieldStats;
}

// ============================================
// Context Types - Browser metadata
// ============================================

export type DeviceType = "mobile" | "tablet" | "desktop";

export interface SubmissionContext {
  url?: string;
  pathname?: string;
  deviceType?: DeviceType;
  viewportWidth?: number;
  viewportHeight?: number;
}

// ============================================
// API Response Types
// ============================================

export interface FeedbackDto {
  id: string;
  submittedAt: string;
  app: string | null;
  surveyId: string;
  surveyVersion?: string;
  surveyType?: SurveyType;
  context?: SubmissionContext;
  /** Custom metadata for segmentation (e.g. { harDialogmote: "true" }) */
  metadata?: Record<string, string>;
  answers: Answer[];
  tags?: string[];
  sensitiveDataRedacted: boolean;
}

export interface FeedbackPage {
  content: FeedbackDto[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface FeedbackStats {
  totalCount: number;
  countWithText: number;
  countWithoutText: number;

  // Legacy aggregations (backwards compat)
  byRating: Record<string, number>;
  byApp: Record<string, number>;
  byDate: Record<string, number>;
  byFeedbackId: Record<string, number>;
  averageRating: number | null;

  // Rating trend over time
  ratingByDate: Record<string, { average: number; count: number }>;

  // Device & context stats
  byDevice: Record<string, { count: number; averageRating: number }>;
  byPathname: Record<string, { count: number; averageRating: number }>;
  lowestRatingPaths: Record<string, { count: number; averageRating: number }>;

  // New: per-field statistics
  fieldStats: FieldStat[];

  surveyType?: SurveyType;

  period: {
    from: string | null;
    to: string | null;
    days: number;
  };
}

export interface TeamsAndApps {
  teams: Record<string, string[]>;
}

// ============================================
// Top Tasks Types
// ============================================

export interface TopTaskStats {
  task: string;
  totalCount: number;
  successCount: number;
  partialCount: number;
  failureCount: number;
  successRate: number;
  formattedSuccessRate: string;
  blockerCounts: Record<string, number>;
}

export interface TopTasksResponse {
  totalSubmissions: number;
  tasks: TopTaskStats[];
  dailyStats: Record<string, { total: number; success: number }>;
  questionText?: string;
}

import {
  getMockFeedback,
  getMockStats,
  getMockSurveysByApp,
  getMockTags,
  getMockTeams,
  getMockTopTasksStats,
} from "./mockData";

// API functions
export async function fetchStats(
  params: Record<string, string>,
): Promise<FeedbackStats> {
  if (import.meta.env.VITE_MOCK_DATA === "true") {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return getMockStats(new URLSearchParams(params));
  }
  return fetchFromBackend(
    "/api/v1/intern/stats",
    params,
  ) as Promise<FeedbackStats>;
}

export async function fetchTopTasksStats(
  params: Record<string, string>,
): Promise<TopTasksResponse> {
  if (import.meta.env.VITE_MOCK_DATA === "true") {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return getMockTopTasksStats(new URLSearchParams(params));
  }
  return fetchFromBackend(
    "/api/v1/intern/stats/top-tasks",
    params,
  ) as Promise<TopTasksResponse>;
}

export async function fetchFeedback(
  params: Record<string, string>,
): Promise<FeedbackPage> {
  if (import.meta.env.VITE_MOCK_DATA === "true") {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return getMockFeedback(new URLSearchParams(params));
  }
  return fetchFromBackend(
    "/api/v1/intern/feedback",
    params,
  ) as Promise<FeedbackPage>;
}

export async function fetchTeams(): Promise<TeamsAndApps> {
  if (import.meta.env.VITE_MOCK_DATA === "true") {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return getMockTeams();
  }
  return fetchFromBackend(
    "/api/v1/intern/feedback/teams",
  ) as Promise<TeamsAndApps>;
}

export async function fetchSurveysByApp(): Promise<Record<string, string[]>> {
  if (import.meta.env.VITE_MOCK_DATA === "true") {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return getMockSurveysByApp();
  }
  return fetchFromBackend("/api/v1/intern/feedback/surveys") as Promise<
    Record<string, string[]>
  >;
}

export async function fetchTags(): Promise<string[]> {
  if (import.meta.env.VITE_MOCK_DATA === "true") {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return getMockTags();
  }
  return fetchFromBackend("/api/v1/intern/feedback/tags") as Promise<string[]>;
}

export interface MetadataKeysResponse {
  feedbackId: string;
  metadataKeys: Record<string, string[]>;
}

/**
 * Fetch available metadata keys and values for a specific survey.
 * Used for building dynamic filter UI in analytics dashboard.
 */
export async function fetchMetadataKeys(
  surveyId: string,
): Promise<MetadataKeysResponse> {
  if (import.meta.env.VITE_MOCK_DATA === "true") {
    await new Promise((resolve) => setTimeout(resolve, 300));
    // Return mock metadata keys based on survey
    if (surveyId === "ny-oppfolgingsplan-sykmeldt") {
      return {
        feedbackId: surveyId,
        metadataKeys: {
          harDialogmote: ["true", "false"],
          sykmeldingstype: ["avventende", "standard", "gradert"],
        },
      };
    }
    return { feedbackId: surveyId, metadataKeys: {} };
  }
  return fetchFromBackend("/api/v1/intern/feedback/metadata-keys", {
    feedbackId: surveyId,
  }) as Promise<MetadataKeysResponse>;
}

// Tag management
export async function addTag(feedbackId: string, tag: string): Promise<void> {
  const response = await fetch(
    `/api/backend/api/v1/intern/feedback/${feedbackId}/tags`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tag }),
    },
  );
  if (!response.ok) {
    throw new Error("Failed to add tag");
  }
}

export async function removeTag(
  feedbackId: string,
  tag: string,
): Promise<void> {
  const response = await fetch(
    `/api/backend/api/v1/intern/feedback/${feedbackId}/tags?tag=${encodeURIComponent(tag)}`,
    {
      method: "DELETE",
    },
  );
  if (!response.ok) {
    throw new Error("Failed to remove tag");
  }
}

// Bulk delete survey
export interface DeleteSurveyResult {
  deletedCount: number;
  surveyId: string;
}

export async function deleteSurvey(
  surveyId: string,
): Promise<DeleteSurveyResult> {
  const response = await fetch(
    `/api/backend/api/v1/intern/feedback/survey/${encodeURIComponent(surveyId)}`,
    {
      method: "DELETE",
    },
  );
  if (!response.ok) {
    throw new Error("Failed to delete survey");
  }
  return response.json();
}

// Delete single feedback
export async function deleteFeedback(feedbackId: string): Promise<void> {
  const response = await fetch(
    `/api/backend/api/v1/intern/feedback/${encodeURIComponent(feedbackId)}`,
    {
      method: "DELETE",
    },
  );
  if (!response.ok) {
    throw new Error("Failed to delete feedback");
  }
}
