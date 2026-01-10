import { createServerFn } from "@tanstack/react-start";
import { zodValidator } from "@tanstack/zod-adapter";
import { authMiddleware } from "~/server/middleware/auth";
import {
  type AuthContext,
  buildUrl,
  getHeaders,
  isMockMode,
  mockDelay,
} from "~/server/utils";
import { ExportParamsSchema } from "~/types/schemas";
import { handleApiResponse } from "../fetchUtils";

interface ExportResult {
  data: string;
  filename: string;
  contentType: string;
}

/**
 * Transform frontend URL params to backend API params.
 * Keeps ExportPanel and URL params stable while backend uses the new contract.
 */
function transformToBackendParams(data: Record<string, string | undefined>) {
  const tag = data.tags
    ?.split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return {
    format: data.format,
    app: data.app,
    surveyId: data.surveyId,
    fromDate: data.from, // from -> fromDate
    toDate: data.to, // to -> toDate
    hasText: data.medTekst === "true" ? "true" : undefined, // medTekst -> hasText
    lowRating: data.lavRating === "true" ? "true" : undefined, // lavRating -> lowRating
    query: data.fritekst, // fritekst -> query
    tag: tag && tag.length > 0 ? tag : undefined, // tags -> repeated tag params
    deviceType: data.deviceType,
    segment: data.segment?.split(",").filter(Boolean),
  };
}

/**
 * Export feedback data in various formats (CSV, JSON, Excel).
 * Returns base64-encoded blob data for client to download.
 */
export const exportServerFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(zodValidator(ExportParamsSchema))
  .handler(async ({ data, context }): Promise<ExportResult> => {
    const { backendUrl, oboToken } = context as AuthContext;

    if (isMockMode()) {
      await mockDelay();
      const extension = data.format === "excel" ? "xlsx" : data.format;
      return {
        data: "", // Empty mock data
        filename: `flexjar-export-mock.${extension}`,
        contentType:
          data.format === "excel"
            ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            : data.format === "json"
              ? "application/json"
              : "text/csv",
      };
    }

    const backendParams = transformToBackendParams(data);
    const url = buildUrl(backendUrl, "/api/v1/intern/export", backendParams);
    const response = await fetch(url, {
      headers: getHeaders(oboToken),
    });

    await handleApiResponse(response);

    // Get blob and convert to base64
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    const contentType =
      response.headers.get("Content-Type") || "application/octet-stream";
    const extension = data.format === "excel" ? "xlsx" : data.format;
    const filename = `flexjar-export-${new Date().toISOString().split("T")[0]}.${extension}`;

    return { data: base64, filename, contentType };
  });
