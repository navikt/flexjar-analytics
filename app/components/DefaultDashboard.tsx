import { BodyShort, Heading, VStack } from "@navikt/ds-react";
import { DashboardCard, DashboardGrid } from "~/components/DashboardComponents";
import { DeviceBreakdownSection } from "~/components/DeviceBreakdownSection";
import { FieldStatsSection } from "~/components/FieldStatsSection";
import { StatsCards } from "~/components/StatsCards";
import { TimelineSection } from "~/components/TimelineSection";
import { UrgentUrls } from "~/components/UrgentUrls";
import { DeviceBreakdownChart } from "~/components/charts/DeviceBreakdownChart";
import { RatingTrendChart } from "~/components/charts/RatingTrendChart";
import { SurveyTypeDistribution } from "~/components/charts/SurveyTypeDistribution";
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
