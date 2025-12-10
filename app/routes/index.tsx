import { Alert, HStack, Heading, VStack } from "@navikt/ds-react";
import { createFileRoute } from "@tanstack/react-router";
import { FieldStatsSection } from "~/components/FieldStatsSection";
import { FilterBar } from "~/components/FilterBar";
import { Header } from "~/components/Header";
import { StatsCards } from "~/components/StatsCards";
import { DeviceBreakdownChart } from "~/components/charts/DeviceBreakdownChart";
import { RatingChart } from "~/components/charts/RatingChart";
import { RatingTrendChart } from "~/components/charts/RatingTrendChart";
import { TimelineChart } from "~/components/charts/TimelineChart";
import { TopAppsChart } from "~/components/charts/TopAppsChart";
import { UrgentUrls } from "~/components/UrgentUrls";
import { useSearchParams } from "~/lib/useSearchParams";

export const Route = createFileRoute("/")({
  component: DashboardPage,
});

function DashboardPage() {
  const { params } = useSearchParams();
  const hasSurveyFilter = !!params.feedbackId;

  return (
    <>
      <Header />

      <main className="main-content">
        <VStack gap="6">
          <HStack justify="space-between" align="center">
            <Heading size="large">Dashboard</Heading>
          </HStack>

          <FilterBar />

          {!hasSurveyFilter && (
            <Alert variant="info" size="small">
              Velg en spesifikk survey for å se detaljert statistikk per
              spørsmål
            </Alert>
          )}

          <StatsCards />

          {/* Tidslinje vises alltid - aggregert statistikk gir mening */}
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <Heading size="small">Tilbakemeldinger over tid</Heading>
              </div>
              <div className="chart-container">
                <TimelineChart />
              </div>
            </div>

            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <Heading size="small">Rating over tid</Heading>
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
                    <Heading size="small">Vurderingsfordeling</Heading>
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
                  <Heading size="small">Svar per app</Heading>
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
        </VStack>
      </main>
    </>
  );
}
