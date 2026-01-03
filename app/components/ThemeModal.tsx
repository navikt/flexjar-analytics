import { PlusIcon, TrashIcon } from "@navikt/aksel-icons";
import {
  BodyShort,
  Button,
  Chips,
  HStack,
  Label,
  Modal,
  TextField,
  VStack,
} from "@navikt/ds-react";
import { useState } from "react";
import type {
  CreateThemeInput,
  TextTheme,
  UpdateThemeInput,
} from "~/types/api";

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: CreateThemeInput | (UpdateThemeInput & { themeId: string }),
  ) => void;
  onDelete?: (themeId: string) => void;
  isSubmitting?: boolean;
  /** If provided, we're editing. Otherwise creating. */
  theme?: TextTheme;
  /** Pre-fill keywords (e.g., from word cloud click) */
  initialKeywords?: string[];
}

// Preset colors for themes
const THEME_COLORS = [
  "#3b82f6", // blue
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#84cc16", // lime
];

/**
 * Modal for creating or editing a text theme.
 * Supports keyword management with chips.
 */
export function ThemeModal({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  isSubmitting = false,
  theme,
  initialKeywords = [],
}: ThemeModalProps) {
  const isEditing = !!theme;

  const [name, setName] = useState(theme?.name ?? "");
  const [keywords, setKeywords] = useState<string[]>(
    theme?.keywords ?? initialKeywords,
  );
  const [keywordInput, setKeywordInput] = useState("");
  const [color, setColor] = useState(theme?.color ?? THEME_COLORS[0]);
  const [priority, setPriority] = useState(theme?.priority ?? 0);
  const [errors, setErrors] = useState<{ name?: string; keywords?: string }>(
    {},
  );
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleAddKeyword = () => {
    const trimmed = keywordInput.trim().toLowerCase();
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords([...keywords, trimmed]);
      setKeywordInput("");
      setErrors((e) => ({ ...e, keywords: undefined }));
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  const validate = (): boolean => {
    const newErrors: { name?: string; keywords?: string } = {};

    if (!name.trim()) {
      newErrors.name = "Tema-navn er påkrevd";
    }
    if (keywords.length === 0) {
      newErrors.keywords = "Minst ett nøkkelord er påkrevd";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    if (isEditing && theme) {
      onSubmit({
        themeId: theme.id,
        name: name !== theme.name ? name : undefined,
        keywords:
          JSON.stringify(keywords) !== JSON.stringify(theme.keywords)
            ? keywords
            : undefined,
        color: color !== theme.color ? color : undefined,
        priority: priority !== theme.priority ? priority : undefined,
      });
    } else {
      onSubmit({
        name,
        keywords,
        color,
        priority,
      });
    }
  };

  const handleDelete = () => {
    if (theme && onDelete) {
      if (confirmDelete) {
        onDelete(theme.id);
      } else {
        setConfirmDelete(true);
      }
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={() => {
        setConfirmDelete(false);
        onClose();
      }}
      header={{
        heading: isEditing ? "Rediger tema" : "Opprett nytt tema",
        closeButton: true,
      }}
      width="medium"
    >
      <Modal.Body>
        <VStack gap="space-24">
          <TextField
            label="Tema-navn"
            description="Et beskrivende navn for temaet"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErrors((e) => ({ ...e, name: undefined }));
            }}
            error={errors.name}
            autoFocus
          />

          <div>
            <Label>Nøkkelord</Label>
            <BodyShort
              size="small"
              textColor="subtle"
              style={{ marginBottom: "0.5rem" }}
            >
              Tekster som inneholder disse ordene blir gruppert under dette
              temaet
            </BodyShort>

            <HStack gap="space-8" style={{ marginBottom: "0.5rem" }}>
              <TextField
                label=""
                hideLabel
                placeholder="Skriv et nøkkelord..."
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{ flex: 1 }}
              />
              <Button
                variant="secondary"
                size="small"
                icon={<PlusIcon aria-hidden />}
                onClick={handleAddKeyword}
              >
                Legg til
              </Button>
            </HStack>

            {errors.keywords && (
              <BodyShort
                size="small"
                style={{ color: "var(--ax-text-danger)" }}
              >
                {errors.keywords}
              </BodyShort>
            )}

            {keywords.length > 0 && (
              <Chips style={{ marginTop: "0.5rem" }}>
                {keywords.map((keyword) => (
                  <Chips.Removable
                    key={keyword}
                    onDelete={() => handleRemoveKeyword(keyword)}
                  >
                    {keyword}
                  </Chips.Removable>
                ))}
              </Chips>
            )}
          </div>

          <div>
            <Label>Farge</Label>
            <HStack gap="space-8" style={{ marginTop: "0.5rem" }}>
              {THEME_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{
                    width: "2rem",
                    height: "2rem",
                    borderRadius: "4px",
                    backgroundColor: c,
                    border:
                      color === c
                        ? "3px solid var(--ax-border-focus)"
                        : "1px solid var(--ax-border-divider)",
                    cursor: "pointer",
                  }}
                  aria-label={`Velg farge ${c}`}
                />
              ))}
            </HStack>
          </div>

          <TextField
            label="Prioritet"
            description="Høyere tall = matcher først om teksten inneholder flere temaer"
            type="number"
            value={priority.toString()}
            onChange={(e) => setPriority(Number.parseInt(e.target.value) || 0)}
          />
        </VStack>
      </Modal.Body>

      <Modal.Footer>
        <HStack
          justify="space-between"
          align="center"
          style={{ width: "100%" }}
        >
          <HStack gap="space-12">
            <Button onClick={handleSubmit} loading={isSubmitting}>
              {isEditing ? "Lagre endringer" : "Opprett tema"}
            </Button>
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Avbryt
            </Button>
          </HStack>

          {isEditing && onDelete && (
            <Button
              variant="danger"
              size="small"
              icon={<TrashIcon aria-hidden />}
              onClick={handleDelete}
              loading={isSubmitting}
            >
              {confirmDelete ? "Bekreft sletting" : "Slett tema"}
            </Button>
          )}
        </HStack>
      </Modal.Footer>
    </Modal>
  );
}
