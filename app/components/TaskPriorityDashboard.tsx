import { DeviceBreakdownSection } from "~/components/DeviceBreakdownSection";
import {
  TaskPriorityAnalysis,
  TaskPriorityAnalysisSkeleton,
} from "~/components/TaskPriorityAnalysis";
import { TimelineSection } from "~/components/TimelineSection";
import { useTaskPriorityStats } from "~/hooks/useTaskPriorityStats";

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
