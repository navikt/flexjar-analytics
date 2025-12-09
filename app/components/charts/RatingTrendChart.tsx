import { Skeleton } from "@navikt/ds-react";
import dayjs from "dayjs";
import {
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useStats } from "~/lib/useStats";

// Chart colors for dark mode
const CHART_COLORS = {
  primary: "#FBBF24", // Gul/gull for rating
  primaryFaded: "rgba(251, 191, 36, 0.3)",
  reference: "rgba(255, 255, 255, 0.2)",
  text: "rgba(255, 255, 255, 0.7)",
  textMuted: "rgba(255, 255, 255, 0.5)",
  tooltip: {
    bg: "#1c1f24",
    border: "rgba(255, 255, 255, 0.15)",
  },
};

export function RatingTrendChart() {
  const { data: stats, isLoading } = useStats();

  if (isLoading) {
    return <Skeleton variant="rectangle" height={300} />;
  }

  const ratingByDate = stats?.ratingByDate || {};

  // Transform and sort by date
  const data = Object.entries(ratingByDate)
    .map(([date, { average, count }]) => ({
      date,
      average,
      count,
      displayDate: dayjs(date).format("DD.MM"),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (data.length === 0) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: CHART_COLORS.textMuted,
        }}
      >
        Ingen data for valgt periode
      </div>
    );
  }

  // Calculate overall average for reference line
  const overallAverage = stats?.averageRating || 0;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        role="img"
        aria-label={`Linjediagram som viser gjennomsnittlig vurdering over tid. Totalt snitt: ${overallAverage.toFixed(1)}`}
      >
        <XAxis
          dataKey="displayDate"
          axisLine={false}
          tickLine={false}
          tick={{ fill: CHART_COLORS.text, fontSize: 12 }}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[1, 5]}
          ticks={[1, 2, 3, 4, 5]}
          axisLine={false}
          tickLine={false}
          tick={{ fill: CHART_COLORS.text, fontSize: 12 }}
        />
        <ReferenceLine
          y={overallAverage}
          stroke={CHART_COLORS.reference}
          strokeDasharray="3 3"
          label={{
            value: `Snitt: ${overallAverage.toFixed(1)}`,
            fill: CHART_COLORS.textMuted,
            fontSize: 11,
            position: "right",
          }}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload;
              return (
                <div
                  style={{
                    background: CHART_COLORS.tooltip.bg,
                    color: "#ffffff",
                    padding: "0.75rem",
                    borderRadius: "4px",
                    border: `1px solid ${CHART_COLORS.tooltip.border}`,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                    {dayjs(data.date).format("DD. MMMM YYYY")}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <span style={{ fontSize: "1.5rem" }}>
                      {ratingToEmoji(Math.round(data.average))}
                    </span>
                    <span style={{ fontWeight: 600 }}>
                      {data.average.toFixed(1)}
                    </span>
                    <span style={{ color: CHART_COLORS.textMuted }}>
                      ({data.count} {data.count === 1 ? "svar" : "svar"})
                    </span>
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        <Line
          type="monotone"
          dataKey="average"
          stroke={CHART_COLORS.primary}
          strokeWidth={2}
          dot={{ fill: CHART_COLORS.primary, strokeWidth: 0, r: 4 }}
          activeDot={{
            fill: CHART_COLORS.primary,
            strokeWidth: 2,
            stroke: "#fff",
            r: 6,
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function ratingToEmoji(rating: number): string {
  switch (rating) {
    case 1:
      return "😡";
    case 2:
      return "🙁";
    case 3:
      return "😐";
    case 4:
      return "😀";
    case 5:
      return "😍";
    default:
      return "❓";
  }
}
