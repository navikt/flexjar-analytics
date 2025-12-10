import dayjs from "dayjs";
import {
  ChatIcon,
  ExclamationmarkTriangleIcon,
  LaptopIcon,
  MobileIcon,
  XMarkIcon,
} from "@navikt/aksel-icons";
import {
  Button,
  UNSAFE_Combobox as Combobox,
  Select,
  TextField,
  ToggleGroup,
  Tooltip,
} from "@navikt/ds-react";
import { PeriodSelector } from "~/components/PeriodSelector";
import { useFilterOptions } from "~/lib/useFilterOptions";
import { useSearchParams } from "~/lib/useSearchParams";
import { useSurveysByApp } from "~/lib/useSurveysByApp";
import { useTags } from "~/lib/useTags";

interface FilterBarProps {
  showTextFilter?: boolean;
}

export function FilterBar({ showTextFilter = false }: FilterBarProps) {
  const { params, setParam, resetParams } = useSearchParams();
  // Use separate query for filter options so they don't change when filtering
  const { data: filterOptions } = useFilterOptions();
  const { data: surveysByApp } = useSurveysByApp();
  const { data: allTags = [] } = useTags();

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
    Object.values(surveysByApp).forEach((surveys) => {
      surveys.forEach((survey) => allSurveys.add(survey));
    });
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

    // We need to use history.pushState or similar if we want to batch this, 
    // but resetParams uses it too. 
    // To simplify: we rely on PeriodSelector to show "Velg periode" or similar if params are empty.
    // BUT the requirement was to set "Siste 30 dager" as default.
    // Let's manually set it after a timeout or use a dedicated reset function.
    setTimeout(() => {
      setParam("from", start.format("YYYY-MM-DD"));
      setParam("to", end.format("YYYY-MM-DD"));
    }, 0);
  };

  // Check if we active filters (excluding default 30 days if we consider that default, 
  // but originally 30 days was 'default' and resetting set to it.

  // Actually, we can check if params are present.
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

  return (
    <div className="filter-bar-container">
      {/* Primary Row: Common Filters (App, Survey, Period) */}
      <div className="filter-bar">
        <Select
          label="App"
          size="small"
          hideLabel
          value={params.app || "alle"}
          onChange={(e) =>
            handleAppChange(
              e.target.value === "alle" ? undefined : e.target.value,
            )
          }
          style={{ width: "200px" }}
        >
          {apps.map((app) => (
            <option key={app} value={app}>
              {app === "alle" ? "Alle apper" : app}
            </option>
          ))}
        </Select>

        <Select
          label="Survey"
          size="small"
          hideLabel
          value={params.feedbackId || "alle"}
          onChange={(e) =>
            setParam(
              "feedbackId",
              e.target.value === "alle" ? undefined : e.target.value,
            )
          }
          style={{ maxWidth: "250px" }}
        >
          {surveys.map((survey) => (
            <option key={survey} value={survey}>
              {survey === "alle" ? "Alle surveys" : survey}
            </option>
          ))}
        </Select>

        <div style={{ flex: 1 }} />

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
      </div>

      {/* Secondary Row: Page Specific Filters (Feedback only for now) */}
      {showTextFilter && (
        <div className="filter-bar-secondary">
          <div className="filter-group">
            {showTextFilter && (
              <TextField
                label="Søk"
                hideLabel
                size="small"
                value={params.fritekst || ""}
                onChange={(e) => setParam("fritekst", e.target.value || undefined)}
                placeholder="Søk i tekst..."
                style={{ width: 200 }}
              />
            )}

            {showTextFilter && allTags.length > 0 && (
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
                  setParam("tags", newTags.length > 0 ? newTags.join(",") : undefined);
                }}
                placeholder="Velg tags..."
                style={{ width: 200 }}
              />
            )}
          </div>

          <div className="filter-group">
            <ToggleGroup
              size="small"
              value={params.deviceType || "alle"}
              onChange={(val) =>
                setParam("deviceType", val === "alle" ? undefined : val)
              }
            >
              <ToggleGroup.Item value="alle">Alle enheter</ToggleGroup.Item>
              <ToggleGroup.Item value="desktop" icon={<LaptopIcon title="Desktop" />} />
              <ToggleGroup.Item value="mobile" icon={<MobileIcon title="Mobil" />} />
            </ToggleGroup>

            <div className="filter-divider" />

            <Tooltip content="Vis kun tilbakemeldinger med tekstsvar">
              <Button
                variant={params.medTekst === "true" ? "primary" : "secondary"}
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
                Med tekst
              </Button>
            </Tooltip>

            <Tooltip content="Vis kun tilbakemeldinger med lav score (1-2)">
              <Button
                variant={params.lavRating === "true" ? "danger" : "secondary"}
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
                Lav score
              </Button>
            </Tooltip>
          </div>
        </div>
      )}
    </div>
  );
}
