import { Heading, VStack } from "@navikt/ds-react";
import { DashboardCard, DashboardGrid } from "~/components/dashboard";
import { StatsCards } from "~/components/dashboard/sections/StatsCards";
import { TimelineSection } from "~/components/dashboard/sections/Timeline";
import { DeviceBreakdownChart } from "~/components/shared/Charts/DeviceBreakdownChart";
import { SurveyTypeDistribution } from "~/components/shared/Charts/SurveyTypeDistribution";
import { TopAppsChart } from "~/components/shared/Charts/TopAppsChart";

/**
 * Overview Dashboard - shown when no specific survey is selected.
 * Displays aggregated stats across all surveys.
 */
export function OverviewDashboard() {
  return (
    <>
      <StatsCards showRating />

      {/* Timeline */}
      <TimelineSection title="Antall tilbakemeldinger" />

      {/* Apps, devices, and survey types breakdown */}
      <DashboardGrid columns={{ xs: 1, md: 3 }}>
        <DashboardCard padding={{ xs: "space-16", md: "space-24" }}>
          <VStack gap="space-16">
            <Heading size="small">Tilbakemeldinger per app</Heading>
            <div
              style={{
                height: "clamp(150px, 30vw, 180px)",
                width: "100%",
              }}
            >
              <TopAppsChart />
            </div>
          </VStack>
        </DashboardCard>

        <DashboardCard padding={{ xs: "space-16", md: "space-24" }}>
          <VStack gap="space-16">
            <Heading size="small">Enheter</Heading>
            <div style={{ width: "100%" }}>
              <DeviceBreakdownChart />
            </div>
          </VStack>
        </DashboardCard>

        <DashboardCard padding={{ xs: "space-16", md: "space-24" }}>
          <VStack gap="space-16">
            <Heading size="small">Survey-typer</Heading>
            <SurveyTypeDistribution height={150} />
          </VStack>
        </DashboardCard>
      </DashboardGrid>
    </>
  );
}
