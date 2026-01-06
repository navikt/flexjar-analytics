import { XMarkIcon } from "@navikt/aksel-icons";
import { HStack, Tag } from "@navikt/ds-react";
import { useSegmentFilter } from "~/hooks/useSegmentFilter";
import { formatMetadataLabel } from "~/utils/segmentUtils";

/**
 * Displays active segment filters as removable chips.
 * Shows when context.tags filters are applied from SegmentBreakdown clicks.
 */
export function ActiveSegmentFilters() {
  const { activeSegments, removeSegment } = useSegmentFilter();

  if (activeSegments.length === 0) {
    return null;
  }

  const formatSegmentLabel = (segment: string) => {
    const [key, value] = segment.split(":");
    const label = formatMetadataLabel(key);
    return `${label}: ${value}`;
  };

  return (
    <HStack gap="space-8" wrap>
      {activeSegments.map((segment) => (
        <Tag
          key={segment}
          variant="neutral"
          size="small"
          style={{ cursor: "pointer" }}
          onClick={() => removeSegment(segment)}
        >
          <HStack gap="space-4" align="center">
            <span>{formatSegmentLabel(segment)}</span>
            <XMarkIcon aria-hidden fontSize="1rem" />
          </HStack>
        </Tag>
      ))}
    </HStack>
  );
}
