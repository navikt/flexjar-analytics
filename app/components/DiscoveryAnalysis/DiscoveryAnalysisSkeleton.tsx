import { Skeleton, VStack } from "@navikt/ds-react";
import { DashboardCard } from "~/components/DashboardComponents";

/**
 * Skeleton for Discovery Analysis while loading
 */
export function DiscoveryAnalysisSkeleton() {
  return (
    <>
      {/* Word frequency skeleton */}
      <DashboardCard padding={{ xs: "space-16", md: "space-24" }}>
        <VStack gap="space-16">
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="rectangle" height={120} />
        </VStack>
      </DashboardCard>

      {/* Themes skeleton */}
      <DashboardCard padding={{ xs: "space-16", md: "space-24" }}>
        <VStack gap="space-16">
          <Skeleton variant="text" width="35%" />
          <VStack gap="space-12">
            <Skeleton variant="rounded" height={60} />
            <Skeleton variant="rounded" height={60} />
          </VStack>
        </VStack>
      </DashboardCard>

      {/* Recent responses skeleton */}
      <DashboardCard padding={{ xs: "space-16", md: "space-24" }}>
        <VStack gap="space-16">
          <Skeleton variant="text" width="30%" />
          <VStack gap="space-8">
            <Skeleton variant="rounded" height={40} />
            <Skeleton variant="rounded" height={40} />
            <Skeleton variant="rounded" height={40} />
          </VStack>
        </VStack>
      </DashboardCard>
    </>
  );
}
