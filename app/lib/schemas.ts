import { z } from "zod";

// ============================================
// Input Schemas for Server Functions
// ============================================

export const StatsParamsSchema = z.object({
  app: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  feedbackId: z.string().optional(),
  deviceType: z.string().optional(),
  ubehandlet: z.string().optional(),
});

export type StatsParams = z.infer<typeof StatsParamsSchema>;

export const FeedbackParamsSchema = z.object({
  app: z.string().optional(),
  feedbackId: z.string().optional(),
  page: z.string().optional(),
  size: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  medTekst: z.string().optional(),
  stjerne: z.string().optional(),
  fritekst: z.string().optional(),
  tags: z.string().optional(),
  lavRating: z.string().optional(),
  pathname: z.string().optional(),
  deviceType: z.string().optional(),
});

export type FeedbackParams = z.infer<typeof FeedbackParamsSchema>;

export const TopTasksParamsSchema = z.object({
  surveyId: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export type TopTasksParams = z.infer<typeof TopTasksParamsSchema>;

export const TagActionSchema = z.object({
  feedbackId: z.string(),
  tag: z.string(),
});

export type TagAction = z.infer<typeof TagActionSchema>;

export const DeleteSurveySchema = z.object({
  surveyId: z.string(),
});

export type DeleteSurvey = z.infer<typeof DeleteSurveySchema>;

export const DeleteFeedbackSchema = z.object({
  feedbackId: z.string(),
});

export type DeleteFeedback = z.infer<typeof DeleteFeedbackSchema>;

export const MetadataKeysParamsSchema = z.object({
  surveyId: z.string(),
});

export type MetadataKeysParams = z.infer<typeof MetadataKeysParamsSchema>;

// ============================================
// Response Schemas (for runtime validation)
// ============================================

const FieldTypeSchema = z.enum([
  "RATING",
  "TEXT",
  "SINGLE_CHOICE",
  "MULTI_CHOICE",
  "DATE",
]);

const SurveyTypeSchema = z.enum(["rating", "topTasks", "custom"]);

const ChoiceOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
});

const QuestionSchema = z.object({
  label: z.string(),
  description: z.string().optional(),
  options: z.array(ChoiceOptionSchema).optional(),
});

const RatingValueSchema = z.object({
  type: z.literal("rating"),
  rating: z.number(),
});

const TextValueSchema = z.object({
  type: z.literal("text"),
  text: z.string(),
});

const SingleChoiceValueSchema = z.object({
  type: z.literal("singleChoice"),
  selectedOptionId: z.string(),
});

const MultiChoiceValueSchema = z.object({
  type: z.literal("multiChoice"),
  selectedOptionIds: z.array(z.string()),
});

const DateValueSchema = z.object({
  type: z.literal("date"),
  date: z.string(),
});

const AnswerValueSchema = z.discriminatedUnion("type", [
  RatingValueSchema,
  TextValueSchema,
  SingleChoiceValueSchema,
  MultiChoiceValueSchema,
  DateValueSchema,
]);

const AnswerSchema = z.object({
  fieldId: z.string(),
  fieldType: FieldTypeSchema,
  question: QuestionSchema,
  value: AnswerValueSchema,
});

const DeviceTypeSchema = z.enum(["mobile", "tablet", "desktop"]);

const SubmissionContextSchema = z.object({
  url: z.string().optional(),
  pathname: z.string().optional(),
  deviceType: DeviceTypeSchema.optional(),
  viewportWidth: z.number().optional(),
  viewportHeight: z.number().optional(),
});

export const FeedbackDtoSchema = z.object({
  id: z.string(),
  submittedAt: z.string(),
  app: z.string().nullable(),
  surveyId: z.string(),
  surveyVersion: z.string().optional(),
  surveyType: SurveyTypeSchema.optional(),
  context: SubmissionContextSchema.optional(),
  metadata: z.record(z.string(), z.string()).optional(),
  answers: z.array(AnswerSchema),
  tags: z.array(z.string()).optional(),
  sensitiveDataRedacted: z.boolean(),
});

export const FeedbackPageSchema = z.object({
  content: z.array(FeedbackDtoSchema),
  totalPages: z.number(),
  totalElements: z.number(),
  size: z.number(),
  number: z.number(),
  hasNext: z.boolean(),
  hasPrevious: z.boolean(),
});

// Field stats schemas
const RatingStatsSchema = z.object({
  type: z.literal("rating"),
  average: z.number(),
  distribution: z.record(z.string(), z.number()),
});

const TextStatsSchema = z.object({
  type: z.literal("text"),
  responseCount: z.number(),
  responseRate: z.number(),
});

const ChoiceStatsSchema = z.object({
  type: z.literal("choice"),
  distribution: z.record(
    z.string(),
    z.object({
      label: z.string(),
      count: z.number(),
      percentage: z.number(),
    }),
  ),
});

const FieldStatsValueSchema = z.discriminatedUnion("type", [
  RatingStatsSchema,
  TextStatsSchema,
  ChoiceStatsSchema,
]);

const FieldStatSchema = z.object({
  fieldId: z.string(),
  fieldType: FieldTypeSchema,
  label: z.string(),
  stats: FieldStatsValueSchema,
});

export const FeedbackStatsSchema = z.object({
  totalCount: z.number(),
  countWithText: z.number(),
  countWithoutText: z.number(),
  byRating: z.record(z.string(), z.number()),
  byApp: z.record(z.string(), z.number()),
  byDate: z.record(z.string(), z.number()),
  byFeedbackId: z.record(z.string(), z.number()),
  averageRating: z.number().nullable(),
  ratingByDate: z.record(
    z.string(),
    z.object({ average: z.number(), count: z.number() }),
  ),
  byDevice: z.record(
    z.string(),
    z.object({ count: z.number(), averageRating: z.number() }),
  ),
  byPathname: z.record(
    z.string(),
    z.object({ count: z.number(), averageRating: z.number() }),
  ),
  lowestRatingPaths: z.record(
    z.string(),
    z.object({ count: z.number(), averageRating: z.number() }),
  ),
  fieldStats: z.array(FieldStatSchema),
  surveyType: SurveyTypeSchema.optional(),
  period: z.object({
    from: z.string().nullable(),
    to: z.string().nullable(),
    days: z.number(),
  }),
});

export const TeamsAndAppsSchema = z.object({
  teams: z.record(z.string(), z.array(z.string())),
});

// Top Tasks schemas
const TopTaskStatsSchema = z.object({
  task: z.string(),
  totalCount: z.number(),
  successCount: z.number(),
  partialCount: z.number(),
  failureCount: z.number(),
  successRate: z.number(),
  formattedSuccessRate: z.string(),
  blockerCounts: z.record(z.string(), z.number()),
});

export const TopTasksResponseSchema = z.object({
  totalSubmissions: z.number(),
  tasks: z.array(TopTaskStatsSchema),
  dailyStats: z.record(
    z.string(),
    z.object({ total: z.number(), success: z.number() }),
  ),
  questionText: z.string().optional(),
});

export const MetadataKeysResponseSchema = z.object({
  feedbackId: z.string(),
  metadataKeys: z.record(z.string(), z.array(z.string())),
});

export const DeleteSurveyResultSchema = z.object({
  deletedCount: z.number(),
  surveyId: z.string(),
});

export const SurveysByAppSchema = z.record(z.string(), z.array(z.string()));

export const TagsSchema = z.array(z.string());
