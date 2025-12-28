import {
  ChatIcon,
  CheckmarkCircleIcon,
  XMarkOctagonIcon,
} from "@navikt/aksel-icons";
import { Box, Heading, Show, Table } from "@navikt/ds-react";
import { DashboardCard, DashboardGrid } from "~/components/DashboardComponents";
import { TopTasksTimelineChart } from "~/components/charts/TopTasksTimelineChart";
import { useTopTasksStats } from "~/hooks/useTopTasksStats";
import { StatCard } from "./StatsCards";

export function TopTasksOverview() {
  const { data, isLoading } = useTopTasksStats();

  if (isLoading) return null;
  if (!data) return null;

  const total = data.totalSubmissions;
  const totalSuccess = data.tasks.reduce(
    (acc, task) => acc + task.successCount,
    0,
  );
  const successRate = total > 0 ? Math.round((totalSuccess / total) * 100) : 0;

  return (
    <>
      <DashboardGrid
        columns={{ xs: 2, sm: 3 }}
        gap={{ xs: "space-12", md: "space-16" }}
      >
        <StatCard
          icon={<ChatIcon fontSize="1.25rem" aria-hidden />}
          label="Antall svar"
          value={total.toLocaleString("no-NO")}
          subtitle="Totalt"
        />

        <StatCard
          icon={<CheckmarkCircleIcon fontSize="1.25rem" aria-hidden />}
          label="Suksessrate"
          value={`${successRate}%`}
          subtitle="Gjennomsnitt"
        />

        <StatCard
          icon={<XMarkOctagonIcon fontSize="1.25rem" aria-hidden />}
          label="Feilrate"
          value={`${100 - successRate}%`}
          subtitle="Ikke fullført"
        />
      </DashboardGrid>

      <DashboardCard padding={{ xs: "space-16", md: "space-24" }}>
        <Box.New paddingBlock="0 space-16">
          <Heading size="small">Suksessrate over tid</Heading>
        </Box.New>
        <div style={{ height: "clamp(200px, 40vw, 300px)", width: "100%" }}>
          <TopTasksTimelineChart />
        </div>
      </DashboardCard>

      <DashboardCard padding="0" style={{ overflow: "hidden" }}>
        <Box.New
          padding={{ xs: "space-16", md: "space-24" }}
          borderWidth="0 0 1 0"
          borderColor="neutral-subtle"
        >
          <Heading size="small">
            {data.questionText ? `Spørsmål: ${data.questionText}` : "Spørsmål"}
          </Heading>
        </Box.New>
        <Box overflowX="auto">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell />
                <Table.HeaderCell>Svaralternativer</Table.HeaderCell>
                <Table.HeaderCell>Suksessrate</Table.HeaderCell>
                <Table.HeaderCell align="right">Svar</Table.HeaderCell>
                <Table.HeaderCell align="right">Suksess</Table.HeaderCell>
                {/* Hide less critical columns on mobile */}
                <Show above="md">
                  <Table.HeaderCell align="right">Delvis</Table.HeaderCell>
                  <Table.HeaderCell align="right">Feil</Table.HeaderCell>
                </Show>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {data.tasks.map((task) => {
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
                    <Show above="md">
                      <Table.DataCell align="right">
                        {task.partialCount}
                      </Table.DataCell>
                      <Table.DataCell align="right">
                        {task.failureCount}
                      </Table.DataCell>
                    </Show>
                  </Table.ExpandableRow>
                );
              })}
            </Table.Body>
          </Table>
        </Box>
      </DashboardCard>
    </>
  );
}
