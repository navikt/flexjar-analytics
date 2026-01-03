import { XMarkIcon } from "@navikt/aksel-icons";
import {
  BodyShort,
  Box,
  Button,
  HStack,
  Heading,
  Hide,
  Table,
  Tag,
  Tooltip,
} from "@navikt/ds-react";
import { useState } from "react";
import { BlockerAnalysis } from "~/components/BlockerAnalysis";
import { DashboardCard } from "~/components/DashboardComponents";
import { DeviceBreakdownSection } from "~/components/DeviceBreakdownSection";
import { TimelineSection } from "~/components/TimelineSection";
import { TopTasksStatsCards } from "~/components/TopTasksStatsCards";
import { TaskQuadrantChart } from "~/components/charts/TaskQuadrantChart";
import { useTopTasksStats } from "~/hooks/useTopTasksStats";

export function TopTasksOverview() {
  const { data, isLoading } = useTopTasksStats();
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  if (isLoading) return null;
  if (!data) return null;

  // Sort tasks by problem degree (high volume + low success = high priority)
  const sortedTasks = [...data.tasks].sort((a, b) => {
    const aScore = a.totalCount * (1 - a.successRate);
    const bScore = b.totalCount * (1 - b.successRate);
    return bScore - aScore;
  });

  // Filter tasks if a quadrant point is selected
  const displayTasks = selectedTask
    ? sortedTasks.filter((t) => t.task === selectedTask)
    : sortedTasks;

  return (
    <>
      <TopTasksStatsCards data={data} />

      <TimelineSection title="Suksessrate over tid" variant="topTasks" />

      <DashboardCard padding={{ xs: "space-16", md: "space-24" }}>
        <Box.New paddingBlock="0 space-16">
          <Heading size="small">Oppgavekvadranten</Heading>
          <p
            style={{ margin: "0.5rem 0 0", fontSize: "0.875rem", opacity: 0.7 }}
          >
            Volum vs suksessrate. Klikk på et punkt for å filtrere tabellen.
          </p>
        </Box.New>
        <div style={{ height: "clamp(280px, 50vw, 400px)", width: "100%" }}>
          <TaskQuadrantChart
            selectedTask={selectedTask}
            onTaskSelect={setSelectedTask}
          />
        </div>
      </DashboardCard>

      <DashboardCard padding="0" style={{ overflow: "hidden" }}>
        <Box.New
          padding={{ xs: "space-16", md: "space-24" }}
          borderWidth="0 0 1 0"
          borderColor="neutral-subtle"
        >
          <HStack justify="space-between" align="center" wrap gap="space-8">
            <Heading size="small">
              {data.questionText
                ? `Spørsmål: ${data.questionText}`
                : "Spørsmål"}
            </Heading>
            {selectedTask && (
              <HStack gap="space-8" align="center">
                <BodyShort size="small" textColor="subtle">
                  Filtrert:
                </BodyShort>
                <Tag size="small" variant="info">
                  {selectedTask}
                  <Button
                    variant="tertiary-neutral"
                    size="xsmall"
                    icon={<XMarkIcon aria-hidden />}
                    onClick={() => setSelectedTask(null)}
                    style={{ marginLeft: "0.25rem" }}
                  />
                </Tag>
              </HStack>
            )}
          </HStack>
        </Box.New>
        <Box overflowX="auto">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Svaralternativer</Table.HeaderCell>
                <Table.HeaderCell>Suksessrate</Table.HeaderCell>
                <Table.HeaderCell align="right">Svar</Table.HeaderCell>
                <Table.HeaderCell align="right">Suksess</Table.HeaderCell>
                {/* Extra columns hidden on mobile */}
                <Hide below="md" asChild>
                  <Tooltip content="Brukeren kom delvis i mål med oppgaven">
                    <Table.HeaderCell align="right" style={{ cursor: "help" }}>
                      Delvis
                    </Table.HeaderCell>
                  </Tooltip>
                </Hide>
                <Hide below="md" asChild>
                  <Table.HeaderCell align="right">Feil</Table.HeaderCell>
                </Hide>
                <Table.HeaderCell /> {/* For expand button on right */}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {displayTasks.map((task) => {
                const hasBlockers = Object.keys(task.blockerCounts).length > 0;

                return (
                  <Table.ExpandableRow
                    key={task.task}
                    togglePlacement="right"
                    expansionDisabled={!hasBlockers}
                    content={
                      hasBlockers ? (
                        <div
                          style={{
                            padding: "1rem",
                            backgroundColor: "var(--ax-bg-neutral-soft)",
                          }}
                        >
                          <Heading size="xsmall" level="4" spacing>
                            Årsaker til at oppgaven stoppet
                          </Heading>
                          <ul style={{ margin: 0, paddingLeft: "1.5rem" }}>
                            {Object.entries(task.blockerCounts)
                              .sort(([, a], [, b]) => b - a)
                              .map(([reason, count]) => (
                                <li
                                  key={reason}
                                  style={{ marginBottom: "0.25rem" }}
                                >
                                  <strong>{count}</strong>{" "}
                                  {count === 1 ? "person" : "personer"}:{" "}
                                  {reason}
                                </li>
                              ))}
                          </ul>
                        </div>
                      ) : null
                    }
                  >
                    <Table.DataCell>
                      <strong>{task.task}</strong>
                    </Table.DataCell>
                    <Table.DataCell>
                      <span
                        style={{
                          color:
                            task.successRate >= 0.8
                              ? "var(--ax-status-success)"
                              : task.successRate >= 0.5
                                ? "var(--ax-status-warning)"
                                : "var(--ax-status-danger)",
                          fontWeight: "bold",
                        }}
                      >
                        {task.formattedSuccessRate}
                      </span>
                    </Table.DataCell>
                    <Table.DataCell align="right">
                      {task.totalCount}
                    </Table.DataCell>
                    <Table.DataCell align="right">
                      {task.successCount}
                    </Table.DataCell>
                    <Hide below="md" asChild>
                      <Table.DataCell align="right">
                        {task.partialCount}
                      </Table.DataCell>
                    </Hide>
                    <Hide below="md" asChild>
                      <Table.DataCell align="right">
                        {task.failureCount}
                      </Table.DataCell>
                    </Hide>
                  </Table.ExpandableRow>
                );
              })}
            </Table.Body>
          </Table>
        </Box>
      </DashboardCard>

      <BlockerAnalysis />

      {/* Device breakdown */}
      <DeviceBreakdownSection />
    </>
  );
}
