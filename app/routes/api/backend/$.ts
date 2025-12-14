import {
  getToken,
  requestAzureOboToken,
  validateAzureToken,
} from "@navikt/oasis";
import { createFileRoute } from "@tanstack/react-router";
import { handleMockRequest } from "./mock-handler";

const BACKEND_URL = process.env.FLEXJAR_BACKEND_URL || "http://localhost:8080";
const BACKEND_AUDIENCE =
  process.env.FLEXJAR_BACKEND_AUDIENCE ||
  "api://dev-gcp.flex.flexjar-analytics-api/.default";



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
