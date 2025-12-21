// ============================================
// Type-only exports for flexjar-analytics
// All API logic is now in serverFunctions.ts
// ============================================

// ============================================
// Answer Types
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
  options?: ChoiceOption[];
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
// Field Stats Types
// ============================================

export interface RatingStats {
  type: "rating";
  average: number;
  distribution: Record<number, number>;
}

export interface TextStats {
  type: "text";
  responseCount: number;
  responseRate: number;
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
// Context Types
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

// ============================================
// Metadata Keys Types
// ============================================

export interface MetadataKeysResponse {
  feedbackId: string;
  metadataKeys: Record<string, string[]>;
}

// ============================================
// Delete Survey Types
// ============================================

export interface DeleteSurveyResult {
  deletedCount: number;
  surveyId: string;
}
