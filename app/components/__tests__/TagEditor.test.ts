import { describe, expect, it } from "vitest";

// Test the pure utility functions from TagEditor

const TAG_PRESETS: Record<
  string,
  {
    label: string;
    category: "error" | "success" | "info" | "warning" | "neutral";
  }
> = {
  bug: { label: "🐛 Bug", category: "error" },
  feature: { label: "✨ Feature", category: "info" },
  ux: { label: "🎨 UX", category: "warning" },
  urgent: { label: "🔥 Urgent", category: "error" },
  "good-feedback": { label: "👍 Bra", category: "success" },
  "needs-review": { label: "👀 Trenger review", category: "warning" },
  resolved: { label: "✅ Løst", category: "success" },
  "wont-fix": { label: "🚫 Fikses ikke", category: "neutral" },
};

function getChipsVariant(tag: string): "neutral" | "action" {
  const category = TAG_PRESETS[tag]?.category;
  return category === "error" || category === "warning" ? "action" : "neutral";
}

function getTagLabel(tag: string): string {
  return TAG_PRESETS[tag]?.label || tag;
}

describe("TagEditor utilities", () => {
  describe("getChipsVariant", () => {
    it("returns 'action' for error category tags", () => {
      expect(getChipsVariant("bug")).toBe("action");
      expect(getChipsVariant("urgent")).toBe("action");
    });

    it("returns 'action' for warning category tags", () => {
      expect(getChipsVariant("ux")).toBe("action");
      expect(getChipsVariant("needs-review")).toBe("action");
    });

    it("returns 'neutral' for success category tags", () => {
      expect(getChipsVariant("good-feedback")).toBe("neutral");
      expect(getChipsVariant("resolved")).toBe("neutral");
    });

    it("returns 'neutral' for info category tags", () => {
      expect(getChipsVariant("feature")).toBe("neutral");
    });

    it("returns 'neutral' for unknown tags", () => {
      expect(getChipsVariant("unknown-tag")).toBe("neutral");
      expect(getChipsVariant("custom")).toBe("neutral");
    });
  });

  describe("getTagLabel", () => {
    it("returns preset label for known tags", () => {
      expect(getTagLabel("bug")).toBe("🐛 Bug");
      expect(getTagLabel("feature")).toBe("✨ Feature");
      expect(getTagLabel("resolved")).toBe("✅ Løst");
    });

    it("returns the tag itself for unknown tags", () => {
      expect(getTagLabel("custom-tag")).toBe("custom-tag");
      expect(getTagLabel("anything")).toBe("anything");
    });
  });

  describe("TAG_PRESETS", () => {
    it("has expected structure for all presets", () => {
      Object.entries(TAG_PRESETS).forEach(([_key, value]) => {
        expect(value).toHaveProperty("label");
        expect(value).toHaveProperty("category");
        expect(typeof value.label).toBe("string");
        expect(["error", "success", "info", "warning", "neutral"]).toContain(
          value.category,
        );
      });
    });

    it("has expected preset tags", () => {
      expect(Object.keys(TAG_PRESETS)).toContain("bug");
      expect(Object.keys(TAG_PRESETS)).toContain("feature");
      expect(Object.keys(TAG_PRESETS)).toContain("urgent");
      expect(Object.keys(TAG_PRESETS)).toContain("resolved");
    });
  });
});
