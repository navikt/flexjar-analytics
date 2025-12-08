import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button, HStack, VStack, Heading } from "@navikt/ds-react";
import { BarChartIcon, TableIcon, DownloadIcon } from "@navikt/aksel-icons";
import { FilterBar } from "~/components/FilterBar";
import { FeedbackTable } from "~/components/FeedbackTable";
import { useSearchParams } from "~/lib/useSearchParams";

export const Route = createFileRoute("/feedback")({
  component: FeedbackPage,
});

function FeedbackPage() {
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
          <button type="button" onClick={handleResetAndNavigate} className="header-title">
            <img src="/static/flexjar.png" alt="" className="header-logo" />
            Flexjar Analytics
          </button>
          <HStack gap="4">
            <Button variant="tertiary" size="small" icon={<BarChartIcon />} onClick={handleResetAndNavigate}>
              Dashboard
            </Button>
            <Link to="/feedback" className="[&.active]:font-bold">
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
          <Heading size="large">Tilbakemeldinger</Heading>
          <FilterBar showTextFilter />
          <FeedbackTable />
        </VStack>
      </main>
    </>
  );
}
