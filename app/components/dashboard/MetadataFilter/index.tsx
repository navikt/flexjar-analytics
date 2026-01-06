import { ChevronDownIcon } from "@navikt/aksel-icons";
import { ActionMenu, Button, HStack } from "@navikt/ds-react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useSegmentFilter } from "~/hooks/useSegmentFilter";
import { fetchMetadataKeysServerFn } from "~/server/actions";
import { formatMetadataLabel, formatMetadataValue } from "~/utils/segmentUtils";

interface MetadataFilterProps {
  surveyId: string;
}

/**
 * Compact filter component using ActionMenu dropdowns.
 * One dropdown per metadata key for efficient single-select filtering.
 */
export function MetadataFilter({ surveyId }: MetadataFilterProps) {
  const { activeFilters, addSegment, removeSegment } = useSegmentFilter();
  const { data } = useQuery({
    queryKey: ["metadataKeys", surveyId],
    queryFn: () => fetchMetadataKeysServerFn({ data: { surveyId } }),
    enabled: !!surveyId && surveyId !== "alle",
    placeholderData: keepPreviousData,
  });

  const metadataKeys = data?.metadataKeys || {};
  const hasMetadata = Object.keys(metadataKeys).length > 0;

  if (!surveyId || surveyId === "alle" || !hasMetadata) {
    return null;
  }

  // Update a single filter value
  const setFilter = (key: string, value: string | undefined) => {
    if (value === undefined || value === "") {
      // Remove filter by finding and removing the segment
      if (activeFilters[key]) {
        removeSegment(`${key}:${activeFilters[key]}`);
      }
    } else {
      // Add new filter (this replaces any existing filter for this key)
      if (activeFilters[key]) {
        removeSegment(`${key}:${activeFilters[key]}`);
      }
      addSegment(key, value);
    }
  };

  return (
    <HStack gap="space-8" wrap>
      {Object.entries(metadataKeys).map(([key, values]) => {
        const label = formatMetadataLabel(key);
        const selectedValue = activeFilters[key];
        const displayValue = selectedValue
          ? `${label}: ${formatMetadataValue(selectedValue)}`
          : label;

        return (
          <ActionMenu key={key}>
            <ActionMenu.Trigger>
              <Button
                variant={
                  selectedValue ? "primary-neutral" : "secondary-neutral"
                }
                size="small"
                icon={<ChevronDownIcon aria-hidden />}
                iconPosition="right"
              >
                {displayValue}
              </Button>
            </ActionMenu.Trigger>
            <ActionMenu.Content>
              <ActionMenu.RadioGroup
                label={label}
                value={selectedValue || ""}
                onValueChange={(val) => setFilter(key, val || undefined)}
              >
                <ActionMenu.RadioItem value="">Alle</ActionMenu.RadioItem>
                {values.map((item) => (
                  <ActionMenu.RadioItem key={item.value} value={item.value}>
                    {formatMetadataValue(item.value)} ({item.count})
                  </ActionMenu.RadioItem>
                ))}
              </ActionMenu.RadioGroup>
            </ActionMenu.Content>
          </ActionMenu>
        );
      })}
    </HStack>
  );
}

/**
 * Hook to filter feedback by segment (metadata) client-side.
 * @deprecated Use useSegmentFilter from ~/hooks/useSegmentFilter instead
 */
export function useMetadataFilter() {
  const { activeFilters, hasFilters } = useSegmentFilter();

  const filterByMetadata = <T extends { metadata?: Record<string, string> }>(
    items: T[],
  ): T[] => {
    if (!hasFilters) return items;

    return items.filter((item) => {
      if (!item.metadata) return false;
      return Object.entries(activeFilters).every(
        ([key, value]) => item.metadata?.[key] === value,
      );
    });
  };

  return { hasFilters, metadataFilters: activeFilters, filterByMetadata };
}
