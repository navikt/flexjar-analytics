import { Skeleton } from "@navikt/ds-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTheme } from "~/context/ThemeContext";
import { useSurveysByApp } from "~/hooks/useSurveysByApp";
import type { SurveyType } from "~/types/api";

/**
 * Survey type configuration with Norwegian labels and colors
 */
const SURVEY_TYPE_CONFIG: Record<SurveyType, { label: string; color: string }> =
  {
    rating: { label: "Vurdering", color: "#22c55e" },
    topTasks: { label: "Top Tasks", color: "#3b82f6" },
    discovery: { label: "Discovery", color: "#f59e0b" },
    taskPriority: { label: "Task Priority", color: "#8b5cf6" },
    custom: { label: "Custom", color: "#6b7280" },
  };

// Chart colors
const CHART_COLORS = {
  text: "rgba(255, 255, 255, 0.7)",
  textMuted: "rgba(255, 255, 255, 0.5)",
  tooltip: {
    bg: "#1c1f24",
    border: "rgba(255, 255, 255, 0.15)",
    text: "#ffffff",
  },
};

const CHART_COLORS_LIGHT = {
  text: "#262626",
  textMuted: "#545454",
  tooltip: {
    bg: "#ffffff",
    border: "#a0a0a0",
    text: "#262626",
  },
};

/**
 * Infer survey type from survey ID using naming conventions
 */
function inferSurveyType(surveyId: string): SurveyType {
  const id = surveyId.toLowerCase();
  if (id.includes("top-tasks") || id.includes("toptasks")) return "topTasks";
  if (id.includes("discovery")) return "discovery";
  if (id.includes("priority") || id.includes("taskpriority"))
    return "taskPriority";
  if (id.includes("vurdering") || id.includes("rating")) return "rating";
  if (id.includes("custom") || id.includes("complex")) return "custom";
  // Default to rating for unknown surveys
  return "rating";
}

interface SurveyTypeDistributionProps {
  /** Height of the chart in pixels */
  height?: number;
}

export function SurveyTypeDistribution({
  height = 200,
}: SurveyTypeDistributionProps) {
  const { data: surveysByApp, isPending } = useSurveysByApp();
  const { theme } = useTheme();

  const colors = theme === "light" ? CHART_COLORS_LIGHT : CHART_COLORS;

  if (isPending) {
    return <Skeleton variant="rectangle" height={height} />;
  }

  if (!surveysByApp) {
    return null;
  }

  // Count surveys by type
  const typeCounts: Record<SurveyType, number> = {
    rating: 0,
    topTasks: 0,
    discovery: 0,
    taskPriority: 0,
    custom: 0,
  };

  for (const app of Object.keys(surveysByApp)) {
    for (const surveyId of surveysByApp[app]) {
      const type = inferSurveyType(surveyId);
      typeCounts[type]++;
    }
  }

  // Transform to chart data, filter out zeros
  const data = Object.entries(typeCounts)
    .filter(([, count]) => count > 0)
    .map(([type, count]) => ({
      type: type as SurveyType,
      label: SURVEY_TYPE_CONFIG[type as SurveyType].label,
      count,
      color: SURVEY_TYPE_CONFIG[type as SurveyType].color,
    }))
    .sort((a, b) => b.count - a.count);

  if (data.length === 0) {
    return (
      <div
        style={{
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: colors.textMuted,
        }}
      >
        Ingen survey-data tilgjengelig
      </div>
    );
  }

  const totalSurveys = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.1} horizontal={false} />
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={{ fill: colors.text, fontSize: 12 }}
          width={75}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const d = payload[0].payload;
              const percentage = Math.round((d.count / totalSurveys) * 100);
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
                    {d.label}
                  </div>
                  <div>
                    {d.count} {d.count === 1 ? "survey" : "surveys"} (
                    {percentage}%)
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={30}>
          {data.map((entry) => (
            <Cell key={entry.type} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
