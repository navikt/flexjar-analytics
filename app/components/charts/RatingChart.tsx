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
import { useStats } from "~/hooks/useStats";
import type { RatingStats } from "~/types/api";

const COLORS = {
  "1": "#EF4444", // Red - angry (brighter)
  "2": "#F97316", // Orange - sad (brighter)
  "3": "#FBBF24", // Yellow - neutral (brighter)
  "4": "#4ADE80", // Light green - happy (brighter)
  "5": "#22C55E", // Green - love (brighter)
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

const EMOJIS = {
  "1": "😡",
  "2": "🙁",
  "3": "😐",
  "4": "😀",
  "5": "😍",
};

export function RatingChart() {
  const { data: stats, isLoading } = useStats();

  if (isLoading) {
    return <Skeleton variant="rectangle" height={300} />;
  }

  // Get rating field info from fieldStats
  const ratingField = stats?.fieldStats?.find((f) => f.fieldType === "RATING");
  const ratingStats = ratingField?.stats as RatingStats | undefined;
  const questionLabel = ratingField?.label;

  // Use fieldStats distribution if available, fallback to legacy byRating
  const distribution = ratingStats?.distribution || {};
  const byRating = stats?.byRating || {};

  // Transform to array and ensure all ratings 1-5 exist
  const data = [1, 2, 3, 4, 5].map((rating) => ({
    rating: String(rating),
    count: distribution[rating] || byRating[String(rating)] || 0,
    emoji: EMOJIS[String(rating) as keyof typeof EMOJIS],
  }));

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
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {questionLabel && (
        <BodyShort
          size="small"
          style={{ color: CHART_STYLES.text, marginBottom: "0.5rem" }}
        >
          «{questionLabel}»
        </BodyShort>
      )}
      <div style={{ flex: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
            role="img"
            aria-label={`Søylediagram som viser fordeling av vurderinger: ${data.map((d) => `${d.emoji} ${d.count}`).join(", ")}`}
          >
            <XAxis
              dataKey="emoji"
              tick={{ fontSize: 24 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: CHART_STYLES.text, fontSize: 12 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  const percentage =
                    total > 0 ? ((data.count / total) * 100).toFixed(1) : 0;
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
                      <div
                        style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}
                      >
                        {data.emoji}
                      </div>
                      <div style={{ fontWeight: 600 }}>
                        {data.count.toLocaleString("no-NO")} svar
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
                <Cell
                  key={entry.rating}
                  fill={COLORS[entry.rating as keyof typeof COLORS]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
