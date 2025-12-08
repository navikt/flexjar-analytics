import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useStats } from "~/lib/useStats";
import { Skeleton } from "@navikt/ds-react";

const CHART_COLORS = {
  bar: "#818CF8", // Purple
  barHover: "#A5B4FC",
  text: "rgba(255, 255, 255, 0.7)",
  textMuted: "rgba(255, 255, 255, 0.5)",
  tooltip: {
    bg: "#1c1f24",
    border: "rgba(255, 255, 255, 0.15)",
  }
};

// Color based on rating
function getRatingColor(rating: number): string {
  if (rating >= 4) return "#34D399"; // Green
  if (rating >= 3) return "#FBBF24"; // Yellow
  return "#F87171"; // Red
}

export function TopPathsChart() {
  const { data: stats, isLoading } = useStats();

  if (isLoading) {
    return <Skeleton variant="rectangle" height={250} />;
  }

  const byPathname = stats?.byPathname || {};
  
  // Transform to array, filter out unknown, and sort by count
  const data = Object.entries(byPathname)
    .filter(([pathname]) => pathname !== "unknown")
    .map(([pathname, { count, averageRating }]) => ({
      pathname,
      shortPath: shortenPath(pathname),
      count,
      averageRating,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  if (data.length === 0) {
    return (
      <div style={{ 
        height: "100%", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        color: CHART_COLORS.textMuted
      }}>
        Ingen stier tilgjengelig
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 120, bottom: 5 }}>
        <XAxis type="number" hide />
        <YAxis 
          type="category" 
          dataKey="shortPath" 
          axisLine={false}
          tickLine={false}
          tick={{ fill: CHART_COLORS.text, fontSize: 11 }}
          width={115}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const d = payload[0].payload;
              return (
                <div style={{
                  background: CHART_COLORS.tooltip.bg,
                  color: "#ffffff",
                  padding: "0.75rem",
                  borderRadius: "4px",
                  border: `1px solid ${CHART_COLORS.tooltip.border}`,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                  maxWidth: "300px",
                }}>
                  <div style={{ fontWeight: 600, marginBottom: "0.5rem", wordBreak: "break-all" }}>
                    {d.pathname}
                  </div>
                  <div>{d.count} tilbakemeldinger</div>
                  <div style={{ color: getRatingColor(d.averageRating) }}>
                    Snittrating: {d.averageRating.toFixed(1)} {ratingToEmoji(Math.round(d.averageRating))}
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {data.map((entry) => (
            <Cell key={entry.pathname} fill={getRatingColor(entry.averageRating)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function shortenPath(pathname: string): string {
  // Remove leading slash
  let path = pathname.startsWith("/") ? pathname.slice(1) : pathname;
  
  // Split and take last meaningful parts
  const parts = path.split("/").filter(Boolean);
  
  if (parts.length <= 2) {
    return "/" + parts.join("/");
  }
  
  // Show first part and last part with ellipsis
  return `/${parts[0]}/.../${parts[parts.length - 1]}`;
}

function ratingToEmoji(rating: number): string {
  switch (rating) {
    case 1: return "😡";
    case 2: return "🙁";
    case 3: return "😐";
    case 4: return "😀";
    case 5: return "😍";
    default: return "❓";
  }
}
