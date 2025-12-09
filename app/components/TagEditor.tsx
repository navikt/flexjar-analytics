import { PlusIcon, XMarkIcon } from "@navikt/aksel-icons";
import {
  Button,
  Chips,
  UNSAFE_Combobox as Combobox,
  HStack,
  Tooltip,
} from "@navikt/ds-react";
import { useState } from "react";
import { useAddTag, useRemoveTag, useTags } from "~/lib/useTags";

interface TagEditorProps {
  feedbackId: string;
  currentTags: string[];
  compact?: boolean;
}

// Predefined tag suggestions with emoji indicators
const TAG_PRESETS: Record<
  string,
  {
    label: string;
    category: "error" | "success" | "info" | "warning" | "neutral";
  }
> = {
  bug: { label: "🐛 Bug", category: "error" },
  feature: { label: "✨ Feature", category: "info" },
  ux: { label: "🎨 UX", category: "warning" },
  urgent: { label: "🔥 Urgent", category: "error" },
  "good-feedback": { label: "👍 Bra", category: "success" },
  "needs-review": { label: "👀 Trenger review", category: "warning" },
  resolved: { label: "✅ Løst", category: "success" },
  "wont-fix": { label: "🚫 Fikses ikke", category: "neutral" },
};

// Chips only support "neutral" or "action" variants
function getChipsVariant(tag: string): "neutral" | "action" {
  const category = TAG_PRESETS[tag]?.category;
  // Use "action" for important categories, "neutral" for others
  return category === "error" || category === "warning" ? "action" : "neutral";
}

function getTagLabel(tag: string): string {
  return TAG_PRESETS[tag]?.label || tag;
}

export function TagEditor({
  feedbackId,
  currentTags,
  compact = false,
}: TagEditorProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const { data: allTags = [] } = useTags();
  const addTagMutation = useAddTag();
  const removeTagMutation = useRemoveTag();

  // Combine preset tags with existing tags from the system
  const availableTags = [...new Set([...Object.keys(TAG_PRESETS), ...allTags])];
  const suggestedTags = availableTags.filter(
    (tag) => !currentTags.includes(tag),
  );

  const handleAddTag = (tag: string) => {
    if (tag && !currentTags.includes(tag)) {
      addTagMutation.mutate({ feedbackId, tag });
      setInputValue("");
      setIsAdding(false);
    }
  };

  const handleRemoveTag = (tag: string) => {
    removeTagMutation.mutate({ feedbackId, tag });
  };

  if (compact && currentTags.length === 0 && !isAdding) {
    return (
      <Tooltip content="Legg til tag">
        <Button
          variant="tertiary"
          size="xsmall"
          icon={<PlusIcon />}
          onClick={() => setIsAdding(true)}
        />
      </Tooltip>
    );
  }

  return (
    <HStack gap="2" align="center" wrap>
      {/* Existing tags as removable chips */}
      {currentTags.length > 0 && (
        <Chips size="small">
          {currentTags.map((tag) => (
            <Chips.Removable
              key={tag}
              variant={getChipsVariant(tag)}
              onDelete={() => handleRemoveTag(tag)}
            >
              {getTagLabel(tag)}
            </Chips.Removable>
          ))}
        </Chips>
      )}

      {/* Add tag button/input */}
      {isAdding ? (
        <HStack gap="1" align="center">
          <Combobox
            size="small"
            label="Legg til tag"
            hideLabel
            options={suggestedTags.map((tag) => ({
              label: getTagLabel(tag),
              value: tag,
            }))}
            allowNewValues
            value={inputValue}
            onChange={(value) => setInputValue(value || "")}
            onToggleSelected={(option, isSelected) => {
              if (isSelected) {
                handleAddTag(option);
              }
            }}
            style={{ minWidth: 150 }}
          />
          <Button
            variant="tertiary"
            size="xsmall"
            icon={<XMarkIcon />}
            onClick={() => {
              setIsAdding(false);
              setInputValue("");
            }}
          />
        </HStack>
      ) : (
        <Tooltip content="Legg til tag">
          <Button
            variant="tertiary"
            size="xsmall"
            icon={<PlusIcon />}
            onClick={() => setIsAdding(true)}
          >
            {!compact && "Tag"}
          </Button>
        </Tooltip>
      )}
    </HStack>
  );
}

// Simple tag display (read-only)
export function TagDisplay({ tags }: { tags: string[] }) {
  if (!tags || tags.length === 0) return null;

  return (
    <Chips size="small">
      {tags.map((tag) => (
        <Chips.Toggle
          key={tag}
          variant={getChipsVariant(tag)}
          selected={false}
          checkmark={false}
        >
          {getTagLabel(tag)}
        </Chips.Toggle>
      ))}
    </Chips>
  );
}
