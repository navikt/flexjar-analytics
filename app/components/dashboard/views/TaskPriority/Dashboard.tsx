import { DeviceBreakdownSection } from "~/components/dashboard/sections/FieldStats/DeviceBreakdownSection";
import { TimelineSection } from "~/components/dashboard/sections/Timeline";
import { useTaskPriorityStats } from "~/hooks/useTaskPriorityStats";
import { Skeleton as TaskPriorityAnalysisSkeleton } from "./Skeleton";
import { TaskPriorityAnalysis } from "./index";

/**
 * Task Priority Dashboard - Long Neck chart, vote distribution
 */
export function TaskPriorityDashboard() {
  const { data, isPending } = useTaskPriorityStats();

  return (
    <>
      {/* Task Priority Analysis - show skeleton while loading */}
      {isPending ? (
        <TaskPriorityAnalysisSkeleton />
      ) : (
        data && <TaskPriorityAnalysis data={data} />
      )}

      {/* Timeline */}
      <TimelineSection title="Stemmer over tid" />

      {/* Device breakdown */}
      <DeviceBreakdownSection />
    </>
  );
}
