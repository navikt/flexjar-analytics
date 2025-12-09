import {
  ChatIcon,
  ExclamationmarkTriangleIcon,
  LaptopIcon,
  MobileIcon,
  StarIcon,
  TagIcon,
  XMarkIcon,
} from "@navikt/aksel-icons";
import {
  Button,
  UNSAFE_Combobox as Combobox,
  DatePicker,
  HStack,
  Label,
  Select,
  TextField,
  ToggleGroup,
  Tooltip,
  useDatepicker,
} from "@navikt/ds-react";
import { useEffect, useRef } from "react";
import { useFilterOptions } from "~/lib/useFilterOptions";
import { useSearchParams } from "~/lib/useSearchParams";
import { useSurveysByApp } from "~/lib/useSurveysByApp";
import { useTags } from "~/lib/useTags";
import { getTagLabel } from "./TagEditor";

interface FilterBarProps {
  showTextFilter?: boolean;
}

// Helper to parse date string to Date object
function parseDate(dateStr: string | undefined): Date | undefined {
  if (!dateStr) return undefined;
  const date = new Date(dateStr + "T00:00:00");
  return isNaN(date.getTime()) ? undefined : date;
}

export function FilterBar({ showTextFilter = false }: FilterBarProps) {
  const { params, setParam, resetParams } = useSearchParams();
  // Use separate query for filter options so they don't change when filtering
  const { data: filterOptions } = useFilterOptions();
  const { data: surveysByApp } = useSurveysByApp();
  const { data: allTags = [] } = useTags();

  // Parse current tag filter (comma-separated)
  const selectedTags = params.tags ? params.tags.split(",") : [];

  const {
    datepickerProps: fromDateProps,
    inputProps: fromInputProps,
    setSelected: setFromSelected,
  } = useDatepicker({
    onDateChange: (date) => setParam("from", date?.toISOString().split("T")[0]),
  });

  const {
    datepickerProps: toDateProps,
    inputProps: toInputProps,
    setSelected: setToSelected,
  } = useDatepicker({
    onDateChange: (date) => setParam("to", date?.toISOString().split("T")[0]),
  });

  // Use refs to avoid re-running effects when setSelected changes
  const setFromSelectedRef = useRef(setFromSelected);
  const setToSelectedRef = useRef(setToSelected);
  setFromSelectedRef.current = setFromSelected;
  setToSelectedRef.current = setToSelected;

  // Sync datepickers with URL params (both on mount and when reset)
  useEffect(() => {
    if (params.from) {
      const fromDate = parseDate(params.from);
      if (fromDate) {
        setFromSelectedRef.current(fromDate);
      }
    } else {
      // Reset datepicker when param is cleared
      setFromSelectedRef.current(undefined);
    }
  }, [params.from]);

  useEffect(() => {
    if (params.to) {
      const toDate = parseDate(params.to);
      if (toDate) {
        setToSelectedRef.current(toDate);
      }
    } else {
      // Reset datepicker when param is cleared
      setToSelectedRef.current(undefined);
    }
  }, [params.to]);

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

  const hasActiveFilters =
    params.from ||
    params.to ||
    params.fritekst ||
    params.stjerne ||
    params.feedbackId ||
    params.app ||
    params.lavRating ||
    params.medTekst ||
    params.deviceType ||
    params.tags;

  return (
    <div className="filter-bar-container">
      {/* Rad 1: Hovedfiltre */}
      <div className="filter-bar">
        <Select
          label="App"
          size="small"
          value={params.app || "alle"}
          onChange={(e) =>
            handleAppChange(
              e.target.value === "alle" ? undefined : e.target.value,
            )
          }
        >
          {apps.map((app) => (
            <option key={app} value={app}>
              {app}
            </option>
          ))}
        </Select>

        <Select
          label="Survey"
          size="small"
          value={params.feedbackId || "alle"}
          onChange={(e) =>
            setParam(
              "feedbackId",
              e.target.value === "alle" ? undefined : e.target.value,
            )
          }
        >
          {surveys.map((survey) => (
            <option key={survey} value={survey}>
              {survey}
            </option>
          ))}
        </Select>

        {showTextFilter && allTags.length > 0 && (
          <Combobox
            label="Tags"
            size="small"
            isMultiSelect
            options={allTags.map((tag) => ({
              label: getTagLabel(tag),
              value: tag,
            }))}
            selectedOptions={selectedTags}
            onToggleSelected={(option, isSelected) => {
              const newTags = isSelected
                ? [...selectedTags, option]
                : selectedTags.filter((t) => t !== option);
              setParam("tags", newTags.length > 0 ? newTags.join(",") : undefined);
            }}
            style={{ minWidth: 180 }}
          />
        )}

        <DatePicker {...fromDateProps}>
          <DatePicker.Input {...fromInputProps} label="Fra dato" size="small" />
        </DatePicker>

        <DatePicker {...toDateProps}>
          <DatePicker.Input {...toInputProps} label="Til dato" size="small" />
        </DatePicker>

        {showTextFilter && (
          <TextField
            label="Søk"
            size="small"
            value={params.fritekst || ""}
            onChange={(e) => setParam("fritekst", e.target.value || undefined)}
            placeholder="Søk i tilbakemeldinger..."
          />
        )}

        {hasActiveFilters && (
          <Tooltip content="Nullstill alle filtre">
            <Button
              variant="tertiary"
              size="small"
              icon={<XMarkIcon />}
              onClick={resetParams}
            >
              Nullstill
            </Button>
          </Tooltip>
        )}
      </div>

      {/* Rad 2: Hurtigfiltre */}
      {showTextFilter && (
        <HStack gap="3" align="center" className="filter-toggles">
          <Label
            size="small"
            style={{ color: "var(--ax-text-neutral-subtle)" }}
          >
            Hurtigfiltre:
          </Label>

          <Tooltip content="Vis kun tilbakemeldinger med kommentarer">
            <Button
              variant={params.medTekst === "true" ? "primary" : "secondary"}
              size="small"
              icon={<ChatIcon />}
              onClick={() =>
                setParam(
                  "medTekst",
                  params.medTekst === "true" ? undefined : "true",
                )
              }
            >
              Med tekst
            </Button>
          </Tooltip>

          <Tooltip content="Vis kun tilbakemeldinger med lav score (1-2 stjerner)">
            <Button
              variant={params.lavRating === "true" ? "danger" : "secondary"}
              size="small"
              icon={<ExclamationmarkTriangleIcon />}
              onClick={() =>
                setParam(
                  "lavRating",
                  params.lavRating === "true" ? undefined : "true",
                )
              }
            >
              Wall of Shame
            </Button>
          </Tooltip>

          <Tooltip content="Vis stjernemerkede tilbakemeldinger">
            <Button
              variant={params.stjerne === "true" ? "primary" : "secondary"}
              size="small"
              icon={<StarIcon />}
              onClick={() =>
                setParam(
                  "stjerne",
                  params.stjerne === "true" ? undefined : "true",
                )
              }
            >
              Stjerne
            </Button>
          </Tooltip>

          <div
            style={{
              borderLeft: "1px solid var(--ax-border-neutral-subtle)",
              height: "24px",
              margin: "0 0.25rem",
            }}
          />

          <Label
            size="small"
            style={{ color: "var(--ax-text-neutral-subtle)" }}
          >
            Enhet:
          </Label>
          <ToggleGroup
            size="small"
            value={params.deviceType || "alle"}
            onChange={(val) =>
              setParam("deviceType", val === "alle" ? undefined : val)
            }
          >
            <ToggleGroup.Item value="alle">Alle</ToggleGroup.Item>
            <ToggleGroup.Item value="desktop" icon={<LaptopIcon />} />
            <ToggleGroup.Item value="mobile" icon={<MobileIcon />} />
          </ToggleGroup>
        </HStack>
      )}
    </div>
  );
}
