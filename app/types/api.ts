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

export type SurveyType =
  | "rating"
  | "topTasks"
  | "discovery"
  | "taskPriority"
  | "custom";

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
  /** Top keywords extracted from text responses */
  topKeywords: Array<{ word: string; count: number }>;
  /** Most recent text responses with timestamps */
  recentResponses: Array<{ text: string; submittedAt: string }>;
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
  /** Duration in milliseconds from visit start to submission */
  durationMs?: number;
  /** ISO timestamp when the user started the session/task */
  visitStartedAt?: string;
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

  // Privacy threshold info
  privacy?: PrivacyInfo;
}

/**
 * Privacy information for aggregation threshold
 * Used to prevent identification of individuals in small datasets
 */
export interface PrivacyInfo {
  masked: boolean;
  reason?: string;
  threshold: number;
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
  // TPI (Task Performance Indicator) fields
  avgTimeMs?: number;
  targetTimeMs?: number;
  tpiScore?: number;
}

export interface TopTasksResponse {
  totalSubmissions: number;
  tasks: TopTaskStats[];
  dailyStats: Record<string, { total: number; success: number }>;
  questionText?: string;
  // TPI aggregate metrics
  // TPI aggregate metrics
  overallTpi?: number;
  avgCompletionTimeMs?: number;
  /** Percentage of submissions that fell into 'Other' category. Warning if > 15%. */
  otherTasksPercentage?: number;
}

// ============================================
// Metadata Keys Types
// ============================================

export interface MetadataKeysResponse {
  feedbackId: string;
  metadataKeys: Record<string, string[]>;
}

// ============================================
// Discovery Survey Types
// ============================================

export interface DiscoveryTheme {
  theme: string;
  count: number;
  successRate: number;
  examples: string[];
}

export interface DiscoveryResponse {
  totalSubmissions: number;
  wordFrequency: Array<{ word: string; count: number }>;
  themes: DiscoveryTheme[];
  recentResponses: Array<{
    task: string;
    success: "yes" | "partial" | "no";
    blocker?: string;
    submittedAt: string;
  }>;
}

// ============================================
// Text Theme Types (for theme management)
// ============================================

export interface TextTheme {
  id: string;
  team: string;
  name: string;
  keywords: string[];
  color?: string;
  priority: number;
}

export interface CreateThemeInput {
  name: string;
  keywords: string[];
  color?: string;
  priority?: number;
}

export interface UpdateThemeInput {
  name?: string;
  keywords?: string[];
  color?: string;
  priority?: number;
}

// ============================================
// Task Priority Survey Types
// ============================================

export interface TaskVote {
  task: string;
  votes: number;
  percentage: number;
}

export interface TaskPriorityResponse {
  totalSubmissions: number;
  tasks: TaskVote[];
  /** Index in tasks array where cumulative percentage hits 80% (the "long neck") */
  longNeckCutoff: number;
  cumulativePercentageAt5: number;
}

// ============================================
// Delete Survey Types
// ============================================

export interface DeleteSurveyResult {
  deletedCount: number;
  surveyId: string;
}
