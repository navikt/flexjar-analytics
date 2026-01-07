import { VStack } from "@navikt/ds-react";
import { BodyShort, Heading } from "@navikt/ds-react";
import { DashboardCard, DashboardGrid } from "~/components/dashboard";
import { ActiveSegmentFilters } from "~/components/dashboard/ActiveSegmentFilters";
import { SegmentBreakdown } from "~/components/dashboard/SegmentBreakdown";
import { DeviceBreakdownSection } from "~/components/dashboard/sections/FieldStats/DeviceBreakdownSection";
import { StatsCards } from "~/components/dashboard/sections/StatsCards";
import { TimelineSection } from "~/components/dashboard/sections/Timeline";
import { UrgentUrls } from "~/components/dashboard/sections/UrgentUrls";
import { RatingChart } from "~/components/shared/Charts/RatingChart";
import { RatingTrendChart } from "~/components/shared/Charts/RatingTrendChart";
import { TopAppsChart } from "~/components/shared/Charts/TopAppsChart";
import { useSearchParams } from "~/hooks/useSearchParams";
import { useSegmentFilter } from "~/hooks/useSegmentFilter";

interface RatingDashboardProps {
  hasSurveyFilter?: boolean;
}

/**
 * Rating Dashboard - rating chart, trend, top apps
 */
export function RatingDashboard({ hasSurveyFilter }: RatingDashboardProps) {
  const { params } = useSearchParams();
  const { addSegment } = useSegmentFilter();
  const surveyId = params.feedbackId;

  return (
    <>
      <ActiveSegmentFilters />

      <StatsCards showRating />

      <DashboardGrid minColumnWidth="280px">
        <RatingChart />
        <TopAppsChart />
      </DashboardGrid>

      <TimelineSection title="Antall tilbakemeldinger" />

      <DashboardGrid>
        {/* Rating trend chart */}
        <DashboardCard padding={{ xs: "space-12", md: "space-16" }}>
          <VStack gap="space-12">
            <VStack gap="space-4">
              <Heading size="small">Gjennomsnittlig vurdering</Heading>
              <BodyShort size="small" textColor="subtle">
                Kun rating-surveys
              </BodyShort>
            </VStack>
            <div
              style={{
                height: "260px",
                width: "100%",
                overflow: "hidden",
              }}
            >
              <RatingTrendChart />
            </div>
          </VStack>
        </DashboardCard>
      </DashboardGrid>

      {/* Urgent URLs - full width */}
      <UrgentUrls />

      {/* Segment breakdown for survey-specific view */}
      {hasSurveyFilter && surveyId && (
        <SegmentBreakdown surveyId={surveyId} onSegmentClick={addSegment} />
      )}

      {/* Device breakdown - at the bottom for consistency across all dashboards */}
      <DeviceBreakdownSection />
    </>
  );
}
