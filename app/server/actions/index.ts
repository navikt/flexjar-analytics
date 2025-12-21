/**
 * Server Actions - Re-exports all server functions for convenient importing.
 *
 * @example
 * import { fetchStatsServerFn, fetchFeedbackServerFn } from "~/server/actions";
 */

// Stats
export { fetchStatsServerFn } from "./fetchStats";

// Feedback
export { fetchFeedbackServerFn } from "./fetchFeedback";

// Top Tasks
export { fetchTopTasksServerFn } from "./fetchTopTasks";

// Teams
export { fetchTeamsServerFn } from "./fetchTeams";

// Surveys
export { fetchSurveysByAppServerFn } from "./fetchSurveys";

// Tags
export { addTagServerFn, fetchTagsServerFn, removeTagServerFn } from "./tags";

// Metadata
export { fetchMetadataKeysServerFn } from "./fetchMetadata";

// Delete
export { deleteFeedbackServerFn, deleteSurveyServerFn } from "./delete";

// Export
export { exportServerFn } from "./export";
