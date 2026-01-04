import { Box, Chips, Label, VStack } from "@navikt/ds-react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "~/hooks/useSearchParams";
import { fetchMetadataKeysServerFn } from "~/server/actions";

interface MetadataFilterProps {
  surveyId: string;
}

/**
 * Dynamic filter component that shows available metadata keys/values for a survey.
 * Filters are applied client-side by updating URL params.
 */
export function MetadataFilter({ surveyId }: MetadataFilterProps) {
  const { params, setParam } = useSearchParams();
  const { data } = useQuery({
    queryKey: ["metadataKeys", surveyId],
    queryFn: () => fetchMetadataKeysServerFn({ data: { surveyId } }),
    enabled: !!surveyId && surveyId !== "alle",
    placeholderData: keepPreviousData,
  });

  // Parse current metadata filters from URL
  const getActiveFilters = (): Record<string, string> => {
    const filters: Record<string, string> = {};
    for (const [key, value] of Object.entries(params)) {
      if (key.startsWith("meta.") && value) {
        filters[key.replace("meta.", "")] = value;
      }
    }
    return filters;
  };

  const activeFilters = getActiveFilters();
  const metadataKeys = data?.metadataKeys || {};
  const hasMetadata = Object.keys(metadataKeys).length > 0;

  if (!surveyId || surveyId === "alle") {
    return null;
  }

  if (!hasMetadata) {
    return null;
  }

  return (
    <Box.New
      padding="space-12"
      background="raised"
      borderRadius="medium"
      borderColor="neutral-subtle"
      borderWidth="1"
    >
      <VStack gap="space-12">
        {Object.entries(metadataKeys).map(([key, values]) => (
          <VStack key={key} gap="space-4">
            <Label size="small">{formatMetadataKey(key)}</Label>
            <Chips>
              <Chips.Toggle
                selected={!activeFilters[key]}
                onClick={() => setParam(`meta.${key}` as "page", undefined)}
              >
                Alle
              </Chips.Toggle>
              {values.map((value) => (
                <Chips.Toggle
                  key={value}
                  selected={activeFilters[key] === value}
                  onClick={() =>
                    setParam(
                      `meta.${key}` as "page",
                      activeFilters[key] === value ? undefined : value,
                    )
                  }
                >
                  {formatMetadataValue(value)}
                </Chips.Toggle>
              ))}
            </Chips>
          </VStack>
        ))}
      </VStack>
    </Box.New>
  );
}

/**
 * Hook to filter feedback by metadata client-side.
 * Returns a filter function that can be used with Array.filter()
 */
export function useMetadataFilter() {
  const { params } = useSearchParams();

  // Extract metadata filters from URL params
  const metadataFilters: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (key.startsWith("meta.") && value) {
      metadataFilters[key.replace("meta.", "")] = value;
    }
  }

  const hasFilters = Object.keys(metadataFilters).length > 0;

  // Filter function to apply to feedback items
  const filterByMetadata = <T extends { metadata?: Record<string, string> }>(
    items: T[],
  ): T[] => {
    if (!hasFilters) return items;

    return items.filter((item) => {
      if (!item.metadata) return false;

      return Object.entries(metadataFilters).every(([key, value]) => {
        return item.metadata?.[key] === value;
      });
    });
  };

  return {
    hasFilters,
    metadataFilters,
    filterByMetadata,
  };
}

// Helper to format camelCase key to readable label
function formatMetadataKey(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

// Helper to format boolean-like values
function formatMetadataValue(value: string): string {
  if (value === "true") return "Ja";
  if (value === "false") return "Nei";
  return value.charAt(0).toUpperCase() + value.slice(1);
}
