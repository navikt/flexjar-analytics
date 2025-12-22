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

    const url = buildUrl(backendUrl, "/api/v1/intern/export", data);
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
