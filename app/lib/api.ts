import { requestAzureOboToken } from "@navikt/oasis";

const BACKEND_URL = process.env.FLEXJAR_BACKEND_URL || "http://localhost:8080";
const BACKEND_AUDIENCE = process.env.FLEXJAR_BACKEND_AUDIENCE || "api://dev-gcp.flex.flexjar-analytics-api/.default";

// Utility function to proxy API calls to the backend with OBO token
async function fetchFromBackend(path: string, params?: Record<string, string>): Promise<unknown> {
  // Build URL with query params
  const url = new URL(path, BACKEND_URL);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  // In production, get OBO token
  // For local dev, skip auth
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (process.env.NAIS_CLUSTER_NAME) {
    // We're in NAIS - need to do OBO token exchange
    try {
      const oboResult = await requestAzureOboToken(
        "", // Token from request
        BACKEND_AUDIENCE
      );
      if (oboResult.ok) {
        headers["Authorization"] = `Bearer ${oboResult.token}`;
      }
    } catch (e) {
      console.error("OBO token exchange failed:", e);
    }
  }

  const response = await fetch(url.toString(), { headers });
  
  if (!response.ok) {
    throw new Error(`Backend request failed: ${response.status}`);
  }

  return response.json();
}

// ============================================
// Answer Types - Den nye strukturen
// ============================================

export type FieldType = "RATING" | "TEXT" | "SINGLE_CHOICE" | "MULTI_CHOICE" | "DATE";

export interface ChoiceOption {
  id: string;
  label: string;
}

export interface Question {
  label: string;
  description?: string;
  options?: ChoiceOption[];  // For choice-typer
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

export type Answer = RatingAnswer | TextAnswer | SingleChoiceAnswer | MultiChoiceAnswer | DateAnswer;

// ============================================
// Field Stats Types - Statistikk per felt
// ============================================

export interface RatingStats {
  type: "rating";
  average: number;
  distribution: Record<number, number>;  // 1-5 -> count
}

export interface TextStats {
  type: "text";
  responseCount: number;
  responseRate: number;  // 0-1
}

export interface ChoiceStats {
  type: "choice";
  distribution: Record<string, { label: string; count: number; percentage: number }>;
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
  context?: SubmissionContext;
  answers: Answer[];
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
  
  // New: per-field statistics
  fieldStats: FieldStat[];
  
  period: {
    from: string | null;
    to: string | null;
    days: number;
  };
}

export interface TeamsAndApps {
  teams: Record<string, string[]>;
}

// API functions
export async function fetchStats(params: Record<string, string>): Promise<FeedbackStats> {
  return fetchFromBackend("/api/v1/intern/stats", params) as Promise<FeedbackStats>;
}

export async function fetchFeedback(params: Record<string, string>): Promise<FeedbackPage> {
  return fetchFromBackend("/api/v1/intern/feedback", params) as Promise<FeedbackPage>;
}

export async function fetchTeams(): Promise<TeamsAndApps> {
  return fetchFromBackend("/api/v1/intern/feedback/teams") as Promise<TeamsAndApps>;
}

export async function fetchTags(): Promise<string[]> {
  return fetchFromBackend("/api/v1/intern/feedback/tags") as Promise<string[]>;
}
