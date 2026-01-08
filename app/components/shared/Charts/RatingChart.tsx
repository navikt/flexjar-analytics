import { BodyShort, Skeleton } from "@navikt/ds-react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useBreakpoint } from "~/hooks/useBreakpoint";
import { useStats } from "~/hooks/useStats";
import type { RatingStats } from "~/types/api";

// ============================================
// Display Configurations for Different Scales
// ============================================

// Emoji (5-point): 😡 🙁 😐 😀 😍
const EMOJI_CONFIG = {
  labels: ["😡", "🙁", "😐", "😀", "😍"],
  colors: ["#EF4444", "#F97316", "#FBBF24", "#4ADE80", "#22C55E"],
  scale: [1, 2, 3, 4, 5],
};

// Thumbs (2-point): 👎 👍
const THUMBS_CONFIG = {
  labels: ["👎", "👍"],
  colors: ["#EF4444", "#22C55E"],
  scale: [1, 2],
};

// Star (dynamic scale): ⭐...
const STAR_CONFIG = {
  getLabels: (scale: number) => Array.from({ length: scale }, () => "⭐"),
  getColors: (scale: number) => {
    // Gradient from red to green
    const colors = [];
    for (let i = 0; i < scale; i++) {
      const ratio = i / (scale - 1);
      colors.push(`hsl(${ratio * 120}, 70%, 50%)`); // 0 = red, 120 = green
    }
    return colors;
  },
  getScale: (scale: number) => Array.from({ length: scale }, (_, i) => i + 1),
};

// NPS (0-10): Number labels with color zones
const NPS_CONFIG = {
  labels: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
  // Detractors (0-6): red, Passives (7-8): yellow, Promoters (9-10): green
  colors: [
    "#EF4444",
    "#EF4444",
    "#EF4444",
    "#EF4444",
    "#EF4444",
    "#EF4444",
    "#EF4444",
    "#FBBF24",
    "#FBBF24",
    "#22C55E",
    "#22C55E",
  ],
  scale: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
};

// Chart styling for dark mode
const CHART_STYLES = {
  text: "rgba(255, 255, 255, 0.7)",
  textMuted: "rgba(255, 255, 255, 0.5)",
  tooltip: {
    bg: "#1c1f24",
    border: "rgba(255, 255, 255, 0.15)",
  },
};

/**
 * Detects rating display type by analyzing the distribution data.
 * Returns: 'thumbs' (2), 'emoji' (5), 'star' (3/7/10), or 'nps' (0-10/11 values)
 */
function detectRatingType(distribution: Record<number | string, number>): {
  type: "emoji" | "thumbs" | "star" | "nps";
  scale: number;
} {
  const keys = Object.keys(distribution)
    .map(Number)
    .filter((k) => !Number.isNaN(k));
  if (keys.length === 0) return { type: "emoji", scale: 5 };

  const maxKey = Math.max(...keys);
  const minKey = Math.min(...keys);

  // NPS: has key 0 and max is 10
  if (minKey === 0 && maxKey === 10) {
    return { type: "nps", scale: 11 };
  }

  // Thumbs: max is 2
  if (maxKey === 2 && minKey >= 1) {
    return { type: "thumbs", scale: 2 };
  }

  // Emoji: exactly 5 (1-5)
  if (maxKey === 5 && minKey >= 1) {
    return { type: "emoji", scale: 5 };
  }

  // Star: 3, 7, or 10 point
  if ([3, 7, 10].includes(maxKey) && minKey >= 1) {
    return { type: "star", scale: maxKey };
  }

  // Default to emoji 5-point
  return { type: "emoji", scale: 5 };
}

export function RatingChart() {
  const { data: stats, isPending } = useStats();
  const { isMobile } = useBreakpoint();

  const chartMargin = isMobile
    ? { top: 10, right: 5, left: 5, bottom: 30 }
    : { top: 20, right: 30, left: 20, bottom: 40 };

  if (isPending) {
    return <Skeleton variant="rectangle" height={300} />;
  }

  // Get rating field info from fieldStats
  const ratingField = stats?.fieldStats?.find((f) => f.fieldType === "RATING");
  const ratingStats = ratingField?.stats as RatingStats | undefined;

  // Use fieldStats distribution if available, fallback to legacy byRating
  const distribution = ratingStats?.distribution || {};
  const byRating = stats?.byRating || {};
  const mergedDistribution: Record<string | number, number> = {
    ...byRating,
    ...distribution,
  };

  // Detect rating type from distribution data
  const { type: ratingType, scale } = detectRatingType(mergedDistribution);

  // Build data array based on detected type
  let data: { label: string; value: number; count: number; color: string }[];

  switch (ratingType) {
    case "thumbs":
      data = THUMBS_CONFIG.scale.map((rating, i) => ({
        label: THUMBS_CONFIG.labels[i],
        value: rating,
        count: mergedDistribution[rating] || 0,
        color: THUMBS_CONFIG.colors[i],
      }));
      break;
    case "nps":
      data = NPS_CONFIG.scale.map((rating, i) => ({
        label: NPS_CONFIG.labels[i],
        value: rating,
        count: mergedDistribution[rating] || 0,
        color: NPS_CONFIG.colors[i],
      }));
      break;
    case "star": {
      const starLabels = STAR_CONFIG.getLabels(scale);
      const starColors = STAR_CONFIG.getColors(scale);
      const starScale = STAR_CONFIG.getScale(scale);
      data = starScale.map((rating, i) => ({
        label: starLabels[i],
        value: rating,
        count: mergedDistribution[rating] || 0,
        color: starColors[i],
      }));
      break;
    }
    default:
      data = EMOJI_CONFIG.scale.map((rating, i) => ({
        label: EMOJI_CONFIG.labels[i],
        value: rating,
        count: mergedDistribution[rating] || 0,
        color: EMOJI_CONFIG.colors[i],
      }));
      break;
  }

  const total = data.reduce((sum, item) => sum + item.count, 0);

  if (total === 0) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          color: CHART_STYLES.textMuted,
        }}
      >
        <BodyShort>Ingen vurderinger i valgt periode</BodyShort>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={chartMargin}
        role="img"
        aria-label={`Søylediagram som viser fordeling av vurderinger: ${data.map((d) => `${d.label} ${d.count}`).join(", ")}`}
      >
        <XAxis
          dataKey="label"
          tick={{ fontSize: ratingType === "nps" ? 12 : isMobile ? 20 : 24 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: CHART_STYLES.text, fontSize: 12 }}
          hide={isMobile}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const item = payload[0].payload;
              const percentage =
                total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;
              return (
                <div
                  style={{
                    background: CHART_STYLES.tooltip.bg,
                    color: "#ffffff",
                    padding: "0.75rem",
                    borderRadius: "4px",
                    border: `1px solid ${CHART_STYLES.tooltip.border}`,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                  }}
                >
                  <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>
                    {item.label}
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    {item.count.toLocaleString("no-NO")} svar
                  </div>
                  <div
                    style={{
                      color: CHART_STYLES.textMuted,
                      fontSize: "0.875rem",
                    }}
                  >
                    {percentage}%
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((entry) => (
            <Cell key={`cell-${entry.value}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
