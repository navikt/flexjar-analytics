import { type FeedbackItem, generateCsvExport } from "~/lib/csv-export";
import {
  deleteMockFeedback,
  deleteMockSurvey,
  getMockFeedback,
  getMockStats,
  getMockSurveysByApp,
  getMockTags,
  getMockTeams,
  getMockTopTasksStats,
} from "~/lib/mockData";

// Enable mock data when not in NAIS (local development)
const USE_MOCK_DATA = !process.env.NAIS_CLUSTER_NAME;

export function handleMockRequest(
  path: string,
  params: URLSearchParams,
  method = "GET",
): Response | null {
  if (!USE_MOCK_DATA) return null;

  console.log("[Mock] Checking path:", path, "method:", method);

  // Handle DELETE for survey
  if (method === "DELETE" && path.includes("api/v1/intern/feedback/survey/")) {
    const surveyId = path.split("/").pop();
    if (surveyId) {
      console.log("[Mock] Deleting survey:", surveyId);
      const result = deleteMockSurvey(decodeURIComponent(surveyId));
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // Handle DELETE for single feedback
  if (method === "DELETE" && path.match(/api\/v1\/intern\/feedback\/[^/]+$/)) {
    const feedbackId = path.split("/").pop();
    if (feedbackId && !feedbackId.includes("survey")) {
      console.log("[Mock] Deleting feedback:", feedbackId);
      const success = deleteMockFeedback(decodeURIComponent(feedbackId));
      if (success) {
        return new Response(null, { status: 204 });
      }
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // Match API paths and return mock data
  // Path comes as "api/v1/intern/stats" (without leading slash)

  if (path.includes("api/v1/intern/stats/top-tasks")) {
    console.log("[Mock] Returning top tasks stats");
    return new Response(JSON.stringify(getMockTopTasksStats(params)), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Match API paths and return mock data
  // Path comes as "api/v1/intern/stats" (without leading slash)
  if (path.includes("api/v1/intern/stats")) {
    console.log("[Mock] Returning stats");
    return new Response(JSON.stringify(getMockStats(params)), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (path.includes("api/v1/intern/feedback/teams")) {
    console.log("[Mock] Returning teams");
    return new Response(JSON.stringify(getMockTeams()), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (path.includes("api/v1/intern/feedback/tags")) {
    console.log("[Mock] Returning tags");
    return new Response(JSON.stringify(getMockTags()), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (path.includes("api/v1/intern/feedback/surveys")) {
    console.log("[Mock] Returning surveys by app");
    return new Response(JSON.stringify(getMockSurveysByApp()), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (path.includes("api/v1/intern/feedback")) {
    console.log("[Mock] Returning feedback");
    return new Response(JSON.stringify(getMockFeedback(params)), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Export endpoints - generate CSV/JSON from mock data
  if (path.includes("api/v1/intern/export")) {
    const format = params.get("format") || "csv";
    const feedbackData = getMockFeedback(params);

    console.log(
      "[Mock] Exporting",
      feedbackData.content.length,
      "items as",
      format,
    );

    if (format === "json") {
      return new Response(JSON.stringify(feedbackData.content, null, 2), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="flexjar-export.json"`,
        },
      });
    }

    // CSV format
    return generateCsvExport(feedbackData.content as FeedbackItem[]);
  }

  return null;
}
