import { Heading, VStack } from "@navikt/ds-react";
import { DashboardCard, DashboardGrid } from "~/components/DashboardComponents";
import { FieldStatsSection } from "~/components/FieldStatsSection";
import { StatsCards } from "~/components/StatsCards";
import { UrgentUrls } from "~/components/UrgentUrls";
import { DeviceBreakdownChart } from "~/components/charts/DeviceBreakdownChart";
import { RatingTrendChart } from "~/components/charts/RatingTrendChart";
import { TimelineChart } from "~/components/charts/TimelineChart";
import { TopAppsChart } from "~/components/charts/TopAppsChart";

interface DefaultDashboardProps {
  hasSurveyFilter: boolean;
}

/**
 * Default Dashboard - for rating, custom, and unfiltered views
 */
export function DefaultDashboard({ hasSurveyFilter }: DefaultDashboardProps) {
  return (
    <>
      <StatsCards showRating />

      {/* Timeline charts */}
      <DashboardGrid columns={{ xs: 1, lg: 2 }}>
        <DashboardCard padding={{ xs: "space-16", md: "space-24" }}>
          <VStack gap="space-16">
            <Heading size="small">Antall tilbakemeldinger</Heading>
            <div
              style={{
                height: "clamp(200px, 40vw, 300px)",
                width: "100%",
              }}
            >
              <TimelineChart />
            </div>
          </VStack>
        </DashboardCard>

        {/* Rating trend chart */}
        <DashboardCard padding={{ xs: "space-16", md: "space-24" }}>
          <VStack gap="space-16">
            <Heading size="small">Gjennomsnittlig vurdering</Heading>
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

      {/* Apps and devices breakdown - only when no survey filter */}
      {!hasSurveyFilter && (
        <DashboardGrid columns={{ xs: 1, md: 2 }}>
          <DashboardCard padding={{ xs: "space-16", md: "space-24" }}>
            <VStack gap="space-16">
              <Heading size="small">Tilbakemeldinger per app</Heading>
              <div
                style={{
                  height: "clamp(150px, 30vw, 200px)",
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
              <div
                style={{
                  height: "clamp(150px, 30vw, 200px)",
                  width: "100%",
                }}
              >
                <DeviceBreakdownChart />
              </div>
            </VStack>
          </DashboardCard>
        </DashboardGrid>
      )}

      {/* Devices when survey is selected - standalone card */}
      {hasSurveyFilter && (
        <DashboardCard padding={{ xs: "space-16", md: "space-24" }}>
          <VStack gap="space-16">
            <Heading size="small">Enheter</Heading>
            <div
              style={{
                height: "clamp(150px, 30vw, 200px)",
                width: "100%",
              }}
            >
              <DeviceBreakdownChart />
            </div>
          </VStack>
        </DashboardCard>
      )}
    </>
  );
}
