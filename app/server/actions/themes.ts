import { createServerFn } from "@tanstack/react-start";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { authMiddleware } from "~/server/middleware/auth";
import {
  type AuthContext,
  buildUrl,
  getHeaders,
  isMockMode,
  mockDelay,
} from "~/server/utils";
import type { TextTheme } from "~/types/api";
import { handleApiResponse } from "../fetchUtils";

// ============================================
// Schemas for theme operations
// ============================================

const ThemeIdSchema = z.object({
  themeId: z.string().uuid(),
});

const CreateThemeSchema = z.object({
  name: z.string().min(1),
  keywords: z.array(z.string()).min(1),
  color: z.string().optional(),
  priority: z.number().optional(),
});

const UpdateThemeSchema = z.object({
  themeId: z.string().uuid(),
  name: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  color: z.string().optional(),
  priority: z.number().optional(),
});

import { mockThemes } from "~/mock/themes";

// ============================================
// Server Functions
// ============================================

/**
 * Fetch all themes for the current team
 */
export const fetchThemesServerFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<TextTheme[]> => {
    const { backendUrl, oboToken } = context as AuthContext;

    if (isMockMode()) {
      await mockDelay();
      return [...mockThemes];
    }

    const url = buildUrl(backendUrl, "/api/v1/intern/themes", {});
    const response = await fetch(url, {
      headers: getHeaders(oboToken),
    });

    await handleApiResponse(response);
    return response.json() as Promise<TextTheme[]>;
  });

/**
 * Create a new theme
 */
export const createThemeServerFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(zodValidator(CreateThemeSchema))
  .handler(async ({ data, context }): Promise<TextTheme> => {
    const { backendUrl, oboToken } = context as AuthContext;

    if (isMockMode()) {
      await mockDelay();
      const newTheme: TextTheme = {
        id: crypto.randomUUID(),
        team: "flex",
        name: data.name,
        keywords: data.keywords,
        color: data.color,
        priority: data.priority ?? 0,
      };
      mockThemes.push(newTheme);
      return newTheme;
    }

    const url = buildUrl(backendUrl, "/api/v1/intern/themes", {});
    const response = await fetch(url, {
      method: "POST",
      headers: {
        ...getHeaders(oboToken),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    await handleApiResponse(response);
    return response.json() as Promise<TextTheme>;
  });

/**
 * Update an existing theme
 */
export const updateThemeServerFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(zodValidator(UpdateThemeSchema))
  .handler(async ({ data, context }): Promise<TextTheme> => {
    const { backendUrl, oboToken } = context as AuthContext;
    const { themeId, ...updateData } = data;

    if (isMockMode()) {
      await mockDelay();
      const theme = mockThemes.find((t) => t.id === themeId);
      if (!theme) throw new Error("Theme not found");
      Object.assign(theme, updateData);
      return theme;
    }

    const url = buildUrl(backendUrl, `/api/v1/intern/themes/${themeId}`, {});
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        ...getHeaders(oboToken),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    await handleApiResponse(response);
    return response.json() as Promise<TextTheme>;
  });

/**
 * Delete a theme
 */
export const deleteThemeServerFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(zodValidator(ThemeIdSchema))
  .handler(async ({ data, context }): Promise<void> => {
    const { backendUrl, oboToken } = context as AuthContext;

    if (isMockMode()) {
      await mockDelay();
      const index = mockThemes.findIndex((t) => t.id === data.themeId);
      if (index !== -1) mockThemes.splice(index, 1);
      return;
    }

    const url = buildUrl(
      backendUrl,
      `/api/v1/intern/themes/${data.themeId}`,
      {},
    );
    const response = await fetch(url, {
      method: "DELETE",
      headers: getHeaders(oboToken),
    });

    await handleApiResponse(response);
  });
