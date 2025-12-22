import { z } from "zod";

const serverSchema = z.object({
  FLEXJAR_BACKEND_URL: z.string().url(),
  FLEXJAR_BACKEND_AUDIENCE: z.string().min(1),
  NAIS_CLUSTER_NAME: z.string().optional(),
  USE_MOCK_DATA: z.string().optional(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

/**
 * Validated server-side environment variables.
 * accessinig this on the client will throw an error or return undefined depending on strictness.
 * Best practice: Only import this in server-only files (entry-server, app/server/*).
 */
export const serverEnv = (() => {
  if (typeof process === "undefined") {
    // We are on the client, or process is not polyfilled.
    // Return a proxy that throws to prevent accidental usage?
    // Or just undefined. Let's rely on strict usage in server files.
    return {} as z.infer<typeof serverSchema>;
  }

  // Validate process.env
  // Note: z.object.parse will strip unknown keys if using strict(), but by default it passes through.
  // We want to extract only the known keys usually? safeParse is better if we want graceful error context.
  const result = serverSchema.safeParse(process.env);

  if (!result.success) {
    console.error(
      "❌ Invalid server environment variables:",
      result.error.flatten(),
    );
    // In dev we might want to throw, in prod definitely throw.
    throw new Error("Invalid environment variables");
  }

  return result.data;
})();
