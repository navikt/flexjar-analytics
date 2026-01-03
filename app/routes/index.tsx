import { Box, HStack, Heading, Tag, Tooltip, VStack } from "@navikt/ds-react";
import type { TagProps } from "@navikt/ds-react";
import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ActiveFiltersChips } from "~/components/ActiveFiltersChips";
import { DefaultDashboard } from "~/components/DefaultDashboard";
import { DiscoveryDashboard } from "~/components/DiscoveryDashboard";
import { FilterBar } from "~/components/FilterBar";
import { Header } from "~/components/Header";
import { PrivacyMaskedNotice } from "~/components/PrivacyMaskedNotice";
import { TaskPriorityDashboard } from "~/components/TaskPriorityDashboard";
import { TopTasksOverview } from "~/components/TopTasksOverview";
import { useSearchParams } from "~/hooks/useSearchParams";
import { useStats } from "~/hooks/useStats";
import type { SurveyType } from "~/types/api";

/**
 * Survey type descriptions - educates users about each methodology
 */
const SURVEY_DESCRIPTIONS: Record<SurveyType, string> = {
  rating:
    "Måler brukertilfredshet og sentiment. Brukes for å ta pulsen på løsningen over tid.",
  topTasks:
    "Måler suksessraten på brukernes kjerneoppgaver. Brukes for å finne tekniske eller designmessige hindringer.",
  taskPriority:
    "Lar brukerne stemme på hva som er viktigst for dem. Brukes strategisk for å prioritere utvikling ('Long Neck').",
  discovery:
    "Åpne spørsmål for å avdekke ukjente behov. Brukes i utforskningsfasen for å finne 'unknown unknowns'.",
  custom:
    "Egendefinert undersøkelse med fritt valg av spørsmålstyper. Brukes når standardtypene ikke dekker behovet.",
};

/**
 * Survey type configuration - centralizes labels, variants, and dashboards
 */
const SURVEY_CONFIG: Record<
  SurveyType,
  {
    label: string;
    variant: TagProps["variant"];
    dashboard: (hasSurveyFilter: boolean) => ReactNode;
  }
> = {
  topTasks: {
    label: "Top Tasks",
    variant: "info",
    dashboard: () => <TopTasksOverview />,
  },
  rating: {
    label: "Vurdering",
    variant: "success",
    dashboard: (hasSurveyFilter) => (
      <DefaultDashboard hasSurveyFilter={hasSurveyFilter} />
    ),
  },
  discovery: {
    label: "Discovery",
    variant: "warning",
    dashboard: () => <DiscoveryDashboard />,
  },
  taskPriority: {
    label: "Task Priority",
    variant: "alt1",
    dashboard: () => <TaskPriorityDashboard />,
  },
  custom: {
    label: "Custom",
    variant: "neutral",
    dashboard: (hasSurveyFilter) => (
      <DefaultDashboard hasSurveyFilter={hasSurveyFilter} />
    ),
  },
};

export const Route = createFileRoute("/")({
  component: DashboardPage,
});

function DashboardPage() {
  const { params } = useSearchParams();
  const { data: stats, isPending } = useStats();
  const hasSurveyFilter = !!params.feedbackId;
  const surveyType = stats?.surveyType;
  const isPrivacyMasked = stats?.privacy?.masked;

  const config = surveyType ? SURVEY_CONFIG[surveyType] : null;

  // Show generic skeleton during initial load when a survey is selected
  // This prevents showing the wrong dashboard type before we know the surveyType
  const showInitialSkeleton = hasSurveyFilter && isPending && !stats;

  // Render dashboard content based on privacy and survey type
  const renderDashboardContent = () => {
    if (showInitialSkeleton) return null;

    // Show privacy notice if data is masked
    if (isPrivacyMasked && stats?.privacy) {
      return <PrivacyMaskedNotice privacy={stats.privacy} />;
    }

    if (config) {
      return config.dashboard(hasSurveyFilter);
    }

    return <DefaultDashboard hasSurveyFilter={hasSurveyFilter} />;
  };

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
              {hasSurveyFilter && config && surveyType && (
                <Tooltip content={SURVEY_DESCRIPTIONS[surveyType]}>
                  <Tag
                    variant={config.variant}
                    size="small"
                    style={{ cursor: "help" }}
                  >
                    {config.label}
                  </Tag>
                </Tooltip>
              )}
            </HStack>
          </HStack>

          <FilterBar />

          {/* Active drill-down filters (global) */}
          <ActiveFiltersChips />

          {/* Type-specific dashboard view */}
          {renderDashboardContent()}
        </VStack>
      </Box>
    </>
  );
}
