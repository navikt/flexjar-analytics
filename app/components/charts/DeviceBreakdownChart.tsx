import {
  BodyShort,
  HStack,
  Hide,
  Label,
  Show,
  Skeleton,
  VStack,
} from "@navikt/ds-react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTheme } from "~/context/ThemeContext";
import { useStats } from "~/hooks/useStats";

const DEVICE_COLORS: Record<string, string> = {
  desktop: "#60A5FA", // Blue
  mobile: "#34D399", // Green
  tablet: "#FBBF24", // Yellow
  unknown: "#9CA3AF", // Gray
};

const DEVICE_ICONS: Record<string, string> = {
  desktop: "🖥️",
  mobile: "📱",
  tablet: "📱",
  unknown: "❓",
};

const DEVICE_LABELS: Record<string, string> = {
  desktop: "Desktop",
  mobile: "Mobil",
  tablet: "Nettbrett",
  unknown: "Ukjent",
};

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
  text: "#262626", // Nav Gray 90
  textMuted: "#545454", // Nav Gray 60
  tooltip: {
    bg: "#ffffff",
    border: "#a0a0a0", // Nav Gray 40
    text: "#262626",
  },
};

export function DeviceBreakdownChart() {
  const { data: stats, isLoading } = useStats();
  const { theme } = useTheme();

  const colors = theme === "light" ? CHART_COLORS_LIGHT : CHART_COLORS;

  if (isLoading) {
    return <Skeleton variant="rectangle" height={200} />;
  }

  const byDevice = stats?.byDevice || {};

  // Transform to array and sort by count
  const data = Object.entries(byDevice)
    .filter(([device]) => device !== "unknown")
    .map(([device, { count, averageRating }]) => ({
      device,
      label: DEVICE_LABELS[device] || device,
      icon: DEVICE_ICONS[device] || "❓",
      count,
      averageRating,
      color: DEVICE_COLORS[device] || DEVICE_COLORS.unknown,
    }))
    .sort((a, b) => b.count - a.count);

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
        Ingen enhetsdata tilgjengelig
      </div>
    );
  }

  const totalCount = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <VStack gap="4" style={{ width: "100%" }}>
      {/* Mobile: Simple compact list with progress bars */}
      <Hide above="md">
        <VStack gap="3" style={{ width: "100%" }}>
          {data.map((d) => {
            const percentage = Math.round((d.count / totalCount) * 100);
            return (
              <div key={d.device}>
                <HStack justify="space-between" align="center" gap="2">
                  <HStack gap="2" align="center">
                    <span style={{ fontSize: "1rem" }}>{d.icon}</span>
                    <BodyShort size="small" weight="semibold">
                      {d.label}
                    </BodyShort>
                  </HStack>
                  <HStack gap="2" align="center">
                    <BodyShort size="small">{d.count}</BodyShort>
                    <BodyShort size="small" style={{ color: colors.textMuted }}>
                      ({percentage}%)
                    </BodyShort>
                  </HStack>
                </HStack>
                <div
                  style={{
                    width: "100%",
                    height: "8px",
                    background: "var(--ax-bg-neutral-moderate)",
                    borderRadius: "4px",
                    marginTop: "0.25rem",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${percentage}%`,
                      height: "100%",
                      background: d.color,
                      borderRadius: "4px",
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </VStack>
      </Hide>

      {/* Desktop: Cards + Bar chart */}
      <Show above="md">
        {/* Summary cards */}
        <HStack gap="4" wrap>
          {data.map((d) => (
            <div
              key={d.device}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 0.75rem",
                background: "var(--ax-bg-neutral-soft)",
                borderRadius: "6px",
                borderLeft: `3px solid ${d.color}`,
              }}
            >
              <span style={{ fontSize: "1.25rem" }}>{d.icon}</span>
              <VStack gap="0">
                <Label size="small">{d.label}</Label>
                <HStack gap="2" align="center">
                  <BodyShort size="small" weight="semibold">
                    {d.count}
                  </BodyShort>
                  <BodyShort size="small" style={{ color: colors.textMuted }}>
                    ({Math.round((d.count / totalCount) * 100)}%)
                  </BodyShort>
                  <BodyShort
                    size="small"
                    style={{
                      color:
                        d.averageRating >= 4
                          ? "#34D399"
                          : d.averageRating <= 2
                            ? "#F87171"
                            : colors.text,
                    }}
                  >
                    ⭐ {d.averageRating.toFixed(1)}
                  </BodyShort>
                </HStack>
              </VStack>
            </div>
          ))}
        </HStack>

        {/* Bar chart - only on desktop */}
        <div
          style={{ height: "120px" }}
          role="img"
          aria-label={`Enhetsfordeling: ${data.map((d) => `${d.label} ${d.count} svar`).join(", ")}`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 0, right: 30, left: 80, bottom: 0 }}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: colors.text, fontSize: 12 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
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
                        <div
                          style={{ fontWeight: 600, marginBottom: "0.25rem" }}
                        >
                          {d.icon} {d.label}
                        </div>
                        <div>
                          {d.count} tilbakemeldinger (
                          {Math.round((d.count / totalCount) * 100)}%)
                        </div>
                        <div>Snittrating: {d.averageRating.toFixed(1)} ⭐</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {data.map((entry) => (
                  <Cell key={entry.device} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Show>
    </VStack>
  );
}
