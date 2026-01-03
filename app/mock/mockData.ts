import type {
  BlockerResponse,
  DiscoveryResponse,
  FeedbackDto,
  FeedbackPage,
  FeedbackStats,
  TaskPriorityResponse,
  TeamsAndApps,
  TopTasksResponse,
} from "~/types/api";

import {
  generateComplexSurveyData,
  generateDiscoveryMockData,
  generateSurveyData,
  generateTaskPriorityMockData,
  generateTopTasksMockData,
} from "./generators";

export {
  generateSurveyData,
  generateTopTasksMockData,
  generateDiscoveryMockData,
  generateTaskPriorityMockData,
  generateComplexSurveyData,
};

import {
  getMockBlockerStats as calculateBlockerStats,
  getMockDiscoveryStats as calculateDiscoveryStats,
  calculateStats,
  getMockTaskPriorityStats as calculateTaskPriorityStats,
  getMockTopTasksStats as calculateTopTasksStats,
} from "./stats";

import { sykmeldtTopics } from "./topics";
export {
  sykmeldtTopics,
  PRIORITY_TASKS,
  DISCOVERY_RESPONSES,
} from "./topics";

// ============================================
// Mock feedback data - One survey per type for showcase
// ============================================

export const mockFeedbackItems: FeedbackDto[] = [
  // ===========================================
  // 1. RATING SURVEY (type: "rating")
  // Standard feedback with rating + optional text
  // ===========================================
  ...generateSurveyData(120, {
    app: "syfo-oppfolgingsplan-frontend",
    surveyId: "survey-vurdering",
    basePath: "/syk/oppfolgingsplaner",
    topics: sykmeldtTopics,
    questions: {
      ratingLabel: "Er oppfølgingsplanen til hjelp for deg?",
      textLabel: "Legg gjerne til en begrunnelse",
    },
    // Showcase custom metadata fields
    metadataGenerator: () => ({
      behandlingsstatus: ["ny", "pågående", "avsluttet"][
        Math.floor(Math.random() * 3)
      ],
      sykmeldingsuke: String(Math.floor(Math.random() * 16) + 1),
      harDialogmote: Math.random() > 0.6 ? "ja" : "nei",
    }),
  }),

  // ===========================================
  // 2. TOP TASKS SURVEY (type: "topTasks")
  // Measures task completion + blockers + time
  // ===========================================
  ...generateTopTasksMockData(),

  // ===========================================
  // 3. DISCOVERY SURVEY (type: "discovery")
  // Open-ended "what did you come to do" analysis
  // ===========================================
  ...generateDiscoveryMockData(),

  // ===========================================
  // 4. TASK PRIORITY SURVEY (type: "taskPriority")
  // Vote-based task prioritization
  // ===========================================
  ...generateTaskPriorityMockData(),

  // ===========================================
  // 5. CUSTOM SURVEY (type: "custom")
  // Multi-field complex survey
  // ===========================================
  ...generateComplexSurveyData(),
];

export * from "./helpers"; // export helpers if needed by tests

// ============================================
// Feedback filtering and pagination
// ============================================

import { mockThemes } from "~/mock/themes";
import { hasTextResponse } from "./helpers";

/**
 * Simple Norwegian stemmer for keyword matching.
 * Mirrors the backend implementation in DiscoveryService.kt
 */
function stemNorwegian(word: string): string {
  const stem = word.toLowerCase().trim();

  const suffixes = [
    "ene",
    "ane",
    "en",
    "et",
    "a",
    "er",
    "ar",
    "te",
    "de",
    "ere",
    "est",
  ];

  for (const suffix of suffixes) {
    if (stem.length > suffix.length + 2 && stem.endsWith(suffix)) {
      return stem.slice(0, -suffix.length);
    }
  }

  return stem;
}

/**
 * Check if feedback text matches any keyword from a theme.
 */
function matchesThemeKeywords(text: string, keywords: string[]): boolean {
  const textWords = text
    .toLowerCase()
    .replace(/[^\wæøå\s]/g, "")
    .split(/\s+/)
    .map(stemNorwegian);

  const keywordStems = keywords.map((k) => stemNorwegian(k.toLowerCase()));
  return keywordStems.some((kStem) => textWords.includes(kStem));
}

/**
 * Get text content from a feedback item for theme matching.
 */
function getFeedbackText(item: FeedbackDto): string {
  const textParts: string[] = [];
  for (const answer of item.answers) {
    if (answer.value.type === "text" && answer.value.text) {
      textParts.push(answer.value.text);
    }
  }
  return textParts.join(" ");
}

function applyFilters(
  items: FeedbackDto[],
  params: URLSearchParams,
): FeedbackDto[] {
  let filtered = [...items];

  const app = params.get("app");
  const from = params.get("from");
  const to = params.get("to");
  const medTekst = params.get("medTekst");
  const fritekst = params.get("fritekst");
  const surveyId = params.get("feedbackId");
  const lavRating = params.get("lavRating");
  const pathname = params.get("pathname");
  const deviceType = params.get("deviceType");
  const tags = params.get("tags");
  const theme = params.get("theme");

  if (app) {
    filtered = filtered.filter((item) => item.app === app);
  }
  if (from) {
    filtered = filtered.filter((item) => item.submittedAt >= from);
  }
  if (to) {
    filtered = filtered.filter((item) => item.submittedAt <= `${to}T23:59:59Z`);
  }
  if (medTekst === "true") {
    filtered = filtered.filter((item) => hasTextResponse(item));
  }
  // "Wall of Shame" - filter for low ratings (1-2)
  if (lavRating === "true") {
    filtered = filtered.filter((item) => {
      const ratingAnswer = item.answers.find((a) => a.fieldType === "RATING");
      if (ratingAnswer && ratingAnswer.value.type === "rating") {
        return ratingAnswer.value.rating <= 2;
      }
      return false;
    });
  }
  if (pathname) {
    filtered = filtered.filter((item) =>
      item.context?.pathname?.includes(pathname),
    );
  }
  if (deviceType) {
    filtered = filtered.filter(
      (item) => item.context?.deviceType === deviceType,
    );
  }
  if (fritekst) {
    const search = fritekst.toLowerCase();
    filtered = filtered.filter((item) =>
      item.answers.some((a) => {
        if (a.value.type === "text") {
          return a.value.text.toLowerCase().includes(search);
        }
        return false;
      }),
    );
  }
  if (surveyId) {
    filtered = filtered.filter((item) => item.surveyId === surveyId);
  }
  // Filter by tags (comma-separated, matches any)
  if (tags) {
    const tagList = tags.split(",").map((t) => t.trim());
    filtered = filtered.filter((item) =>
      item.tags?.some((tag) => tagList.includes(tag)),
    );
  }

  // Filter by theme
  if (theme) {
    if (theme === "uncategorized") {
      // Show feedback that doesn't match any theme's keywords
      filtered = filtered.filter((item) => {
        const text = getFeedbackText(item);
        if (!text) return true; // No text = uncategorized
        // Check if it matches any theme
        return !mockThemes.some((t) => matchesThemeKeywords(text, t.keywords));
      });
    } else {
      // Find the theme by ID
      const targetTheme = mockThemes.find((t) => t.id === theme);
      if (targetTheme && targetTheme.keywords.length > 0) {
        filtered = filtered.filter((item) => {
          const text = getFeedbackText(item);
          return matchesThemeKeywords(text, targetTheme.keywords);
        });
      }
    }
  }

  // Sort by date descending
  filtered.sort(
    (a, b) =>
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
  );

  return filtered;
}

export function filterFeedback(
  items: FeedbackDto[],
  params: URLSearchParams,
): FeedbackPage {
  const filtered = applyFilters(items, params);

  // Paginate
  const page = Number.parseInt(params.get("page") || "0");
  const size = Number.parseInt(params.get("size") || "20");
  const start = page * size;
  const content = filtered.slice(start, start + size);

  return {
    content,
    totalPages: Math.ceil(filtered.length / size),
    totalElements: filtered.length,
    size,
    number: page,
    hasNext: start + size < filtered.length,
    hasPrevious: page > 0,
  };
}

// ============================================
// Public API
// ============================================

export function getMockStats(params: URLSearchParams): FeedbackStats {
  return calculateStats(mockFeedbackItems, params);
}

export function getMockFeedback(params: URLSearchParams): FeedbackPage {
  return filterFeedback(mockFeedbackItems, params);
}

export function getMockTeams(): TeamsAndApps {
  return {
    teams: {
      "team-esyfo": [
        "syfo-oppfolgingsplan-frontend",
        "oppfolgingsplan-frontend",
      ],
    },
  };
}

export function getMockTags(): string[] {
  // Return actual tags used in the feedback, not surveyIds
  const allTags = new Set<string>();
  for (const item of mockFeedbackItems) {
    if (item.tags) {
      for (const tag of item.tags) {
        allTags.add(tag);
      }
    }
  }
  return Array.from(allTags).sort();
}

export function getMockTopTasksStats(
  params: URLSearchParams,
): TopTasksResponse {
  return calculateTopTasksStats(mockFeedbackItems, params);
}

export function getMockDiscoveryStats(
  params: URLSearchParams,
): DiscoveryResponse {
  return calculateDiscoveryStats(mockFeedbackItems, params);
}

export function getMockTaskPriorityStats(
  params: URLSearchParams,
): TaskPriorityResponse {
  return calculateTaskPriorityStats(mockFeedbackItems, params);
}

export function getMockBlockerStats(params: URLSearchParams): BlockerResponse {
  return calculateBlockerStats(mockFeedbackItems, params);
}

export function getMockSurveyTypeDistribution(): {
  totalSurveys: number;
  distribution: { type: string; count: number; percentage: number }[];
} {
  const typeCounts: Record<string, number> = {};
  const seenSurveys = new Set<string>();

  for (const item of mockFeedbackItems) {
    const surveyId = item.surveyId;
    if (seenSurveys.has(surveyId)) continue;
    seenSurveys.add(surveyId);

    const surveyType = item.surveyType || "custom";
    typeCounts[surveyType] = (typeCounts[surveyType] || 0) + 1;
  }

  const totalSurveys = seenSurveys.size;
  const distribution = Object.entries(typeCounts)
    .map(([type, count]) => ({
      type,
      count,
      percentage:
        totalSurveys > 0 ? Math.round((count / totalSurveys) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  return { totalSurveys, distribution };
}

export function getMockSurveysByApp(): Record<string, string[]> {
  const surveysByApp: Record<string, string[]> = {};

  for (const item of mockFeedbackItems) {
    const app = item.app || "unknown";
    const surveyId = item.surveyId;

    if (!surveysByApp[app]) {
      surveysByApp[app] = [];
    }
    if (surveyId && !surveysByApp[app].includes(surveyId)) {
      surveysByApp[app].push(surveyId);
    }
  }

  return surveysByApp;
}

// Delete all feedback for a survey (mock implementation)
export function deleteMockSurvey(surveyId: string): {
  deletedCount: number;
  surveyId: string;
} {
  const initialLength = mockFeedbackItems.length;

  // Filter out items with matching surveyId
  const itemsToKeep = mockFeedbackItems.filter(
    (item) => item.surveyId !== surveyId,
  );
  const deletedCount = initialLength - itemsToKeep.length;

  // Replace the array contents (mutate in place since it's a module-level variable)
  mockFeedbackItems.length = 0;
  mockFeedbackItems.push(...itemsToKeep);

  console.log(`[Mock] Deleted ${deletedCount} items for survey "${surveyId}"`);

  return { deletedCount, surveyId };
}

// Delete single feedback item (mock implementation)
export function deleteMockFeedback(feedbackId: string): boolean {
  const initialLength = mockFeedbackItems.length;

  // Filter out item with matching id
  const itemsToKeep = mockFeedbackItems.filter(
    (item) => item.id !== feedbackId,
  );
  const deleted = initialLength !== itemsToKeep.length;

  // Replace the array contents
  mockFeedbackItems.length = 0;
  mockFeedbackItems.push(...itemsToKeep);

  console.log(
    `[Mock] ${deleted ? "Deleted" : "Not found"} feedback "${feedbackId}"`,
  );

  return deleted;
}
