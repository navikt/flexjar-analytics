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
import type { MetadataKeysResponse } from "~/types/api";
import { MetadataKeysParamsSchema } from "~/types/schemas";

/**
 * Fetch available metadata keys and values for a specific survey.
 */
export const fetchMetadataKeysServerFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(zodValidator(MetadataKeysParamsSchema))
  .handler(async ({ data, context }): Promise<MetadataKeysResponse> => {
    const { backendUrl, oboToken } = context as AuthContext;

    if (isMockMode()) {
      await mockDelay(300);
      // Return mock metadata keys based on survey
      if (data.surveyId === "ny-oppfolgingsplan-sykmeldt") {
        return {
          feedbackId: data.surveyId,
          metadataKeys: {
            harDialogmote: ["true", "false"],
            sykmeldingstype: ["avventende", "standard", "gradert"],
          },
        };
      }
      return { feedbackId: data.surveyId, metadataKeys: {} };
    }

    const url = buildUrl(backendUrl, "/api/v1/intern/metadata/keys", {
      surveyId: data.surveyId,
    });
    const response = await fetch(url, {
      headers: getHeaders(oboToken),
    });

    if (!response.ok) {
      throw new Error(`Backend request failed: ${response.status}`);
    }

    return response.json() as Promise<MetadataKeysResponse>;
  });
