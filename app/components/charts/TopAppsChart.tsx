import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useStats } from "~/lib/useStats";
import { Skeleton } from "@navikt/ds-react";

// Chart colors for dark mode
const CHART_COLORS = {
  primary: "#60A5FA", // Blue for bars
  text: "rgba(255, 255, 255, 0.85)",
  textMuted: "rgba(255, 255, 255, 0.5)",
  tooltip: {
    bg: "#1c1f24",
    border: "rgba(255, 255, 255, 0.15)",
  }
};

export function TopAppsChart() {
  const { data: stats, isLoading } = useStats();

  if (isLoading) {
    return <Skeleton variant="rectangle" height={200} />;
  }

  const byApp = stats?.byApp || {};
  
  // Transform and sort by count, take top 10
  const data = Object.entries(byApp)
    .map(([app, count]) => ({ app, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  if (data.length === 0) {
    return (
      <div style={{ 
        height: "100%", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        color: CHART_COLORS.textMuted
      }}>
        Ingen app-data tilgjengelig
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart 
        data={data} 
        layout="vertical"
        margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
        role="img"
        aria-label={`Horisontalt søylediagram som viser antall tilbakemeldinger per app. ${data.length} apper vist.`}
      >
        <XAxis 
          type="number"
          axisLine={false}
          tickLine={false}
          tick={{ fill: CHART_COLORS.textMuted, fontSize: 12 }}
        />
        <YAxis 
          type="category"
          dataKey="app" 
          axisLine={false}
          tickLine={false}
          tick={{ fill: CHART_COLORS.text, fontSize: 12 }}
          width={90}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload;
              return (
                <div style={{
                  background: CHART_COLORS.tooltip.bg,
                  color: "#ffffff",
                  padding: "0.75rem",
                  borderRadius: "4px",
                  border: `1px solid ${CHART_COLORS.tooltip.border}`,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.4)"
                }}>
                  <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>{data.app}</div>
                  <div>{data.count.toLocaleString("no-NO")} tilbakemeldinger</div>
                </div>
              );
            }
            return null;
          }}
        />
        <Bar 
          dataKey="count" 
          fill={CHART_COLORS.primary}
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
