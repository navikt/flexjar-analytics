import { XMarkIcon } from "@navikt/aksel-icons";
import { HStack, Tag } from "@navikt/ds-react";
import { useSearchParams } from "~/hooks/useSearchParams";
import { useThemes } from "~/hooks/useThemes";

interface FilterChip {
  key: string;
  label: string;
  value: string;
  onRemove: () => void;
}

const DEVICE_LABELS: Record<string, string> = {
  mobile: "Mobil",
  tablet: "Nettbrett",
  desktop: "Desktop",
};

/**
 * Displays active drill-down filters as removable chips.
 * Only shows filters that are NOT already visible in FilterBar.
 *
 * - App/Survey/Period: Already shown in FilterBar → no chip
 * - DeviceType: NOT shown on dashboard → show chip
 * - Pathname: Only set via drill-down → show chip
 * - LavRating: Only on feedback page → show chip on dashboard
 */
export function ActiveFiltersChips() {
  const { params, setParam } = useSearchParams();
  const { themes, isLoading } = useThemes();

  const chips: FilterChip[] = [];

  // Device type filter - NOT shown in FilterBar on dashboard
  if (params.deviceType && params.deviceType !== "alle") {
    chips.push({
      key: "deviceType",
      label: "Enhet",
      value: DEVICE_LABELS[params.deviceType] || params.deviceType,
      onRemove: () => setParam("deviceType", undefined),
    });
  }

  // Pathname filter - only set via drill-down
  if (params.pathname) {
    chips.push({
      key: "pathname",
      label: "Side",
      value: params.pathname,
      onRemove: () => setParam("pathname", undefined),
    });
  }

  // Low rating filter - not shown in dashboard FilterBar
  if (params.lavRating === "true") {
    chips.push({
      key: "lavRating",
      label: "Rating",
      value: "Lav (1-2)",
      onRemove: () => setParam("lavRating", undefined),
    });
  }

  // Theme filter - from discovery drill-down
  // Only show on feedback page where it actually filters results
  const isFeedbackPage =
    typeof window !== "undefined" &&
    window.location.pathname.includes("/feedback");

  if (params.theme && isFeedbackPage) {
    // Look up theme name by ID
    let themeName = "Usortert";

    if (params.theme !== "uncategorized") {
      const matchedTheme = themes.find((t) => t.id === params.theme);
      if (matchedTheme) {
        themeName = matchedTheme.name;
      } else if (isLoading) {
        // Show loading placeholder instead of UUID while fetching
        themeName = "...";
      } else {
        // Fallback to ID if not found and not loading (e.g. deleted theme)
        themeName = params.theme;
      }
    }

    chips.push({
      key: "theme",
      label: "Tema",
      value: themeName,
      onRemove: () => setParam("theme", undefined),
    });
  }

  if (chips.length === 0) {
    return null;
  }

  return (
    <HStack gap="space-8" wrap>
      {chips.map((chip) => (
        <Tag
          key={chip.key}
          variant="neutral"
          size="small"
          style={{ cursor: "pointer", paddingRight: "0.25rem" }}
        >
          <span style={{ marginRight: "0.5rem" }}>
            {chip.label}: {chip.value}
          </span>
          <button
            type="button"
            onClick={chip.onRemove}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0.125rem",
              display: "inline-flex",
              alignItems: "center",
              borderRadius: "2px",
            }}
            aria-label={`Fjern filter ${chip.label}`}
          >
            <XMarkIcon fontSize="1rem" />
          </button>
        </Tag>
      ))}
    </HStack>
  );
}
