import { BarChartIcon, DownloadIcon, TableIcon } from "@navikt/aksel-icons";
import { Alert, Button, HStack, Heading, VStack } from "@navikt/ds-react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ExportPanel } from "~/components/ExportPanel";
import { FilterBar } from "~/components/FilterBar";
import { useSearchParams } from "~/lib/useSearchParams";

export const Route = createFileRoute("/export")({
  component: ExportPage,
});

function ExportPage() {
  const { resetParams } = useSearchParams();
  const navigate = useNavigate();

  const handleResetAndNavigate = () => {
    resetParams();
    navigate({ to: "/" });
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
            <Link to="/export" className="[&.active]:font-bold">
              <Button variant="tertiary" size="small" icon={<DownloadIcon />}>
                Eksporter
              </Button>
            </Link>
          </HStack>
        </div>
      </header>

      <main className="main-content">
        <VStack gap="6">
          <Heading size="large">Eksporter data</Heading>

          <Alert variant="info">
            Eksporterte data vil automatisk ha sensitiv informasjon fjernet
            (fødselsnummer, e-post, telefonnummer osv.)
          </Alert>

          <FilterBar />

          <ExportPanel />
        </VStack>
      </main>
    </>
  );
}
