import { Heading, VStack } from "@navikt/ds-react";
import { DashboardCard } from "~/components/DashboardComponents";
import {
  DiscoveryAnalysis,
  DiscoveryAnalysisSkeleton,
} from "~/components/DiscoveryAnalysis";
import { StatsCards } from "~/components/StatsCards";
import { DeviceBreakdownChart } from "~/components/charts/DeviceBreakdownChart";
import { TimelineChart } from "~/components/charts/TimelineChart";
import { useDiscoveryStats } from "~/hooks/useDiscoveryStats";

/**
 * Discovery Dashboard - word cloud, themes, recent responses
 */
export function DiscoveryDashboard() {
  const { data, isPending } = useDiscoveryStats();

  return (
    <>
      <StatsCards />

      {/* Timeline */}
      <DashboardCard padding={{ xs: "space-16", md: "space-24" }}>
        <VStack gap="space-16">
          <Heading size="small">Antall svar over tid</Heading>
          <div style={{ height: "clamp(200px, 40vw, 300px)", width: "100%" }}>
            <TimelineChart />
          </div>
        </VStack>
      </DashboardCard>

      {/* Discovery Analysis - show skeleton while loading */}
      {isPending ? (
        <DiscoveryAnalysisSkeleton />
      ) : (
        data && <DiscoveryAnalysis data={data} />
      )}

      {/* Device breakdown */}
      <DashboardCard padding={{ xs: "space-16", md: "space-24" }}>
        <VStack gap="space-16">
          <Heading size="small">Enheter</Heading>
          <div style={{ height: "clamp(150px, 30vw, 200px)", width: "100%" }}>
            <DeviceBreakdownChart />
          </div>
        </VStack>
      </DashboardCard>
    </>
  );
}
