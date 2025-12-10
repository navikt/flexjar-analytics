import { Alert, Heading, VStack } from "@navikt/ds-react";
import { createFileRoute } from "@tanstack/react-router";
import { ExportPanel } from "~/components/ExportPanel";
import { FilterBar } from "~/components/FilterBar";
import { Header } from "~/components/Header";

export const Route = createFileRoute("/export")({
  component: ExportPage,
});

function ExportPage() {
  return (
    <>
      <Header />

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
