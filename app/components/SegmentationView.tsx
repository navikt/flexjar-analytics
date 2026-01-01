import { FingerMobileIcon, LaptopIcon, TabletIcon } from "@navikt/aksel-icons";
import { BodyShort, Box, HStack, Heading, Tag, VStack } from "@navikt/ds-react";
import { DashboardCard } from "~/components/DashboardComponents";

interface SegmentationViewProps {
  deviceBreakdown?: Record<
    string,
    {
      count: number;
      successRate: number;
      avgTpiScore?: number;
    }
  >;
}

const DEVICE_CONFIG: Record<
  string,
  { icon: React.ReactNode; label: string; color: string }
> = {
  mobile: {
    icon: <FingerMobileIcon aria-hidden />,
    label: "Mobil",
    color: "#34D399",
  },
  tablet: {
    icon: <TabletIcon aria-hidden />,
    label: "Nettbrett",
    color: "#FBBF24",
  },
  desktop: {
    icon: <LaptopIcon aria-hidden />,
    label: "Desktop",
    color: "#60A5FA",
  },
};

/**
 * Segmentation view showing Top Tasks performance by device type.
 * Helps identify if certain devices have worse task completion rates.
 */
export function SegmentationView({ deviceBreakdown }: SegmentationViewProps) {
  // If no device breakdown provided, show placeholder
  if (!deviceBreakdown || Object.keys(deviceBreakdown).length === 0) {
    return (
      <DashboardCard>
        <BodyShort textColor="subtle">
          Segmenteringsdata ikke tilgjengelig. Sørg for at widget sender
          enhetsinfo.
        </BodyShort>
      </DashboardCard>
    );
  }

  const devices = Object.entries(deviceBreakdown)
    .filter(([key]) => key !== "unknown")
    .sort(([, a], [, b]) => b.count - a.count);

  const totalCount = devices.reduce((acc, [, data]) => acc + data.count, 0);

  // Find best and worst performing devices
  const sortedBySuccess = [...devices].sort(
    ([, a], [, b]) => b.successRate - a.successRate,
  );
  const bestDevice = sortedBySuccess[0];
  const worstDevice = sortedBySuccess[sortedBySuccess.length - 1];

  return (
    <DashboardCard padding="0" style={{ overflow: "hidden" }}>
      <Box.New
        padding={{ xs: "space-16", md: "space-24" }}
        borderWidth="0 0 1 0"
        borderColor="neutral-subtle"
      >
        <Heading size="small">Segmentering: Enhet</Heading>
        <BodyShort
          size="small"
          textColor="subtle"
          style={{ marginTop: "0.25rem" }}
        >
          Suksessrate og TPI per enhetstype
        </BodyShort>
      </Box.New>

      <Box.New padding={{ xs: "space-16", md: "space-24" }}>
        <VStack gap="space-16">
          {devices.map(([device, data]) => {
            const config = DEVICE_CONFIG[device] || {
              icon: null,
              label: device,
              color: "#9CA3AF",
            };
            const percentage = Math.round((data.count / totalCount) * 100);
            const successPct = Math.round(data.successRate * 100);

            return (
              <div
                key={device}
                style={{
                  padding: "1rem",
                  backgroundColor: "var(--ax-bg-neutral-soft)",
                  borderRadius: "var(--ax-border-radius-medium)",
                  borderLeft: `3px solid ${config.color}`,
                }}
              >
                <HStack justify="space-between" align="center">
                  <HStack gap="space-8" align="center">
                    <span style={{ fontSize: "1.25rem", color: config.color }}>
                      {config.icon}
                    </span>
                    <VStack gap="0">
                      <BodyShort weight="semibold">{config.label}</BodyShort>
                      <BodyShort size="small" textColor="subtle">
                        {data.count} svar ({percentage}%)
                      </BodyShort>
                    </VStack>
                  </HStack>

                  <HStack gap="space-12" align="center">
                    <VStack gap="0" align="end">
                      <BodyShort size="small" textColor="subtle">
                        Suksess
                      </BodyShort>
                      <Tag
                        size="xsmall"
                        variant={
                          successPct >= 80
                            ? "success"
                            : successPct >= 60
                              ? "warning"
                              : "error"
                        }
                      >
                        {successPct}%
                      </Tag>
                    </VStack>

                    {data.avgTpiScore !== undefined && (
                      <VStack gap="0" align="end">
                        <BodyShort size="small" textColor="subtle">
                          TPI
                        </BodyShort>
                        <Tag
                          size="xsmall"
                          variant={
                            data.avgTpiScore >= 75
                              ? "success"
                              : data.avgTpiScore >= 60
                                ? "warning"
                                : "error"
                          }
                        >
                          {Math.round(data.avgTpiScore)}
                        </Tag>
                      </VStack>
                    )}
                  </HStack>
                </HStack>
              </div>
            );
          })}
        </VStack>

        {/* Insight box */}
        {bestDevice && worstDevice && bestDevice[0] !== worstDevice[0] && (
          <Box.New
            marginBlock="space-16 0"
            paddingBlock="space-12"
            borderWidth="1 0 0 0"
            borderColor="neutral-subtle"
          >
            <BodyShort size="small" textColor="subtle">
              💡 <strong>Innsikt:</strong>{" "}
              {DEVICE_CONFIG[bestDevice[0]]?.label || bestDevice[0]} har høyest
              suksessrate (
              <span style={{ color: "var(--ax-status-success)" }}>
                {Math.round(bestDevice[1].successRate * 100)}%
              </span>
              ), mens {DEVICE_CONFIG[worstDevice[0]]?.label || worstDevice[0]}{" "}
              har lavest (
              <span style={{ color: "var(--ax-status-danger)" }}>
                {Math.round(worstDevice[1].successRate * 100)}%
              </span>
              ).
            </BodyShort>
          </Box.New>
        )}
      </Box.New>
    </DashboardCard>
  );
}
