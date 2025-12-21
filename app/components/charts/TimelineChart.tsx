import { Skeleton } from "@navikt/ds-react";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTheme } from "~/context/ThemeContext";
import { useSearchParams } from "~/hooks/useSearchParams";
import { useStats } from "~/hooks/useStats";

// Chart colors for dark mode
const CHART_COLORS = {
  primary: "#5EEAD4", // Teal for good visibility in dark mode
  primaryFaded: "rgba(94, 234, 212, 0.2)",
  text: "rgba(255, 255, 255, 0.7)",
  textMuted: "rgba(255, 255, 255, 0.5)",
  tooltip: {
    bg: "#1c1f24",
    border: "rgba(255, 255, 255, 0.15)",
    text: "#ffffff",
  },
};

const CHART_COLORS_LIGHT = {
  primary: "#0067c5", // Nav Blue for light mode
  primaryFaded: "rgba(0, 103, 197, 0.1)",
  text: "#262626", // Nav Gray 90
  textMuted: "#545454", // Nav Gray 60
  tooltip: {
    bg: "#ffffff",
    border: "#a0a0a0", // Nav Gray 40
    text: "#262626",
  },
};

export function TimelineChart() {
  const { data: stats, isLoading } = useStats();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { params } = useSearchParams();

  const colors = theme === "light" ? CHART_COLORS_LIGHT : CHART_COLORS;

  if (isLoading) {
    return <Skeleton variant="rectangle" height={300} />;
  }

  const byDate = stats?.byDate || {};

  // Transform and sort by date
  const data = Object.entries(byDate)
    .map(([date, count]) => ({
      date,
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
          color: colors.textMuted,
        }}
      >
        Ingen data for valgt periode
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        role="img"
        aria-label={`Tidslinjediagram som viser ${data.length} datapunkter med tilbakemeldinger over tid`}
        onClick={(e) => {
          if (e?.activePayload && e.activePayload.length > 0) {
            const clickData = e.activePayload[0].payload;
            const date = clickData.date;

            navigate({
              to: "/feedback",
              search: {
                ...params,
                from: date,
                to: date,
              },
            });
          }
        }}
        style={{ cursor: "pointer" }}
      >
        <defs>
          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={colors.primary} stopOpacity={0.4} />
            <stop offset="95%" stopColor={colors.primary} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="displayDate"
          axisLine={false}
          tickLine={false}
          tick={{ fill: colors.text, fontSize: 12 }}
          interval="preserveStartEnd"
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: colors.text, fontSize: 12 }}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload;
              return (
                <div
                  style={{
                    background: colors.tooltip.bg,
                    color: colors.tooltip.text,
                    padding: "0.75rem",
                    borderRadius: "4px",
                    border: `1px solid ${colors.tooltip.border}`,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                    {dayjs(data.date).format("DD. MMMM YYYY")}
                  </div>
                  <div>
                    {data.count.toLocaleString("no-NO")} tilbakemeldinger
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke={colors.primary}
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorCount)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
