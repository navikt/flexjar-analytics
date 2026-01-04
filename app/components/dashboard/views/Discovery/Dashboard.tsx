import { DeviceBreakdownSection } from "~/components/dashboard/sections/FieldStats/DeviceBreakdownSection";
import { StatsCards } from "~/components/dashboard/sections/StatsCards";
import { TimelineSection } from "~/components/dashboard/sections/Timeline";
import { useDiscoveryStats } from "~/hooks/useDiscoveryStats";
import { Skeleton as DiscoveryAnalysisSkeleton } from "./Skeleton";
import { DiscoveryAnalysis } from "./index";

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
