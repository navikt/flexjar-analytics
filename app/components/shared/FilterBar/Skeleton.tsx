import {
  Skeleton as AkselSkeleton,
  Box,
  HGrid,
  HStack,
  Hide,
  Show,
  VStack,
} from "@navikt/ds-react";

interface FilterBarSkeletonProps {
  showDetails?: boolean;
  hasActiveFilters?: boolean;
}

export function Skeleton({
  showDetails,
  hasActiveFilters,
}: FilterBarSkeletonProps) {
  return (
    <VStack gap="space-12" style={{ width: "100%" }}>
      {/* Primary Row: Mirrors FilterBar's HGrid layout */}
      <Box.New
        padding={{ xs: "space-12", md: "space-16" }}
        background="raised"
        borderRadius="large"
        style={{ boxShadow: "var(--ax-shadow-small)" }}
        borderColor="neutral-subtle"
        borderWidth="1"
      >
        <HGrid
          columns={{ xs: 1, sm: 2, lg: "1fr 1fr auto auto" }}
          gap={{ xs: "space-8", md: "space-12" }}
          align="end"
        >
          {/* App Select Skeleton */}
          <AkselSkeleton variant="rounded" height={32} />

          {/* Survey Select Skeleton */}
          <AkselSkeleton variant="rounded" height={32} />

          {/* Period and Reset - visible on lg+ */}
          <Show above="lg">
            <AkselSkeleton variant="rounded" width={156} height={34} />
          </Show>
          <Show above="lg">
            {hasActiveFilters && (
              <AkselSkeleton variant="rounded" width={100} height={32} />
            )}
          </Show>
        </HGrid>

        {/* Period and reset on mobile/tablet */}
        <Hide above="lg">
          <HStack
            gap="space-8"
            justify="space-between"
            align="center"
            style={{ marginTop: "0.5rem" }}
          >
            <AkselSkeleton variant="rounded" width={156} height={34} />
            {hasActiveFilters && (
              <AkselSkeleton variant="rounded" width={100} height={32} />
            )}
          </HStack>
        </Hide>
      </Box.New>

      {/* Secondary Row: Detail Filters */}
      {showDetails && (
        <Box.New
          paddingInline="space-16"
          paddingBlock="space-12"
          style={{
            background: "var(--ax-bg-default)",
            minHeight: "44px",
          }}
          borderRadius="large"
          borderColor="neutral-subtle"
          borderWidth="1"
        >
          <HStack gap="space-12" align="center" wrap>
            <HStack gap="space-8" align="center">
              {/* Search + Tags */}
              <AkselSkeleton variant="rounded" width={200} height={32} />
              <AkselSkeleton variant="rounded" width={200} height={32} />
            </HStack>

            <HStack gap="space-8" align="center">
              {/* Device Toggle + Buttons */}
              <AkselSkeleton variant="rounded" width={150} height={32} />
              <div
                style={{
                  width: "1px",
                  height: "24px",
                  background: "var(--ax-border-neutral-subtle)",
                  margin: "0 0.25rem",
                }}
              />
              <AkselSkeleton variant="rounded" width={100} height={32} />
              <AkselSkeleton variant="rounded" width={100} height={32} />
            </HStack>
          </HStack>
        </Box.New>
      )}
    </VStack>
  );
}
