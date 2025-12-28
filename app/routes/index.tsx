import { Box, HStack, Heading, Tag, VStack } from "@navikt/ds-react";
import { createFileRoute } from "@tanstack/react-router";
import { DashboardCard, DashboardGrid } from "~/components/DashboardComponents";
import { FieldStatsSection } from "~/components/FieldStatsSection";
import { FilterBar } from "~/components/FilterBar";
import { Header } from "~/components/Header";
import { StatsCards } from "~/components/StatsCards";
import { TopTasksOverview } from "~/components/TopTasksOverview";
import { UrgentUrls } from "~/components/UrgentUrls";
import { DeviceBreakdownChart } from "~/components/charts/DeviceBreakdownChart";

import { RatingTrendChart } from "~/components/charts/RatingTrendChart";
import { TimelineChart } from "~/components/charts/TimelineChart";
import { TopAppsChart } from "~/components/charts/TopAppsChart";
import { useSearchParams } from "~/hooks/useSearchParams";
import { useStats } from "~/hooks/useStats";

export const Route = createFileRoute("/")({
  component: DashboardPage,
});

function DashboardPage() {
  const { params } = useSearchParams();
  const { data: stats } = useStats();
  const hasSurveyFilter = !!params.feedbackId;
  const isTopTasks = stats?.surveyType === "topTasks";

  return (
    <>
      <Header />

      <Box
        paddingBlock={{ xs: "space-16", md: "space-24" }}
        paddingInline={{ xs: "space-12", sm: "space-16" }}
        style={{ maxWidth: "1400px", margin: "0 auto" }}
        as="main"
      >
        <VStack gap={{ xs: "space-16", md: "space-24" }}>
          {/* Page header */}
          <HStack justify="space-between" align="center" wrap gap="space-8">
            <HStack align="center" gap={{ xs: "space-8", md: "space-16" }}>
              <Heading size="large">Dashboard</Heading>
              {hasSurveyFilter && stats?.surveyType === "topTasks" && (
                <Tag variant="info" size="small">
                  Top Tasks
                </Tag>
              )}
              {hasSurveyFilter && stats?.surveyType === "rating" && (
                <Tag variant="success" size="small">
                  Vurdering
                </Tag>
              )}
              {hasSurveyFilter && stats?.surveyType === "custom" && (
                <Tag variant="neutral" size="small">
                  Custom
                </Tag>
              )}
            </HStack>
          </HStack>

          <FilterBar />

          {isTopTasks ? (
            <TopTasksOverview />
          ) : (
            <>
              <StatsCards />

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
          )}
        </VStack>
      </Box>
    </>
  );
}
