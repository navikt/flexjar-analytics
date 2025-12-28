import { Heading, VStack } from "@navikt/ds-react";
import { createFileRoute } from "@tanstack/react-router";
import { FeedbackTable } from "~/components/FeedbackTable";
import { FilterBar } from "~/components/FilterBar";
import { Header } from "~/components/Header";

export const Route = createFileRoute("/feedback")({
  component: FeedbackPage,
});

function FeedbackPage() {
  return (
    <>
      <Header />

      <main className="main-content">
        <VStack gap="space-24">
          <Heading size="large">Tilbakemeldinger</Heading>
          <FilterBar showDetails />
          <FeedbackTable />
        </VStack>
      </main>
    </>
  );
}
