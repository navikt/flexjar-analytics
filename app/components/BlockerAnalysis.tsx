import { BulletListIcon } from "@navikt/aksel-icons";
import { BodyShort, Box, HStack, Heading, VStack } from "@navikt/ds-react";
import { DashboardCard } from "~/components/DashboardComponents";
import type { TopTaskStats } from "~/types/api";

interface BlockerAnalysisProps {
  tasks: TopTaskStats[];
}

/**
 * Analyzes blocker patterns across all tasks to identify common failure reasons.
 * This supports data-driven discovery of structured blocker categories.
 */
export function BlockerAnalysis({ tasks }: BlockerAnalysisProps) {
  // Aggregate all blockers across all tasks
  const aggregatedBlockers: Record<string, number> = {};
  let totalBlockerCount = 0;

  for (const task of tasks) {
    for (const [blocker, count] of Object.entries(task.blockerCounts)) {
      aggregatedBlockers[blocker] = (aggregatedBlockers[blocker] || 0) + count;
      totalBlockerCount += count;
    }
  }

  // Sort by count and take top 10
  const sortedBlockers = Object.entries(aggregatedBlockers)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  if (sortedBlockers.length === 0) {
    return null;
  }

  const maxCount = sortedBlockers[0]?.[1] ?? 1;

  return (
    <DashboardCard padding="0" style={{ overflow: "hidden" }}>
      <Box.New
        padding={{ xs: "space-16", md: "space-24" }}
        borderWidth="0 0 1 0"
        borderColor="neutral-subtle"
      >
        <HStack gap="space-8" align="center">
          <span
            style={{ color: "var(--ax-text-neutral-subtle)", display: "flex" }}
          >
            <BulletListIcon fontSize="1.25rem" aria-hidden />
          </span>
          <Heading size="small">Blocker-mønstre</Heading>
        </HStack>
        <BodyShort
          size="small"
          textColor="subtle"
          style={{ marginTop: "0.25rem" }}
        >
          Vanligste årsaker til at brukere ikke fullførte ({totalBlockerCount}{" "}
          totalt)
        </BodyShort>
      </Box.New>

      <Box.New padding={{ xs: "space-16", md: "space-24" }}>
        <VStack gap="space-12">
          {sortedBlockers.map(([blocker, count], index) => {
            const percentage = Math.round((count / totalBlockerCount) * 100);
            const relativeWidth = (count / maxCount) * 100;

            // Color based on severity/rank
            const barColor =
              index < 3
                ? "var(--ax-status-danger)"
                : index < 5
                  ? "var(--ax-status-warning)"
                  : "var(--ax-border-neutral-subtle)";

            return (
              <div key={blocker}>
                <HStack justify="space-between" align="baseline" wrap={false}>
                  <BodyShort size="small" weight="semibold" truncate>
                    {index + 1}. {blocker}
                  </BodyShort>
                  <BodyShort
                    size="small"
                    textColor="subtle"
                    style={{ flexShrink: 0, marginLeft: "0.5rem" }}
                  >
                    {count} ({percentage}%)
                  </BodyShort>
                </HStack>
                {/* Custom styled progress bar */}
                <div
                  style={{
                    marginTop: "0.25rem",
                    height: "6px",
                    borderRadius: "3px",
                    backgroundColor: "var(--ax-bg-neutral-moderate)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${relativeWidth}%`,
                      height: "100%",
                      borderRadius: "3px",
                      backgroundColor: barColor,
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </VStack>

        {sortedBlockers.length >= 5 && (
          <Box.New
            marginBlock="space-16 0"
            paddingBlock="space-12"
            borderWidth="1 0 0 0"
            borderColor="neutral-subtle"
          >
            <BodyShort size="small" textColor="subtle">
              💡 <strong>Innsikt:</strong> De{" "}
              {Math.min(5, sortedBlockers.length)} vanligste årsakene utgjør{" "}
              <span style={{ color: "var(--ax-status-warning)" }}>
                {Math.round(
                  (sortedBlockers
                    .slice(0, 5)
                    .reduce((acc, [, count]) => acc + count, 0) /
                    totalBlockerCount) *
                    100,
                )}
                %
              </span>{" "}
              av alle hindringer.
            </BodyShort>
          </Box.New>
        )}
      </Box.New>
    </DashboardCard>
  );
}
