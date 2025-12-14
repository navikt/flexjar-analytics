import {
  getToken,
  requestAzureOboToken,
  validateAzureToken,
} from "@navikt/oasis";
import { createFileRoute } from "@tanstack/react-router";
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

const BACKEND_URL = process.env.FLEXJAR_BACKEND_URL || "http://localhost:8080";
const BACKEND_AUDIENCE =
  process.env.FLEXJAR_BACKEND_AUDIENCE ||
  "api://dev-gcp.flex.flexjar-analytics-api/.default";

// Enable mock data when not in NAIS (local development)
const USE_MOCK_DATA = !process.env.NAIS_CLUSTER_NAME;

function handleMockRequest(
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
    const items = feedbackData.content;
    if (items.length === 0) {
      return new Response("id,app,surveyId,submittedAt\n", {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="flexjar-export.csv"`,
        },
      });
    }

    // Collect all unique fields with their metadata (label, type)
    const fieldMap = new Map<string, { label: string; type: string }>();
    items.forEach((item) => {
      item.answers.forEach((answer) => {
        if (!fieldMap.has(answer.fieldId)) {
          fieldMap.set(answer.fieldId, {
            label: answer.question?.label || answer.fieldId,
            type: answer.fieldType,
          });
        }
      });
    });

    // Helper to extract actual value from answer
    function getAnswerValue(answer: any): string {
      if (!answer || !answer.value) return "";
      const val = answer.value;
      if (val.type === "rating") return String(val.rating);
      if (val.type === "text") return val.text || "";
      if (val.type === "single_choice") return val.selected || "";
      if (val.type === "multi_choice") return (val.selected || []).join(", ");
      return "";
    }

    // Helper to escape CSV values
    function escapeCSV(value: string): string {
      if (!value) return "";
      const escaped = value
        .replace(/"/g, '""')
        .replace(/\n/g, " ")
        .replace(/\r/g, "");
      return `"${escaped}"`;
    }

    // Build CSV with readable headers
    const csvRows: string[] = [];
    const fieldIds = Array.from(fieldMap.keys());

    // Header row with readable names
    const headers = [
      "ID",
      "App",
      "Survey",
      "Tidspunkt",
      ...fieldIds.map((id) => {
        const field = fieldMap.get(id)!;
        // Include field type as suffix for clarity
        const typeLabel =
          field.type === "RATING"
            ? " (vurdering)"
            : field.type === "TEXT"
              ? " (tekst)"
              : "";
        return field.label + typeLabel;
      }),
    ];
    csvRows.push(headers.map((h) => escapeCSV(h)).join(","));

    // Data rows
    items.forEach((item) => {
      const row: string[] = [
        item.id,
        item.app || "",
        item.surveyId || "",
        item.submittedAt
          ? new Date(item.submittedAt).toLocaleString("no-NO")
          : "",
      ];

      // Add answer values for each field
      fieldIds.forEach((fieldId) => {
        const answer = item.answers.find((a) => a.fieldId === fieldId);
        row.push(getAnswerValue(answer));
      });

      csvRows.push(row.map((v) => escapeCSV(v)).join(","));
    });

    // Add BOM for Excel UTF-8 support
    const bom = "\uFEFF";
    return new Response(bom + csvRows.join("\n"), {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="flexjar-export.csv"`,
      },
    });
  }

  console.log("[Mock] No match, falling through to real backend");
  return null;
}

async function proxyToBackend(
  request: Request,
  path: string,
): Promise<Response> {
  const url = new URL(request.url);

  // Try mock data first (for local development)
  const mockResponse = handleMockRequest(
    path,
    url.searchParams,
    request.method,
  );
  if (mockResponse) {
    return mockResponse;
  }

  const backendUrl = new URL(`/${path}`, BACKEND_URL);

  // Copy query params
  url.searchParams.forEach((value, key) => {
    backendUrl.searchParams.set(key, value);
  });

  const headers = new Headers();
  headers.set("Content-Type", "application/json");

  // Handle authentication
  const isNais = !!process.env.NAIS_CLUSTER_NAME;

  if (isNais) {
    const token = getToken(request);

    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const validation = await validateAzureToken(token);
    if (!validation.ok) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const oboResult = await requestAzureOboToken(token, BACKEND_AUDIENCE);
    if (!oboResult.ok) {
      console.error("OBO token exchange failed");
      return new Response(JSON.stringify({ error: "Token exchange failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    headers.set("Authorization", `Bearer ${oboResult.token}`);
  }

  // Forward the request
  const response = await fetch(backendUrl.toString(), {
    method: request.method,
    headers,
    body:
      request.method !== "GET" && request.method !== "HEAD"
        ? await request.text()
        : undefined,
  });

  // Return the response with proper headers for downloads
  const contentType =
    response.headers.get("Content-Type") || "application/json";
  const contentDisposition = response.headers.get("Content-Disposition");

  const responseHeaders = new Headers();
  responseHeaders.set("Content-Type", contentType);
  if (contentDisposition) {
    responseHeaders.set("Content-Disposition", contentDisposition);
  }

  return new Response(await response.arrayBuffer(), {
    status: response.status,
    headers: responseHeaders,
  });
}

export const Route = createFileRoute("/api/backend/$")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        return proxyToBackend(request, params._splat || "");
      },
      POST: async ({ request, params }) => {
        return proxyToBackend(request, params._splat || "");
      },
      PUT: async ({ request, params }) => {
        return proxyToBackend(request, params._splat || "");
      },
      DELETE: async ({ request, params }) => {
        return proxyToBackend(request, params._splat || "");
      },
    },
  },
});
