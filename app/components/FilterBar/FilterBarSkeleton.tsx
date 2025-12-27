import {
  Box,
  HGrid,
  HStack,
  Hide,
  Show,
  Skeleton,
  VStack,
} from "@navikt/ds-react";

interface FilterBarSkeletonProps {
  showDetails?: boolean;
  hasActiveFilters?: boolean;
}

export function FilterBarSkeleton({
  showDetails,
  hasActiveFilters,
}: FilterBarSkeletonProps) {
  return (
    <VStack gap="3" style={{ width: "100%" }}>
      {/* Primary Row: Mirrors FilterBar's HGrid layout */}
      <Box.New
        padding={{ xs: "3", md: "4" }}
        background="raised"
        borderRadius="large"
        style={{ boxShadow: "var(--ax-shadow-small)" }}
        borderColor="neutral-subtle"
        borderWidth="1"
      >
        <HGrid
          columns={{ xs: 1, sm: 2, lg: "1fr 1fr auto auto" }}
          gap={{ xs: "2", md: "3" }}
          align="end"
        >
          {/* App Select Skeleton */}
          <Skeleton variant="rounded" height={32} />

          {/* Survey Select Skeleton */}
          <Skeleton variant="rounded" height={32} />

          {/* Period and Reset - visible on lg+ */}
          <Show above="lg">
            <Skeleton variant="rounded" width={156} height={34} />
          </Show>
          <Show above="lg">
            {hasActiveFilters && (
              <Skeleton variant="rounded" width={100} height={32} />
            )}
          </Show>
        </HGrid>

        {/* Period and reset on mobile/tablet */}
        <Hide above="lg">
          <HStack
            gap="2"
            justify="space-between"
            align="center"
            style={{ marginTop: "0.5rem" }}
          >
            <Skeleton variant="rounded" width={156} height={34} />
            {hasActiveFilters && (
              <Skeleton variant="rounded" width={100} height={32} />
            )}
          </HStack>
        </Hide>
      </Box.New>

      {/* Secondary Row: Detail Filters */}
      {showDetails && (
        <Box.New
          paddingInline="4"
          paddingBlock="3"
          style={{
            background: "var(--ax-bg-default)",
            minHeight: "44px",
          }}
          borderRadius="large"
          borderColor="neutral-subtle"
          borderWidth="1"
        >
          <HStack gap="3" align="center" wrap>
            <HStack gap="2" align="center">
              {/* Search + Tags */}
              <Skeleton variant="rounded" width={200} height={32} />
              <Skeleton variant="rounded" width={200} height={32} />
            </HStack>

            <HStack gap="2" align="center">
              {/* Device Toggle + Buttons */}
              <Skeleton variant="rounded" width={150} height={32} />
              <div
                style={{
                  width: "1px",
                  height: "24px",
                  background: "var(--ax-border-neutral-subtle)",
                  margin: "0 0.25rem",
                }}
              />
              <Skeleton variant="rounded" width={100} height={32} />
              <Skeleton variant="rounded" width={100} height={32} />
            </HStack>
          </HStack>
        </Box.New>
      )}
    </VStack>
  );
}
