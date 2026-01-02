import { Heading, VStack } from "@navikt/ds-react";
import { DashboardCard } from "~/components/DashboardComponents";
import {
  TaskPriorityAnalysis,
  TaskPriorityAnalysisSkeleton,
} from "~/components/TaskPriorityAnalysis";
import { DeviceBreakdownChart } from "~/components/charts/DeviceBreakdownChart";
import { TimelineChart } from "~/components/charts/TimelineChart";
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
      <DashboardCard padding={{ xs: "space-16", md: "space-24" }}>
        <VStack gap="space-16">
          <Heading size="small">Stemmer over tid</Heading>
          <div style={{ height: "clamp(200px, 40vw, 300px)", width: "100%" }}>
            <TimelineChart />
          </div>
        </VStack>
      </DashboardCard>

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
