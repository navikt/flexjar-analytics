import { ChevronDownIcon } from "@navikt/aksel-icons";
import { ActionMenu, Button, HStack } from "@navikt/ds-react";
import { useContextTags } from "~/hooks/useContextTags";
import { useSegmentFilter } from "~/hooks/useSegmentFilter";
import { formatMetadataLabel, formatMetadataValue } from "~/utils/segmentUtils";

interface ContextTagsFilterProps {
  surveyId: string;
}

/**
 * Compact filter component using ActionMenu dropdowns.
 * One dropdown per context tag for efficient single-select filtering.
 */
export function ContextTagsFilter({ surveyId }: ContextTagsFilterProps) {
  const { activeFilters, addSegment, removeSegment } = useSegmentFilter();
  const { data } = useContextTags(surveyId);

  const contextTags = data?.contextTags || {};
  const hasTags = Object.keys(contextTags).length > 0;

  if (!surveyId || surveyId === "alle" || !hasTags) {
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
      {Object.entries(contextTags).map(([key, values]) => {
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
