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

  const {
    datepickerProps: fromDateProps,
    inputProps: fromInputProps,
    setSelected: setFromSelected,
  } = useDatepicker({
    onDateChange: (date) =>
      setParam("from", date ? dayjs(date).format("YYYY-MM-DD") : undefined),
  });

  const {
    datepickerProps: toDateProps,
    inputProps: toInputProps,
    setSelected: setToSelected,
  } = useDatepicker({
    onDateChange: (date) =>
      setParam("to", date ? dayjs(date).format("YYYY-MM-DD") : undefined),
  });

  // Use refs to avoid re-running effects when setSelected changes
  const setFromSelectedRef = useRef(setFromSelected);
  const setToSelectedRef = useRef(setToSelected);
  setFromSelectedRef.current = setFromSelected;
  setToSelectedRef.current = setToSelected;

  // Sync datepickers with URL params (both on mount and when reset)
  useEffect(() => {
    if (params.from) {
      const fromDate = dayjs(params.from).toDate();
      if (dayjs(fromDate).isValid()) {
        setFromSelectedRef.current(fromDate);
      }
    } else {
      // Reset datepicker when param is cleared
      setFromSelectedRef.current(undefined);
    }
  }, [params.from]);

  useEffect(() => {
    if (params.to) {
      const toDate = dayjs(params.to).toDate();
      if (dayjs(toDate).isValid()) {
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

  // Calculate selected period for display
  const getSelectedPeriodValue = () => {
    if (!params.from || !params.to) return "";

    const start = dayjs(params.from);
    const end = dayjs(params.to);
    const today = dayjs();

    // Check if end date is today (allow small wiggle room for time)
    if (!end.isSame(today, 'day')) return "";

    // Calculate difference in days (inclusive)
    const diff = end.diff(start, 'day') + 1;

    // Check specific ranges
    if (diff === 1) return "1";
    if (diff === 7) return "7";
    if (diff === 30) return "30";
    if (diff === 90) return "90";

    // Check "Year to date"
    if (start.isSame(today.startOf('year'), 'day')) return "year";

    return "";
  };

  const selectedPeriod = getSelectedPeriodValue();

  const hasActiveFilters =
    ((params.from || params.to) && selectedPeriod !== "30") ||
    params.fritekst ||
    params.feedbackId ||
    params.app ||
    params.lavRating ||
    params.medTekst ||
    params.deviceType ||
    params.ubehandlet ||
    params.tags;

  // Date quick selectors
  const setQuickDate = (days: number | "year") => {
    const end = dayjs();
    let start = dayjs();

    if (days === "year") {
      start = start.startOf("year");
    } else {
      // Subtract days - 1 because the range is inclusive (today + previous days)
      start = start.subtract(days - 1, "day");
    }

    setParam("from", start.format("YYYY-MM-DD"));
    setParam("to", end.format("YYYY-MM-DD"));
  };

  // Set default filters on mount if none are present
  useEffect(() => {
    if (!params.from && !params.to) {
      setQuickDate(30);
    }
  }, []);



  // Reset to default state (Last 30 days)
  const handleReset = () => {
    // We want to clear all params EXCEPT dates, which should be reset to default
    // But since resetParams clears everything, we can just call it and then setQuickDate
    // actually, setQuickDate depends on setParam which updates URL.
    // Better: construct the new params manually.

    resetParams();

    // Slight timeout to let the URL clear propagate/batched, or just set strictly after.
    // Actually, resetParams uses history.pushState.
    // If we want to set defaults immediately:

    // Let's implement a manual reset that sets exactly what we want.
    // We can use setParams to set multiple at once if useSearchParams supported it properly-ish
    // But typically we want to clear key by key or replace the whole search string.
    // resetParams clears the search string.

    // Note: The Effect that checks (!params.from && !params.to) runs on mount or update.
    // If we clear params, that effect MIGHT run if we add params dependencies.
    // currently it has [] dependency.

    // So let's just trigger setQuickDate(30) AFTER reset.
    // But resetParams might be async in terms of React state updates if it depends on them.
    // useSearchParams updates URL synchronously.

    // Force set default dates
    setTimeout(() => setQuickDate(30), 0);
  };

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
            options={allTags}
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

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
          <DatePicker {...fromDateProps}>
            <DatePicker.Input {...fromInputProps} label="Fra dato" size="small" />
          </DatePicker>
          <DatePicker {...toDateProps}>
            <DatePicker.Input {...toInputProps} label="Til dato" size="small" />
          </DatePicker>

          <Select
            label="Periode"
            size="small"
            value={selectedPeriod}
            onChange={(e) => {
              const val = e.target.value;
              if (!val) return;
              if (val === "year") setQuickDate("year");
              else setQuickDate(parseInt(val, 10));
            }}
            style={{ width: '130px' }}
          >
            <option value="">Velg...</option>
            <option value="1">Hittil i dag</option>
            <option value="7">Siste 7 dager</option>
            <option value="30">Siste 30 dager</option>
            <option value="90">Siste 3 mnd</option>
            <option value="year">Hittil i år</option>
          </Select>
        </div>

        {showTextFilter && (
          <TextField
            label="Søk"
            size="small"
            value={params.fritekst || ""}
            onChange={(e) => setParam("fritekst", e.target.value || undefined)}
            placeholder="Søk i tilbakemeldinger..."
            style={{ minWidth: 200 }}
          />
        )}

        {hasActiveFilters && (
          <Tooltip content="Nullstill alle filtre til standard (siste 30 dager)">
            <Button
              variant="tertiary"
              size="small"
              icon={<XMarkIcon />}
              onClick={handleReset}
              type="button"
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

          <Tooltip content="Vis kun ubehandlede (ikke tagget med 'behandlet')">
            <Button
              variant={params.ubehandlet === "true" ? "primary" : "secondary"}
              size="small"
              onClick={() =>
                setParam(
                  "ubehandlet",
                  params.ubehandlet === "true" ? undefined : "true",
                )
              }
              type="button"
            >
              Ubehandlet
            </Button>
          </Tooltip>

          <Tooltip content="Vis kun tilbakemeldinger med tekstsvar">
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
              type="button"
            >
              Med tekst
            </Button>
          </Tooltip>

          <Tooltip content="Vis kun tilbakemeldinger med lav score (1-2)">
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
              type="button"
            >
              Lav score
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
