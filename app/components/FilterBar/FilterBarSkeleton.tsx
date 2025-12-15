import { Box, HStack, Skeleton, VStack } from "@navikt/ds-react";

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
      <Box.New
        padding="4"
        background="raised"
        borderRadius="large"
        style={{ boxShadow: "var(--ax-shadow-small)", minHeight: "52px" }}
        borderColor="neutral-subtle"
        borderWidth="1"
      >
        <HStack gap="3" align="end" wrap>
          {/* App Select (32px) - Fixed Width 200 */}
          <Skeleton variant="rounded" width={200} height={32} />

          {/* Survey Select (32px) - Fixed Width 250 */}
          <Skeleton variant="rounded" width={250} height={32} />

          <div style={{ flex: 1 }} />

          {/* Period Selector (34px) - Exact measured width 156 */}
          <Skeleton variant="rounded" width={156} height={34} />

          {/* Reset Button (32px) */}
          {hasActiveFilters && (
            <Skeleton variant="rounded" width={100} height={32} />
          )}
        </HStack>
      </Box.New>

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
