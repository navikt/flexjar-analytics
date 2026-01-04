import { BodyShort, Heading, VStack } from "@navikt/ds-react";
import { DashboardCard, DashboardGrid } from "~/components/dashboard";
import { FieldStatsSection } from "~/components/dashboard/sections/FieldStats";
import { DeviceBreakdownSection } from "~/components/dashboard/sections/FieldStats/DeviceBreakdownSection";
import { StatsCards } from "~/components/dashboard/sections/StatsCards";
import { TimelineSection } from "~/components/dashboard/sections/Timeline";
import { UrgentUrls } from "~/components/dashboard/sections/UrgentUrls";
import { DeviceBreakdownChart } from "~/components/shared/Charts/DeviceBreakdownChart";
import { RatingTrendChart } from "~/components/shared/Charts/RatingTrendChart";
import { SurveyTypeDistribution } from "~/components/shared/Charts/SurveyTypeDistribution";
import { TopAppsChart } from "~/components/shared/Charts/TopAppsChart";

interface RatingDashboardProps {
  hasSurveyFilter: boolean;
}

/**
 * Rating Dashboard - for rating, custom, and unfiltered views
 */
export function RatingDashboard({ hasSurveyFilter }: RatingDashboardProps) {
  return (
    <>
      <StatsCards showRating />

      {/* Timeline charts */}
      <DashboardGrid columns={{ xs: 1, lg: 2 }}>
        <TimelineSection title="Antall tilbakemeldinger" />

        {/* Rating trend chart */}
        <DashboardCard padding={{ xs: "space-16", md: "space-24" }}>
          <VStack gap="space-16">
            <VStack gap="space-4">
              <Heading size="small">Gjennomsnittlig vurdering</Heading>
              <BodyShort size="small" textColor="subtle">
                Kun rating-surveys
              </BodyShort>
            </VStack>
            <div
              style={{
                height: "clamp(200px, 40vw, 300px)",
                width: "100%",
              }}
            >
              <RatingTrendChart />
            </div>
          </VStack>
        </DashboardCard>
      </DashboardGrid>

      {/* Urgent URLs - full width */}
      <UrgentUrls />

      {/* Survey-specific statistics - only when a survey is selected */}
      {hasSurveyFilter && <FieldStatsSection />}

      {/* Apps, devices, and survey types breakdown - only when no survey filter */}
      {!hasSurveyFilter && (
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
      )}

      {/* Devices when survey is selected - reusable section component */}
      {hasSurveyFilter && <DeviceBreakdownSection showRating />}
    </>
  );
}
