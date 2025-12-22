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
import { RatingChart } from "~/components/charts/RatingChart";
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
        paddingBlock="6"
        paddingInline="4"
        style={{ maxWidth: "1400px", margin: "0 auto" }}
        as="main"
      >
        <VStack gap="6">
          <HStack justify="space-between" align="center">
            <HStack align="center" gap="4">
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

              {/* Tidslinje vises alltid - aggregert statistikk gir mening */}
              <DashboardGrid>
                <DashboardCard>
                  <VStack gap="4">
                    <Heading size="small">Antall tilbakemeldinger</Heading>
                    <div style={{ height: "300px", width: "100%" }}>
                      <TimelineChart />
                    </div>
                  </VStack>
                </DashboardCard>

                <DashboardCard>
                  <VStack gap="4">
                    <Heading size="small">Gjennomsnittlig vurdering</Heading>
                    <div style={{ height: "300px", width: "100%" }}>
                      <RatingTrendChart />
                    </div>
                  </VStack>
                </DashboardCard>
              </DashboardGrid>

              <DashboardGrid>
                <UrgentUrls />
              </DashboardGrid>

              {/* Survey-spesifikk statistikk - kun når én survey er valgt */}
              {hasSurveyFilter ? (
                <>
                  <FieldStatsSection />

                  <DashboardGrid>
                    <DashboardCard>
                      <VStack gap="4">
                        <Heading size="small">Fordeling av vurderinger</Heading>
                        <div style={{ height: "300px", width: "100%" }}>
                          <RatingChart />
                        </div>
                      </VStack>
                    </DashboardCard>
                  </DashboardGrid>
                </>
              ) : null}

              {/* Svar per app og enheter - vis kun når ingen survey er valgt */}
              {!hasSurveyFilter && (
                <DashboardGrid>
                  <DashboardCard>
                    <VStack gap="4">
                      <Heading size="small">Tilbakemeldinger per app</Heading>
                      <div style={{ height: "200px", width: "100%" }}>
                        <TopAppsChart />
                      </div>
                    </VStack>
                  </DashboardCard>

                  <DashboardCard>
                    <VStack gap="4">
                      <Heading size="small">Enheter</Heading>
                      <div style={{ height: "200px", width: "100%" }}>
                        <DeviceBreakdownChart />
                      </div>
                    </VStack>
                  </DashboardCard>
                </DashboardGrid>
              )}

              {/* Enheter når survey er valgt - vis alene */}
              {hasSurveyFilter && (
                <DashboardCard>
                  <VStack gap="4">
                    <Heading size="small">Enheter</Heading>
                    <div style={{ height: "200px", width: "100%" }}>
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
