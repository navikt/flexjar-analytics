import { HStack, Heading, Tag, VStack } from "@navikt/ds-react";
import { createFileRoute } from "@tanstack/react-router";
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
import { useSearchParams } from "~/lib/useSearchParams";
import { useStats } from "~/lib/useStats";

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

      <main className="main-content">
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
              <div className="dashboard-grid">
                <div className="dashboard-card">
                  <div className="dashboard-card-header">
                    <Heading size="small">Antall tilbakemeldinger</Heading>
                  </div>
                  <div className="chart-container">
                    <TimelineChart />
                  </div>
                </div>

                <div className="dashboard-card">
                  <div className="dashboard-card-header">
                    <Heading size="small">Gjennomsnittlig vurdering</Heading>
                  </div>
                  <div className="chart-container">
                    <RatingTrendChart />
                  </div>
                </div>
              </div>

              <div className="dashboard-grid">
                <UrgentUrls />
              </div>

              {/* Survey-spesifikk statistikk - kun når én survey er valgt */}
              {hasSurveyFilter ? (
                <>
                  <FieldStatsSection />

                  <div className="dashboard-grid">
                    <div className="dashboard-card">
                      <div className="dashboard-card-header">
                        <Heading size="small">Fordeling av vurderinger</Heading>
                      </div>
                      <div className="chart-container">
                        <RatingChart />
                      </div>
                    </div>
                  </div>
                </>
              ) : null}

              {/* Svar per app og enheter - vis kun når ingen survey er valgt */}
              {!hasSurveyFilter && (
                <div className="dashboard-grid">
                  <div className="dashboard-card">
                    <div className="dashboard-card-header">
                      <Heading size="small">Tilbakemeldinger per app</Heading>
                    </div>
                    <div className="chart-container-small">
                      <TopAppsChart />
                    </div>
                  </div>

                  <div className="dashboard-card">
                    <div className="dashboard-card-header">
                      <Heading size="small">Enheter</Heading>
                    </div>
                    <DeviceBreakdownChart />
                  </div>
                </div>
              )}

              {/* Enheter når survey er valgt - vis alene */}
              {hasSurveyFilter && (
                <div className="dashboard-card">
                  <div className="dashboard-card-header">
                    <Heading size="small">Enheter</Heading>
                  </div>
                  <DeviceBreakdownChart />
                </div>
              )}
            </>
          )}
        </VStack>
      </main>
    </>
  );
}
