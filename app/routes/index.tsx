import { Box, HStack, Heading, Tag, VStack } from "@navikt/ds-react";
import type { TagProps } from "@navikt/ds-react";
import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { DefaultDashboard } from "~/components/DefaultDashboard";
import { DiscoveryDashboard } from "~/components/DiscoveryDashboard";
import { FilterBar } from "~/components/FilterBar";
import { Header } from "~/components/Header";
import { TaskPriorityDashboard } from "~/components/TaskPriorityDashboard";
import { TopTasksOverview } from "~/components/TopTasksOverview";
import { useSearchParams } from "~/hooks/useSearchParams";
import { useStats } from "~/hooks/useStats";
import type { SurveyType } from "~/types/api";

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
  const { data: stats } = useStats();
  const hasSurveyFilter = !!params.feedbackId;
  const surveyType = stats?.surveyType;

  const config = surveyType ? SURVEY_CONFIG[surveyType] : null;

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
              {hasSurveyFilter && config && (
                <Tag variant={config.variant} size="small">
                  {config.label}
                </Tag>
              )}
            </HStack>
          </HStack>

          <FilterBar />

          {/* Type-specific dashboard view */}
          {config ? (
            config.dashboard(hasSurveyFilter)
          ) : (
            <DefaultDashboard hasSurveyFilter={hasSurveyFilter} />
          )}
        </VStack>
      </Box>
    </>
  );
}
