import dayjs from "dayjs";
import type {
  Answer,
  DiscoveryResponse,
  FeedbackDto,
  FeedbackStats,
  FieldStat,
  TaskPriorityResponse,
  TopTaskStats,
  TopTasksResponse,
} from "~/types/api";
import { IGNORED_WORDS, getTopKeywords } from "~/utils/wordAnalysis";
import { getRating, hasTextResponse } from "./helpers";

// Note: circular dependency if we import mockFeedbackItems here directly while mockData imports stats.
// To avoid this, we will accept items as arguments in the functions.

// ============================================
// Stats calculation
// ============================================

export function calculatePeriod(
  from: string | null,
  to: string | null,
): { from: string | null; to: string | null; days: number } {
  const today = dayjs();
  // Default to 30 days (start = today - 29 days)
  const defaultFrom = today.subtract(29, "day").format("YYYY-MM-DD");
  const defaultTo = today.format("YYYY-MM-DD");

  const actualFrom = from || defaultFrom;
  const actualTo = to || defaultTo;

  const fromDate = dayjs(actualFrom);
  const toDate = dayjs(actualTo);

  // Diff in days + 1 for inclusive range
  const diffDays = toDate.diff(fromDate, "day") + 1;

  return {
    from: actualFrom,
    to: actualTo,
    days: diffDays,
  };
}

interface TextResponseWithTimestamp {
  text: string;
  submittedAt: string;
}

export function calculateFieldStats(items: FeedbackDto[]): FieldStat[] {
  // Collect all unique fields across all items
  const fieldMap = new Map<
    string,
    {
      fieldId: string;
      fieldType: string;
      label: string;
      values: Answer["value"][];
      textResponses: TextResponseWithTimestamp[];
    }
  >();

  for (const item of items) {
    for (const answer of item.answers) {
      const key = answer.fieldId;
      if (!fieldMap.has(key)) {
        fieldMap.set(key, {
          fieldId: answer.fieldId,
          fieldType: answer.fieldType,
          label: answer.question.label,
          values: [],
          textResponses: [],
        });
      }
      const fieldData = fieldMap.get(key);
      fieldData?.values.push(answer.value);

      // Track text responses with timestamps for sorting
      if (answer.fieldType === "TEXT" && answer.value.type === "text") {
        fieldData?.textResponses.push({
          text: answer.value.text,
          submittedAt: item.submittedAt,
        });
      }
    }
  }

  // Calculate stats for each field
  const fieldStats: FieldStat[] = [];

  for (const [, field] of fieldMap) {
    if (field.fieldType === "RATING") {
      const ratings = field.values
        .filter((v) => v.type === "rating")
        .map((v) => (v as { type: "rating"; rating: number }).rating);

      const distribution: Record<number, number> = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      };
      let sum = 0;
      for (const r of ratings) {
        distribution[r] = (distribution[r] || 0) + 1;
        sum += r;
      }

      fieldStats.push({
        fieldId: field.fieldId,
        fieldType: "RATING",
        label: field.label,
        stats: {
          type: "rating",
          average: ratings.length > 0 ? sum / ratings.length : 0,
          distribution,
        },
      });
    } else if (field.fieldType === "TEXT") {
      const texts = field.values
        .filter((v) => v.type === "text")
        .map((v) => (v as { type: "text"; text: string }).text);

      const nonEmpty = texts.filter((t) => t && t.trim().length > 0);

      // Get top keywords from text responses
      const topKeywords = getTopKeywords(nonEmpty, 5);

      // Get 3 most recent non-empty responses, sorted by date descending
      const recentResponses = field.textResponses
        .filter((r) => r.text && r.text.trim().length > 0)
        .sort(
          (a, b) =>
            new Date(b.submittedAt).getTime() -
            new Date(a.submittedAt).getTime(),
        )
        .slice(0, 3);

      fieldStats.push({
        fieldId: field.fieldId,
        fieldType: "TEXT",
        label: field.label,
        stats: {
          type: "text",
          responseCount: nonEmpty.length,
          // responseRate is calculated in UI based on totalCount
          responseRate: 0,
          topKeywords,
          recentResponses,
        },
      });
    } else if (
      field.fieldType === "SINGLE_CHOICE" ||
      field.fieldType === "MULTI_CHOICE"
    ) {
      // Get options from first answer with options
      const firstAnswerWithOptions = items
        .flatMap((i) => i.answers)
        .find((a) => a.fieldId === field.fieldId && a.question.options?.length);
      const options = firstAnswerWithOptions?.question.options || [];

      // Count selections
      const selectionCounts: Record<string, number> = {};
      for (const opt of options) {
        selectionCounts[opt.id] = 0;
      }

      for (const value of field.values) {
        if (value.type === "singleChoice") {
          const id = value.selectedOptionId;
          selectionCounts[id] = (selectionCounts[id] || 0) + 1;
        } else if (value.type === "multiChoice") {
          for (const id of value.selectedOptionIds) {
            selectionCounts[id] = (selectionCounts[id] || 0) + 1;
          }
        }
      }

      const totalSelections = Object.values(selectionCounts).reduce(
        (sum, c) => sum + c,
        0,
      );

      const distribution: Record<
        string,
        { label: string; count: number; percentage: number }
      > = {};
      for (const opt of options) {
        const count = selectionCounts[opt.id] || 0;
        distribution[opt.id] = {
          label: opt.label,
          count,
          percentage:
            totalSelections > 0
              ? Math.round((count / totalSelections) * 100)
              : 0,
        };
      }

      fieldStats.push({
        fieldId: field.fieldId,
        fieldType: field.fieldType as "SINGLE_CHOICE" | "MULTI_CHOICE",
        label: field.label,
        stats: {
          type: "choice",
          distribution,
        },
      });
    }
  }

  return fieldStats;
}

export function calculateStats(
  items: FeedbackDto[],
  params: URLSearchParams,
): FeedbackStats {
  // Filter items based on params
  let filtered = [...items];

  const app = params.get("app");
  const from = params.get("from");
  const to = params.get("to");
  const surveyId = params.get("feedbackId"); // Keep old param name for backwards compat

  if (app) {
    filtered = filtered.filter((item) => item.app === app);
  }
  if (from) {
    filtered = filtered.filter((item) => item.submittedAt >= from);
  }
  if (to) {
    filtered = filtered.filter((item) => item.submittedAt <= `${to}T23:59:59Z`);
  }
  if (surveyId) {
    filtered = filtered.filter((item) => item.surveyId === surveyId);
  }

  // Legacy aggregations
  const byRating: Record<string, number> = {
    "1": 0,
    "2": 0,
    "3": 0,
    "4": 0,
    "5": 0,
  };
  const byApp: Record<string, number> = {};
  const byDate: Record<string, number> = {};
  const byFeedbackId: Record<string, number> = {};
  const ratingByDateAccum: Record<string, { total: number; count: number }> =
    {};
  const byDeviceAccum: Record<string, { total: number; count: number }> = {};
  const byPathnameAccum: Record<string, { total: number; count: number }> = {};

  let totalRating = 0;
  let ratingCount = 0;
  let countWithText = 0;

  for (const item of filtered) {
    // Device stats - always track regardless of rating
    const device = item.context?.deviceType || "unknown";
    if (!byDeviceAccum[device]) {
      byDeviceAccum[device] = { total: 0, count: 0 };
    }
    byDeviceAccum[device].count++;

    // Pathname stats - always track regardless of rating
    const pathname = item.context?.pathname || "unknown";
    if (!byPathnameAccum[pathname]) {
      byPathnameAccum[pathname] = { total: 0, count: 0 };
    }
    byPathnameAccum[pathname].count++;

    // Rating
    const rating = getRating(item);
    if (rating !== null) {
      byRating[String(rating)]++;
      totalRating += rating;
      ratingCount++;

      // Rating by date
      const date = item.submittedAt.split("T")[0];
      if (!ratingByDateAccum[date]) {
        ratingByDateAccum[date] = { total: 0, count: 0 };
      }
      ratingByDateAccum[date].total += rating;
      ratingByDateAccum[date].count++;

      // Add rating to device stats
      byDeviceAccum[device].total += rating;

      // Add rating to pathname stats
      byPathnameAccum[pathname].total += rating;
    }

    // App
    const appName = item.app || "unknown";
    byApp[appName] = (byApp[appName] || 0) + 1;

    // Date
    const date = item.submittedAt.split("T")[0];
    byDate[date] = (byDate[date] || 0) + 1;

    // Survey (feedbackId for backwards compat)
    const fbId = item.surveyId || "unknown";
    byFeedbackId[fbId] = (byFeedbackId[fbId] || 0) + 1;

    // Text
    if (hasTextResponse(item)) {
      countWithText++;
    }
  }

  // Convert ratingByDateAccum to ratingByDate with averages
  const ratingByDate: Record<string, { average: number; count: number }> = {};
  for (const [date, data] of Object.entries(ratingByDateAccum)) {
    ratingByDate[date] = {
      average: Math.round((data.total / data.count) * 10) / 10,
      count: data.count,
    };
  }

  // Convert device accum to byDevice
  const byDevice: Record<string, { count: number; averageRating: number }> = {};
  for (const [device, data] of Object.entries(byDeviceAccum)) {
    byDevice[device] = {
      count: data.count,
      averageRating: Math.round((data.total / data.count) * 10) / 10,
    };
  }

  // Convert pathname accum to byPathname (top 10)
  const byPathname: Record<string, { count: number; averageRating: number }> =
    {};
  const sortedPathnames = Object.entries(byPathnameAccum)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10);
  for (const [pathname, data] of sortedPathnames) {
    byPathname[pathname] = {
      count: data.count,
      averageRating: Math.round((data.total / data.count) * 10) / 10,
    };
  }

  // Calculate lowestRatingPaths - paths with low average rating (< 3.0) and at least 3 submissions
  const lowestRatingPaths: Record<
    string,
    { count: number; averageRating: number }
  > = {};
  const lowRatingPathEntries = Object.entries(byPathnameAccum)
    .filter(([pathname, data]) => {
      // Exclude unknown paths and require at least 3 submissions
      if (pathname === "unknown" || data.count < 3) return false;
      const avg = data.total / data.count;
      return avg < 3.0 && avg > 0; // Low rating but not zero (which means no ratings)
    })
    .map(([pathname, data]) => ({
      pathname,
      count: data.count,
      averageRating: Math.round((data.total / data.count) * 10) / 10,
    }))
    .sort((a, b) => a.averageRating - b.averageRating) // Lowest first
    .slice(0, 5); // Top 5 worst

  for (const entry of lowRatingPathEntries) {
    lowestRatingPaths[entry.pathname] = {
      count: entry.count,
      averageRating: entry.averageRating,
    };
  }

  // Calculate new field stats
  const fieldStats = calculateFieldStats(filtered);

  // Privacy threshold check
  const MIN_AGGREGATION_THRESHOLD = 5;
  const totalCount = filtered.length;
  const shouldMask = totalCount > 0 && totalCount < MIN_AGGREGATION_THRESHOLD;

  const privacy = shouldMask
    ? {
        masked: true,
        reason: `Antall svar (${totalCount}) er under ${MIN_AGGREGATION_THRESHOLD}. Statistikk vises ikke av hensyn til personvern.`,
        threshold: MIN_AGGREGATION_THRESHOLD,
      }
    : undefined;

  return {
    totalCount,
    countWithText,
    countWithoutText: totalCount - countWithText,
    byRating: shouldMask ? {} : byRating,
    byApp: shouldMask ? {} : byApp,
    byDate: shouldMask ? {} : byDate,
    byFeedbackId: shouldMask ? {} : byFeedbackId,
    averageRating: shouldMask
      ? null
      : ratingCount > 0
        ? totalRating / ratingCount
        : null,
    ratingByDate: shouldMask ? {} : ratingByDate,
    byDevice: shouldMask ? {} : byDevice,
    byPathname: shouldMask ? {} : byPathname,
    lowestRatingPaths: shouldMask ? {} : lowestRatingPaths,
    fieldStats: shouldMask ? [] : fieldStats,
    period: calculatePeriod(from, to),
    surveyType: totalCount > 0 ? filtered[0].surveyType || "rating" : undefined,
    privacy,
  };
}

function applyFiltersToItems(
  items: FeedbackDto[],
  params: URLSearchParams,
): FeedbackDto[] {
  let filtered = [...items];
  const app = params.get("app");
  const from = params.get("from");
  const to = params.get("to");
  const surveyId = params.get("feedbackId");

  if (app) filtered = filtered.filter((item) => item.app === app);
  if (from) filtered = filtered.filter((item) => item.submittedAt >= from);
  if (to)
    filtered = filtered.filter((item) => item.submittedAt <= `${to}T23:59:59Z`);
  if (surveyId)
    filtered = filtered.filter((item) => item.surveyId === surveyId);

  return filtered;
}

export function getMockDiscoveryStats(
  items: FeedbackDto[],
  params: URLSearchParams,
): DiscoveryResponse {
  const filtered = applyFiltersToItems(items, params).filter(
    (item) => item.surveyType === "discovery",
  );

  const responses = filtered.map((item) => {
    const taskAnswer = item.answers.find((a) => a.fieldId === "task");
    const successAnswer = item.answers.find((a) => a.fieldId === "success");

    let task = "Ukjent oppgave";
    if (taskAnswer) {
      if (taskAnswer.fieldType === "TEXT") {
        // TEXT type - get the text value directly
        task = taskAnswer.value.text || "Ukjent oppgave";
      } else if (taskAnswer.fieldType === "SINGLE_CHOICE") {
        const option = taskAnswer.question.options?.find(
          (o) => o.id === taskAnswer.value.selectedOptionId,
        );
        task = option ? option.label : taskAnswer.value.selectedOptionId;
      }
    }

    let success: "yes" | "partial" | "no" = "no";
    if (successAnswer && successAnswer.fieldType === "SINGLE_CHOICE") {
      const val = successAnswer.value.selectedOptionId;
      if (val === "yes" || val === "partial" || val === "no") {
        success = val;
      }
    }

    return {
      task,
      success,
      submittedAt: item.submittedAt,
    };
  });

  // Calculate word frequency using shared IGNORED_WORDS list
  const wordCounts = new Map<string, number>();

  for (const response of responses) {
    const words = response.task
      .toLowerCase()
      .replace(/[^\wæøå\s]/g, "")
      .split(/\s+/);
    for (const word of words) {
      if (word.length > 2 && !IGNORED_WORDS.has(word)) {
        wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
      }
    }
  }

  const wordFrequency = Array.from(wordCounts.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 30);

  // Simple theme clustering based on keywords
  const themes = [
    {
      theme: "Søknadsstatus",
      keywords: ["status", "søknad", "søknaden"],
      examples: [] as string[],
      successCount: 0,
      totalCount: 0,
    },
    {
      theme: "Sykemelding",
      keywords: ["sykmeldt", "sykemelding", "sykefravær", "sykepenger"],
      examples: [] as string[],
      successCount: 0,
      totalCount: 0,
    },
    {
      theme: "Kontakt NAV",
      keywords: ["kontakte", "telefon", "saksbehandler"],
      examples: [] as string[],
      successCount: 0,
      totalCount: 0,
    },
    {
      theme: "Finne informasjon",
      keywords: ["finne", "lese", "informasjon", "skjema"],
      examples: [] as string[],
      successCount: 0,
      totalCount: 0,
    },
  ];

  // Track unique examples to avoid duplicates
  const usedExamples = new Set<string>();

  for (const response of responses) {
    const taskLower = response.task.toLowerCase();
    for (const theme of themes) {
      if (theme.keywords.some((k) => taskLower.includes(k))) {
        theme.totalCount++;
        if (response.success === "yes") theme.successCount++;
        // Only add unique examples
        if (theme.examples.length < 3 && !usedExamples.has(response.task)) {
          theme.examples.push(response.task);
          usedExamples.add(response.task);
        }
        break;
      }
    }
  }

  return {
    totalSubmissions: responses.length,
    wordFrequency,
    themes: themes
      .filter((t) => t.totalCount > 0)
      .map((t) => ({
        theme: t.theme,
        count: t.totalCount,
        successRate: t.totalCount > 0 ? t.successCount / t.totalCount : 0,
        examples: t.examples,
      })),
    recentResponses: responses
      .sort(
        (a, b) =>
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
      )
      .slice(0, 10),
  };
}

export function getMockTaskPriorityStats(
  items: FeedbackDto[],
  params: URLSearchParams,
): TaskPriorityResponse {
  const filtered = applyFiltersToItems(items, params).filter(
    (item) => item.surveyType === "taskPriority",
  );

  const voteCounts = new Map<string, number>();
  const taskLabels = new Map<string, string>();

  for (const item of filtered) {
    const priorityAnswer = item.answers.find(
      (a) => a.fieldId === "priority" && a.fieldType === "MULTI_CHOICE",
    );

    if (priorityAnswer && priorityAnswer.fieldType === "MULTI_CHOICE") {
      // Cache labels
      if (priorityAnswer.question.options) {
        for (const opt of priorityAnswer.question.options) {
          if (!taskLabels.has(opt.id)) {
            taskLabels.set(opt.id, opt.label);
          }
        }
      }

      for (const taskId of priorityAnswer.value.selectedOptionIds) {
        voteCounts.set(taskId, (voteCounts.get(taskId) || 0) + 1);
      }
    }
  }

  const tasks = Array.from(voteCounts.entries())
    .map(([taskId, count]) => {
      return {
        task: taskLabels.get(taskId) || taskId,
        votes: count,
        percentage: 0,
      };
    })
    .sort((a, b) => b.votes - a.votes);

  const totalSubmissions = filtered.length;

  // Calculate percentages
  const totalVotes = tasks.reduce((acc, t) => acc + t.votes, 0);
  for (const task of tasks) {
    task.percentage = Math.round((task.votes / totalVotes) * 100);
  }

  // Find long neck cutoff (where cumulative percentage hits 80%)
  let cumulative = 0;
  let longNeckCutoff = 0;
  for (let i = 0; i < tasks.length; i++) {
    cumulative += tasks[i].percentage;
    if (cumulative >= 80) {
      longNeckCutoff = i + 1;
      break;
    }
  }

  // Calculate top 5 cumulative percentage
  const cumulativePercentageAt5 = tasks
    .slice(0, 5)
    .reduce((acc, t) => acc + t.percentage, 0);

  return {
    totalSubmissions,
    tasks,
    longNeckCutoff,
    cumulativePercentageAt5,
  };
}

// Internal type for aggregation with additional fields
interface InternalTaskStats
  extends Omit<TopTaskStats, "avgTimeMs" | "targetTimeMs" | "tpiScore"> {
  totalDurationMs: number;
  durationCount: number;
}

export function getMockTopTasksStats(
  items: FeedbackDto[],
  params: URLSearchParams,
): TopTasksResponse {
  const filtered = applyFiltersToItems(items, params);
  const taskMap = new Map<string, InternalTaskStats>();
  const dailyStats: Record<string, { total: number; success: number }> = {};

  for (const item of filtered) {
    if (item.surveyType !== "topTasks") continue;

    const taskAnswer = item.answers.find(
      (a) => a.fieldId === "task" || a.fieldId === "category",
    );
    if (!taskAnswer || taskAnswer.fieldType !== "SINGLE_CHOICE") continue;

    const taskOption = taskAnswer.question.options?.find(
      (o) => o.id === taskAnswer.value.selectedOptionId,
    );
    const task = taskOption
      ? taskOption.label
      : taskAnswer.value.selectedOptionId;

    const successAnswer = item.answers.find(
      (a) => a.fieldId === "taskSuccess" || a.fieldId === "success",
    );
    const successValue =
      successAnswer?.fieldType === "SINGLE_CHOICE"
        ? successAnswer.value.selectedOptionId
        : "unknown";

    const blockerAnswer = item.answers.find(
      (a) => a.fieldId === "blocker" || a.fieldId === "hindring",
    );
    const blocker =
      blockerAnswer?.fieldType === "TEXT" && blockerAnswer.value.text
        ? blockerAnswer.value.text
        : null;

    if (!taskMap.has(task)) {
      taskMap.set(task, {
        task,
        totalCount: 0,
        successCount: 0,
        partialCount: 0,
        failureCount: 0,
        successRate: 0,
        formattedSuccessRate: "0%",
        blockerCounts: {},
        totalDurationMs: 0,
        durationCount: 0,
      });
    }

    const stats = taskMap.get(task);
    if (stats) {
      stats.totalCount++;

      if (successValue === "Ja") stats.successCount++;
      else if (successValue === "Delvis") stats.partialCount++;
      else if (successValue === "Nei") stats.failureCount++;

      if (blocker) {
        stats.blockerCounts[blocker] = (stats.blockerCounts[blocker] || 0) + 1;
      }

      // Aggregate duration
      if (item.durationMs) {
        stats.totalDurationMs = stats.totalDurationMs + item.durationMs;
        stats.durationCount = stats.durationCount + 1;
      }
    }

    // Daily stats
    const date = item.submittedAt.split("T")[0];
    if (!dailyStats[date]) {
      dailyStats[date] = { total: 0, success: 0 };
    }
    dailyStats[date].total++;
    if (successValue === "Ja") {
      dailyStats[date].success++;
    }
  }

  const tasks: TopTaskStats[] = Array.from(taskMap.values()).map((stats) => {
    const rate =
      stats.totalCount > 0 ? stats.successCount / stats.totalCount : 0;

    // Use aggregated duration if available, otherwise fallback
    // @ts-ignore
    const totalDuration = stats.totalDurationMs || 0;
    // @ts-ignore
    const durationCount = stats.durationCount || 0;

    let avgTimeMs = 0;
    if (durationCount > 0) {
      avgTimeMs = Math.round(totalDuration / durationCount);
    } else {
      // Fallback if no duration data (shouldn't happen with new generator)
      avgTimeMs = 60000;
    }

    // Target time is arbitrary for now, but in real app would be configured per task
    const targetTimeMs = 45000;

    // TPI Formula: Success Rate * Efficiency
    // Efficiency = Target / Actual (capped at 1) or similar.
    // McGovern TPI is often just a weighted score, but let's stick to the current logic:
    const timeEfficiency = Math.min(1, targetTimeMs / (avgTimeMs || 1));
    const tpiScore = Math.round(rate * timeEfficiency * 100);

    // Remove internal aggregation fields before returning
    const { totalDurationMs, durationCount: dc, ...rest } = stats;

    return {
      ...rest,
      successRate: rate,
      formattedSuccessRate: `${Math.round(rate * 100)}%`,
      avgTimeMs,
      targetTimeMs,
      tpiScore,
    };
  });

  tasks.sort((a, b) => b.totalCount - a.totalCount);

  const tasksWithTpi = tasks.filter((t) => t.tpiScore !== undefined);
  const overallTpi =
    tasksWithTpi.length > 0
      ? Math.round(
          tasksWithTpi.reduce((acc, t) => acc + (t.tpiScore ?? 0), 0) /
            tasksWithTpi.length,
        )
      : undefined;

  const avgCompletionTimeMs =
    tasksWithTpi.length > 0
      ? Math.round(
          tasksWithTpi.reduce((acc, t) => acc + (t.avgTimeMs ?? 0), 0) /
            tasksWithTpi.length,
        )
      : undefined;

  // Calculate "Other" percentage
  const totalCount = filtered.filter((i) => i.surveyType === "topTasks").length;
  const otherTask = tasks.find(
    (t) =>
      t.task.toLowerCase().includes("annet") ||
      t.task.toLowerCase().includes("other"),
  );
  const otherCount = otherTask ? otherTask.totalCount : 0;
  const otherTasksPercentage =
    totalCount > 0 ? Math.round((otherCount / totalCount) * 100) : 0;

  return {
    totalSubmissions: totalCount,
    tasks,
    dailyStats,
    questionText: filtered
      .find((i) => i.surveyType === "topTasks")
      ?.answers.find((a) => a.fieldId === "task")?.question.label,
    overallTpi,
    avgCompletionTimeMs,
    otherTasksPercentage,
  };
}
