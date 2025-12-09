import { BarChartIcon, DownloadIcon, TableIcon } from "@navikt/aksel-icons";
import { Alert, Button, HStack, Heading, VStack } from "@navikt/ds-react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { FieldStatsSection } from "~/components/FieldStatsSection";
import { FilterBar } from "~/components/FilterBar";
import { StatsCards } from "~/components/StatsCards";
import { DeviceBreakdownChart } from "~/components/charts/DeviceBreakdownChart";
import { RatingChart } from "~/components/charts/RatingChart";
import { RatingTrendChart } from "~/components/charts/RatingTrendChart";
import { TimelineChart } from "~/components/charts/TimelineChart";
import { TopAppsChart } from "~/components/charts/TopAppsChart";
import { useSearchParams } from "~/lib/useSearchParams";

export const Route = createFileRoute("/")({
  component: DashboardPage,
});

function DashboardPage() {
  const { params, resetParams } = useSearchParams();
  const hasSurveyFilter = !!params.feedbackId;

  const handleResetAndNavigate = () => {
    // Just reset params - we're already on the dashboard
    resetParams();
  };

  return (
    <>
      <header className="app-header">
        <div className="header-content">
          <button
            type="button"
            onClick={handleResetAndNavigate}
            className="header-title"
          >
            <img src="/static/flexjar.png" alt="" className="header-logo" />
            Flexjar Analytics
          </button>
          <HStack gap="4">
            <Button
              variant="tertiary"
              size="small"
              icon={<BarChartIcon />}
              onClick={handleResetAndNavigate}
            >
              Dashboard
            </Button>
            <Link to="/feedback">
              <Button variant="tertiary" size="small" icon={<TableIcon />}>
                Feedback
              </Button>
            </Link>
            <Link to="/export">
              <Button variant="tertiary" size="small" icon={<DownloadIcon />}>
                Eksporter
              </Button>
            </Link>
          </HStack>
        </div>
      </header>

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
