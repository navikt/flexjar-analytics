import { DeviceBreakdownSection } from "~/components/DeviceBreakdownSection";
import {
  DiscoveryAnalysis,
  DiscoveryAnalysisSkeleton,
} from "~/components/DiscoveryAnalysis";
import { StatsCards } from "~/components/StatsCards";
import { TimelineSection } from "~/components/TimelineSection";
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
      <TimelineSection title="Antall svar over tid" />

      {/* Discovery Analysis - show skeleton while loading */}
      {isPending ? (
        <DiscoveryAnalysisSkeleton />
      ) : (
        data && <DiscoveryAnalysis data={data} />
      )}

      {/* Device breakdown */}
      <DeviceBreakdownSection />
    </>
  );
}
