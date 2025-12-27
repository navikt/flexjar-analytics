import {
  ChatIcon,
  ExclamationmarkTriangleIcon,
  LaptopIcon,
  MobileIcon,
  XMarkIcon,
} from "@navikt/aksel-icons";
import {
  Box,
  Button,
  UNSAFE_Combobox as Combobox,
  HGrid,
  HStack,
  Hide,
  Select,
  Show,
  TextField,
  ToggleGroup,
  Tooltip,
  VStack,
} from "@navikt/ds-react";
import dayjs from "dayjs";
import { PeriodSelector } from "~/components/PeriodSelector";
import { getSurveyFeatures } from "~/config/surveyConfig";
import { useFilterOptions } from "~/hooks/useFilterOptions";
import { useSearchParams } from "~/hooks/useSearchParams";
import { useStats } from "~/hooks/useStats";
import { useSurveysByApp } from "~/hooks/useSurveysByApp";
import { useTags } from "~/hooks/useTags";
import { FilterBarSkeleton } from "./FilterBar/FilterBarSkeleton";
import { MetadataFilter } from "./MetadataFilter";

interface FilterBarProps {
  showDetails?: boolean;
}

export function FilterBar({ showDetails = false }: FilterBarProps) {
  const { params, setParam, resetParams } = useSearchParams();
  // Use separate query for filter options so they don't change when filtering
  const { data: filterOptions, isPending: isPendingOptions } =
    useFilterOptions();
  const { data: surveysByApp, isPending: isPendingSurveys } = useSurveysByApp();
  const { data: allTags = [] } = useTags();
  const { data: stats, isPending: isPendingStats } = useStats();

  // Determine active features based on survey type
  const features = getSurveyFeatures(stats?.surveyType);

  // Parse current tag filter (comma-separated)
  const selectedTags = params.tags ? params.tags.split(",") : [];

  // Get available apps (always shows all, not affected by current filters)
  const availableApps = filterOptions?.byApp
    ? Object.keys(filterOptions.byApp)
    : [];
  const apps = ["alle", ...availableApps];

  // Get available surveys - filter by selected app if one is chosen
  const getAvailableSurveys = (): string[] => {
    if (!surveysByApp) return [];

    if (params.app) {
      // Show only surveys for the selected app
      return surveysByApp[params.app] || [];
    }

    // Show all surveys from all apps (deduplicated)
    const allSurveys = new Set<string>();
    for (const surveys of Object.values(surveysByApp)) {
      for (const survey of surveys) {
        allSurveys.add(survey);
      }
    }
    return Array.from(allSurveys);
  };

  const availableSurveys = getAvailableSurveys();
  const surveys = ["alle", ...availableSurveys];

  // Reset feedbackId when app changes and current feedbackId is not available for new app
  const handleAppChange = (newApp: string | undefined) => {
    setParam("app", newApp);

    // If a feedbackId is selected, check if it's valid for the new app
    if (params.feedbackId && surveysByApp) {
      const surveysForApp = newApp ? surveysByApp[newApp] : [];
      if (
        newApp &&
        surveysForApp &&
        !surveysForApp.includes(params.feedbackId)
      ) {
        // Clear feedbackId if it's not available for the new app
        setParam("feedbackId", undefined);
      }
    }
  };

  const handleReset = () => {
    resetParams();
    // Default to last 30 days on reset
    const end = dayjs();
    const start = dayjs().subtract(29, "day");

    setTimeout(() => {
      setParam("from", start.format("YYYY-MM-DD"));
      setParam("to", end.format("YYYY-MM-DD"));
    }, 0);
  };

  const hasActiveFilters =
    params.from ||
    params.to ||
    params.fritekst ||
    params.feedbackId ||
    params.app ||
    params.lavRating ||
    params.medTekst ||
    params.deviceType ||
    params.tags;

  // isPending: no cached data AND fetching (TanStack Query v5 best practice)
  // With placeholderData: keepPreviousData, isPending stays false during refetches
  const isPending = isPendingOptions || isPendingSurveys || isPendingStats;

  if (isPending) {
    return (
      <FilterBarSkeleton
        showDetails={showDetails}
        hasActiveFilters={!!hasActiveFilters}
      />
    );
  }

  return (
    <VStack gap="3" style={{ width: "100%" }}>
      {/* Primary Row: Common Filters (App, Survey, Period) */}
      <Box.New
        padding={{ xs: "3", md: "4" }}
        background="raised"
        borderRadius="large"
        style={{ boxShadow: "var(--ax-shadow-small)", minHeight: "52px" }}
        borderColor="neutral-subtle"
        borderWidth="1"
      >
        {/* Responsive grid: stack on mobile, inline on tablet+ */}
        <HGrid
          columns={{ xs: 1, sm: 2, lg: "1fr 1fr auto auto" }}
          gap={{ xs: "2", md: "3" }}
          align="end"
        >
          <Select
            label="App"
            hideLabel
            size="small"
            value={params.app || "alle"}
            onChange={(e) =>
              handleAppChange(
                e.target.value === "alle" ? undefined : e.target.value,
              )
            }
            style={{ width: "100%" }}
          >
            {apps.map((app) => (
              <option key={app} value={app}>
                {app === "alle" ? "Alle apper" : app}
              </option>
            ))}
          </Select>

          <Select
            label="Survey"
            hideLabel
            size="small"
            value={params.feedbackId || "alle"}
            onChange={(e) =>
              setParam(
                "feedbackId",
                e.target.value === "alle" ? undefined : e.target.value,
              )
            }
            style={{ width: "100%" }}
          >
            {surveys.map((survey) => (
              <option key={survey} value={survey}>
                {survey === "alle" ? "Alle surveys" : survey}
              </option>
            ))}
          </Select>

          {/* Period and reset - visible on lg+ inline, separate row on smaller */}
          <Show above="lg">
            <PeriodSelector />
            {hasActiveFilters && (
              <Tooltip content="Nullstill alle filtre til standard (siste 30 dager)">
                <Button
                  variant="tertiary"
                  size="small"
                  icon={<XMarkIcon aria-hidden />}
                  onClick={handleReset}
                  type="button"
                >
                  Nullstill
                </Button>
              </Tooltip>
            )}
          </Show>
        </HGrid>

        {/* Period and reset on mobile/tablet - shown as separate row */}
        <Hide above="lg">
          <HStack
            gap="2"
            justify="space-between"
            align="center"
            style={{ marginTop: "0.5rem" }}
          >
            <PeriodSelector />
            {hasActiveFilters && (
              <Button
                variant="tertiary"
                size="small"
                icon={<XMarkIcon aria-hidden />}
                onClick={handleReset}
                type="button"
              >
                <Hide below="sm" asChild>
                  <span>Nullstill</span>
                </Hide>
              </Button>
            )}
          </HStack>
        </Hide>
      </Box.New>

      {/* Secondary Row: Page Specific Filters (Feedback only for now) */}
      {showDetails && (
        <Box.New
          paddingInline={{ xs: "3", md: "4" }}
          paddingBlock="3"
          style={{
            background: "var(--ax-bg-default)",
            minHeight: "44px",
          }}
          borderRadius="large"
          borderColor="neutral-subtle"
          borderWidth="1"
        >
          <HStack gap="3" align="center" wrap>
            <HStack gap="2" align="center" wrap>
              {features.showTextFilter && (
                <TextField
                  label="Søk"
                  hideLabel
                  size="small"
                  value={params.fritekst || ""}
                  onChange={(e) =>
                    setParam("fritekst", e.target.value || undefined)
                  }
                  placeholder="Søk i tekst..."
                  style={{ width: "100%", minWidth: 150, maxWidth: 200 }}
                />
              )}

              {features.showTagsFilter && allTags.length > 0 && (
                <Combobox
                  label="Tags"
                  hideLabel
                  size="small"
                  isMultiSelect
                  options={allTags}
                  selectedOptions={selectedTags}
                  onToggleSelected={(option, isSelected) => {
                    const newTags = isSelected
                      ? [...selectedTags, option]
                      : selectedTags.filter((t) => t !== option);
                    setParam(
                      "tags",
                      newTags.length > 0 ? newTags.join(",") : undefined,
                    );
                  }}
                  placeholder="Velg tags..."
                  style={{ width: "100%", minWidth: 150, maxWidth: 200 }}
                />
              )}
            </HStack>

            <HStack gap="2" align="center" wrap>
              {features.showDeviceFilter && (
                <ToggleGroup
                  size="small"
                  value={params.deviceType || "alle"}
                  onChange={(val) =>
                    setParam("deviceType", val === "alle" ? undefined : val)
                  }
                >
                  {/* Show "Alle enheter" text only on md+, just icon on xs/sm */}
                  <ToggleGroup.Item value="alle">
                    <Show above="md">Alle enheter</Show>
                    <Hide above="md">Alle</Hide>
                  </ToggleGroup.Item>
                  <ToggleGroup.Item
                    value="desktop"
                    icon={<LaptopIcon title="Desktop" />}
                  />
                  <ToggleGroup.Item
                    value="mobile"
                    icon={<MobileIcon title="Mobil" />}
                  />
                </ToggleGroup>
              )}

              {/* Divider - hide on small screens */}
              <Hide below="md">
                <div
                  style={{
                    width: "1px",
                    height: "24px",
                    background: "var(--ax-border-neutral-subtle)",
                    margin: "0 0.25rem",
                  }}
                />
              </Hide>

              {features.showTextFilter && (
                <Tooltip content="Vis kun tilbakemeldinger med tekstsvar">
                  <Button
                    variant={
                      params.medTekst === "true" ? "primary" : "secondary"
                    }
                    size="small"
                    icon={<ChatIcon aria-hidden />}
                    onClick={() =>
                      setParam(
                        "medTekst",
                        params.medTekst === "true" ? undefined : "true",
                      )
                    }
                    type="button"
                  >
                    <Hide below="sm" asChild>
                      <span>Med tekst</span>
                    </Hide>
                  </Button>
                </Tooltip>
              )}

              {features.showRatingFilter && (
                <Tooltip content="Vis kun tilbakemeldinger med lav score (1-2)">
                  <Button
                    variant={
                      params.lavRating === "true" ? "danger" : "secondary"
                    }
                    size="small"
                    icon={<ExclamationmarkTriangleIcon aria-hidden />}
                    onClick={() =>
                      setParam(
                        "lavRating",
                        params.lavRating === "true" ? undefined : "true",
                      )
                    }
                    type="button"
                  >
                    <Hide below="sm" asChild>
                      <span>Lav score</span>
                    </Hide>
                  </Button>
                </Tooltip>
              )}
            </HStack>
          </HStack>
        </Box.New>
      )}

      {/* Metadata Filter - shows when a specific survey is selected */}
      {showDetails && params.feedbackId && (
        <MetadataFilter surveyId={params.feedbackId} />
      )}
    </VStack>
  );
}
