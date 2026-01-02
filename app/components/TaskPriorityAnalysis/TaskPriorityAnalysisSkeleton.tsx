import { Skeleton, VStack } from "@navikt/ds-react";
import { DashboardCard, DashboardGrid } from "~/components/DashboardComponents";

/**
 * Skeleton for Task Priority Analysis while loading
 */
export function TaskPriorityAnalysisSkeleton() {
  return (
    <>
      {/* Stats cards skeleton */}
      <DashboardGrid columns={{ xs: 2, sm: 3 }} gap="space-16">
        <DashboardCard padding={{ xs: "space-16", md: "space-20" }}>
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" height={40} />
        </DashboardCard>
        <DashboardCard padding={{ xs: "space-16", md: "space-20" }}>
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" height={40} />
        </DashboardCard>
        <DashboardCard padding={{ xs: "space-16", md: "space-20" }}>
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" height={40} />
        </DashboardCard>
      </DashboardGrid>

      {/* Long neck chart skeleton */}
      <DashboardCard padding={{ xs: "space-16", md: "space-24" }}>
        <VStack gap="space-16">
          <Skeleton variant="text" width="45%" />
          <VStack gap="space-12">
            {[100, 85, 70, 55, 40].map((width) => (
              <div key={width}>
                <Skeleton variant="text" width="60%" />
                <Skeleton
                  variant="rounded"
                  height={8}
                  width={`${width}%`}
                  style={{ marginTop: "0.25rem" }}
                />
              </div>
            ))}
          </VStack>
        </VStack>
      </DashboardCard>
    </>
  );
}
