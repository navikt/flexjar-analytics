import {
  InformationSquareIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
} from "@navikt/aksel-icons";
import {
  BodyShort,
  Box,
  Button,
  HStack,
  Heading,
  Tag,
  Tooltip,
  VStack,
} from "@navikt/ds-react";
import { useCallback, useState } from "react";
import { DashboardCard } from "~/components/DashboardComponents";
import { type ContextExample, ThemeModal } from "~/components/ThemeModal";
import { WordPopover } from "~/components/WordPopover";
import { useThemes } from "~/hooks/useThemes";
import type {
  CreateThemeInput,
  DiscoveryResponse,
  DiscoveryTheme,
  TextTheme,
  UpdateThemeInput,
} from "~/types/api";

interface DiscoveryAnalysisProps {
  data: DiscoveryResponse;
}

/**
 * Analyzes Discovery survey responses to identify common tasks and themes.
 * Shows word frequency cloud, theme clustering, and recent responses.
 */
export function DiscoveryAnalysis({ data }: DiscoveryAnalysisProps) {
  const { wordFrequency, themes, recentResponses, totalSubmissions } = data;

  // Theme management state
  const {
    themes: definedThemes,
    createTheme,
    updateTheme,
    deleteTheme,
    isCreating,
    isUpdating,
  } = useThemes();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<TextTheme | undefined>();
  const [initialKeywords, setInitialKeywords] = useState<string[]>([]);

  // Popover state for categorized words
  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null);
  const [popoverWord, setPopoverWord] = useState<string>("");
  const [popoverTheme, setPopoverTheme] = useState<TextTheme | null>(null);

  // Open modal for creating new theme
  const handleOpenCreate = useCallback((keyword?: string) => {
    setEditingTheme(undefined);
    setInitialKeywords(keyword ? [keyword] : []);
    setIsModalOpen(true);
  }, []);

  // Open modal for editing existing theme
  const handleOpenEdit = useCallback((theme: TextTheme) => {
    setEditingTheme(theme);
    setInitialKeywords([]);
    setIsModalOpen(true);
    // Close popover if open
    setPopoverAnchor(null);
  }, []);

  // Handle modal submit
  const handleSubmit = useCallback(
    (data: CreateThemeInput | (UpdateThemeInput & { themeId: string })) => {
      if ("themeId" in data) {
        updateTheme(data, {
          onSuccess: () => setIsModalOpen(false),
        });
      } else {
        createTheme(data, {
          onSuccess: () => setIsModalOpen(false),
        });
      }
    },
    [createTheme, updateTheme],
  );

  // Handle delete
  const handleDelete = useCallback(
    (themeId: string) => {
      deleteTheme(themeId, {
        onSuccess: () => setIsModalOpen(false),
      });
    },
    [deleteTheme],
  );

  // Get context examples for the selected word (for Peek Context)
  const getContextExamples = useCallback(
    (word: string): ContextExample[] => {
      if (!word) return [];
      const wordLower = word.toLowerCase();
      return recentResponses
        .filter((r) => r.task.toLowerCase().includes(wordLower))
        .map((r) => ({ text: r.task, submittedAt: r.submittedAt }));
    },
    [recentResponses],
  );

  // Combine defined themes with stats
  const allThemesDisplay = definedThemes.map((definedTheme) => {
    const stats = themes.find((t) => t.theme === definedTheme.name);
    return {
      theme: definedTheme.name,
      // Use stats if available, otherwise defaults
      count: stats?.count ?? 0,
      successRate: stats?.successRate ?? 0,
      examples: stats?.examples ?? [],
      // Keep reference to the defined theme object for editing
      definedTheme: definedTheme as TextTheme | undefined,
    };
  });

  // Also include themes from stats that might not be in definedThemes (e.g. "Annet" or deleted timestamps)
  // mostly "Annet" which shouldn't be editable usually, but good to show
  for (const statTheme of themes) {
    if (!definedThemes.some((dt) => dt.name === statTheme.theme)) {
      allThemesDisplay.push({
        theme: statTheme.theme,
        count: statTheme.count,
        successRate: statTheme.successRate,
        examples: statTheme.examples,
        definedTheme: undefined,
      });
    }
  }

  // Sort by count (descending), then by name
  // Sort by count (descending), then by name, but keep "Annet" at the bottom
  allThemesDisplay.sort((a, b) => {
    // Always put "Annet" at the bottom
    if (a.theme === "Annet") return 1;
    if (b.theme === "Annet") return -1;

    if (b.count !== a.count) return b.count - a.count;
    // Guard against undefined names (e.g. from corrupted state)
    const nameA = a.theme || "";
    const nameB = b.theme || "";
    return nameA.localeCompare(nameB);
  });

  // Handle word click from word cloud
  const handleWordClick = useCallback(
    (word: string, event: React.MouseEvent<HTMLButtonElement>) => {
      // Check if word belongs to an existing theme
      const existingTheme = definedThemes.find((t) =>
        t.keywords.some((k) => k.toLowerCase() === word.toLowerCase()),
      );

      if (existingTheme) {
        // Show popover for categorized words
        setPopoverWord(word);
        setPopoverTheme(existingTheme);
        setPopoverAnchor(event.currentTarget);
      } else {
        handleOpenCreate(word);
      }
    },
    [definedThemes, handleOpenCreate],
  );

  // Handle removing word from theme (via popover)
  const handleRemoveWord = useCallback(
    (themeId: string, word: string) => {
      const theme = definedThemes.find((t) => t.id === themeId);
      if (!theme) return;

      const updatedKeywords = theme.keywords.filter(
        (k) => k.toLowerCase() !== word.toLowerCase(),
      );
      updateTheme({ themeId, keywords: updatedKeywords });
    },
    [definedThemes, updateTheme],
  );

  // Get theme for a word (for coloring)
  const getThemeForWord = useCallback(
    (word: string): TextTheme | undefined => {
      return definedThemes.find((t) =>
        t.keywords.some((k) => k.toLowerCase() === word.toLowerCase()),
      );
    },
    [definedThemes],
  );

  if (totalSubmissions === 0 && definedThemes.length === 0) {
    return (
      <DashboardCard>
        <BodyShort textColor="subtle">
          Ingen discovery-data tilgjengelig ennå. Data vises når brukere
          begynner å svare på discovery-surveyen.
        </BodyShort>
        <Button
          variant="secondary"
          size="small"
          icon={<PlusIcon aria-hidden />}
          onClick={() => handleOpenCreate()}
          style={{ marginTop: "1rem" }}
        >
          Opprett første tema
        </Button>
      </DashboardCard>
    );
  }

  return (
    <>
      {/* Word Cloud Section */}
      <DashboardCard padding="0" style={{ overflow: "hidden" }}>
        <Box.New
          padding={{ xs: "space-16", md: "space-24" }}
          borderWidth="0 0 1 0"
          borderColor="neutral-subtle"
        >
          <HStack gap="space-8" align="center">
            <span
              style={{
                color: "var(--ax-text-neutral-subtle)",
                display: "flex",
              }}
            >
              <MagnifyingGlassIcon fontSize="1.25rem" aria-hidden />
            </span>
            <Heading size="small">Ordfrekvens</Heading>
            <Tooltip content="Klikk på et ord for å opprette et tema med det som nøkkelord">
              <InformationSquareIcon
                fontSize="1rem"
                style={{
                  cursor: "help",
                  color: "var(--ax-text-neutral-subtle)",
                }}
                aria-hidden
              />
            </Tooltip>
          </HStack>
          <BodyShort
            size="small"
            textColor="subtle"
            style={{ marginTop: "0.25rem" }}
          >
            Klikk på et ord for å lage tema eller redigere eksisterende
          </BodyShort>
        </Box.New>

        <Box.New padding={{ xs: "space-16", md: "space-24" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
              alignItems: "center",
            }}
          >
            {wordFrequency.slice(0, 30).map(({ word, count }, index) => {
              // Scale font size based on frequency
              const maxCount = wordFrequency[0]?.count ?? 1;
              const scale = 0.75 + (count / maxCount) * 0.75; // 0.75 to 1.5 rem
              const wordTheme = getThemeForWord(word);
              const isCategorized = !!wordTheme;

              // Base color: use theme color if categorized, otherwise neutral based on rank
              const baseColor = isCategorized
                ? wordTheme.color
                : index < 3
                  ? "var(--ax-text-default)"
                  : index < 10
                    ? "var(--ax-text-neutral-subtle)"
                    : "var(--ax-text-muted)";

              return (
                <button
                  key={word}
                  type="button"
                  onClick={(e) => handleWordClick(word, e)}
                  style={{
                    fontSize: `${scale}rem`,
                    fontWeight: index < 5 ? 600 : 400,
                    color: baseColor,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    background: isCategorized ? `${wordTheme.color}15` : "none",
                    border: "none",
                    padding: "0.125rem 0.25rem",
                    borderRadius: "var(--ax-border-radius-small)",
                  }}
                  title={
                    isCategorized
                      ? `${word}: tilhører "${wordTheme.name}" – klikk for å administrere`
                      : `${word}: ${count} ganger – klikk for å kategorisere`
                  }
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isCategorized
                      ? `${wordTheme.color || "#888"}30`
                      : "var(--ax-bg-neutral-soft-hover)";
                    e.currentTarget.style.color = isCategorized
                      ? wordTheme.color || "#888"
                      : "var(--ax-text-action)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isCategorized
                      ? `${wordTheme.color || "#888"}15`
                      : "transparent";
                    e.currentTarget.style.color = baseColor || "";
                  }}
                >
                  {word}
                </button>
              );
            })}
          </div>
        </Box.New>
      </DashboardCard>

      {/* Themes Section */}
      <DashboardCard padding="0" style={{ overflow: "hidden" }}>
        <Box.New
          padding={{ xs: "space-16", md: "space-24" }}
          borderWidth="0 0 1 0"
          borderColor="neutral-subtle"
        >
          <HStack justify="space-between" align="center">
            <HStack gap="space-8" align="center">
              <Heading size="small">Identifiserte temaer</Heading>
              <Tooltip content="Gruppert basert på nøkkelord du definerer. Klikk på et tema for å redigere.">
                <InformationSquareIcon
                  fontSize="1rem"
                  style={{
                    cursor: "help",
                    color: "var(--ax-text-neutral-subtle)",
                  }}
                  aria-hidden
                />
              </Tooltip>
            </HStack>
            <Button
              variant="tertiary"
              size="small"
              icon={<PlusIcon aria-hidden />}
              onClick={() => handleOpenCreate()}
            >
              Opprett nytt tema
            </Button>
          </HStack>
          <BodyShort
            size="small"
            textColor="subtle"
            style={{ marginTop: "0.25rem" }}
          >
            {allThemesDisplay.length > 0
              ? `${allThemesDisplay.length} temaer definert`
              : "Ingen temaer definert ennå."}
          </BodyShort>
        </Box.New>

        <Box.New padding={{ xs: "space-16", md: "space-24" }}>
          {allThemesDisplay.length > 0 ? (
            <VStack gap="space-16">
              {allThemesDisplay.map((theme) => {
                const themeId =
                  theme.definedTheme?.id ??
                  (theme.theme === "Annet" ? "uncategorized" : null);
                return (
                  <ThemeCard
                    key={theme.theme}
                    theme={theme}
                    onClick={
                      themeId
                        ? () => {
                            // Preserve existing search params when navigating
                            const url = new URL(window.location.href);
                            url.pathname = "/feedback";
                            url.searchParams.set("theme", themeId);
                            window.location.href = url.toString();
                          }
                        : undefined
                    }
                    onEdit={
                      theme.definedTheme && theme.theme !== "Annet"
                        ? () => {
                            const dt = theme.definedTheme;
                            if (dt) handleOpenEdit(dt);
                          }
                        : undefined
                    }
                  />
                );
              })}
            </VStack>
          ) : (
            <HStack justify="center" padding="space-24">
              <Button
                variant="secondary"
                icon={<PlusIcon aria-hidden />}
                onClick={() => handleOpenCreate()}
              >
                Opprett første tema
              </Button>
            </HStack>
          )}
        </Box.New>
      </DashboardCard>

      {/* Recent Responses */}
      <DashboardCard padding="0" style={{ overflow: "hidden" }}>
        <Box.New
          padding={{ xs: "space-16", md: "space-24" }}
          borderWidth="0 0 1 0"
          borderColor="neutral-subtle"
        >
          <Heading size="small">Siste svar</Heading>
          <BodyShort
            size="small"
            textColor="subtle"
            style={{ marginTop: "0.25rem" }}
          >
            Hva brukere sier de kom for å gjøre
          </BodyShort>
        </Box.New>

        <Box.New padding={{ xs: "space-16", md: "space-24" }}>
          <VStack gap="space-12">
            {recentResponses.slice(0, 10).map((response) => (
              <div
                key={`${response.task}-${response.submittedAt}`}
                style={{
                  padding: "0.75rem",
                  backgroundColor: "var(--ax-bg-neutral-soft)",
                  borderRadius: "var(--ax-border-radius-medium)",
                }}
              >
                <HStack justify="space-between" align="start" wrap={false}>
                  <BodyShort size="small" style={{ flex: 1 }}>
                    "{response.task}"
                  </BodyShort>
                  <Tag
                    size="xsmall"
                    variant={
                      response.success === "yes"
                        ? "success"
                        : response.success === "partial"
                          ? "warning"
                          : "error"
                    }
                    style={{ flexShrink: 0, marginLeft: "0.5rem" }}
                  >
                    {response.success === "yes"
                      ? "Fullført"
                      : response.success === "partial"
                        ? "Delvis"
                        : "Ikke fullført"}
                  </Tag>
                </HStack>
                {response.blocker && (
                  <BodyShort
                    size="small"
                    textColor="subtle"
                    style={{ marginTop: "0.25rem" }}
                  >
                    Hindring: {response.blocker}
                  </BodyShort>
                )}
              </div>
            ))}
          </VStack>
        </Box.New>
      </DashboardCard>

      {/* Word Popover for categorized words */}
      {popoverTheme && (
        <WordPopover
          word={popoverWord}
          theme={popoverTheme}
          anchorEl={popoverAnchor}
          isOpen={!!popoverAnchor}
          onClose={() => setPopoverAnchor(null)}
          onRemoveWord={handleRemoveWord}
          onEditTheme={handleOpenEdit}
        />
      )}

      {/* Theme Modal */}
      <ThemeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        isSubmitting={isCreating || isUpdating}
        theme={editingTheme}
        initialKeywords={initialKeywords}
        availableWords={wordFrequency.map((w) => w.word)}
        allThemes={definedThemes}
        contextExamples={
          initialKeywords.length > 0
            ? getContextExamples(initialKeywords[0])
            : []
        }
      />
    </>
  );
}

// Local type for display
interface DiscoveryThemeDisplay extends DiscoveryTheme {
  definedTheme?: TextTheme;
}

function ThemeCard({
  theme,
  onClick,
  onEdit,
}: {
  theme: DiscoveryThemeDisplay;
  onClick?: () => void;
  onEdit?: () => void;
}) {
  const successPercent = Math.round(theme.successRate * 100);

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      style={{
        padding: "1rem",
        backgroundColor: "var(--ax-bg-neutral-soft)",
        borderRadius: "var(--ax-border-radius-medium)",
        borderLeft: `3px solid ${
          theme.definedTheme?.color
            ? theme.definedTheme.color
            : successPercent >= 80
              ? "var(--ax-status-success)"
              : successPercent >= 50
                ? "var(--ax-status-warning)"
                : "var(--ax-status-danger)"
        }`,
        cursor: onClick ? "pointer" : "default",
        transition: "background-color 0.2s ease",
      }}
      onMouseEnter={(e) => {
        if (onClick)
          e.currentTarget.style.backgroundColor =
            "var(--ax-bg-neutral-soft-hover)";
      }}
      onMouseLeave={(e) => {
        if (onClick)
          e.currentTarget.style.backgroundColor = "var(--ax-bg-neutral-soft)";
      }}
    >
      <HStack justify="space-between" align="baseline">
        <HStack align="center" gap="space-8">
          <BodyShort weight="semibold">
            {theme.theme === "Annet" ? "Usortert" : theme.theme}
          </BodyShort>
          {theme.theme === "Annet" && (
            <Tooltip content="Tilbakemeldinger som ikke matcher noen av de definerte temaene.">
              <InformationSquareIcon
                style={{ color: "var(--ax-text-neutral-subtle)" }}
                aria-hidden
              />
            </Tooltip>
          )}
        </HStack>
        <HStack gap="space-8">
          <BodyShort size="small" textColor="subtle">
            {theme.count} svar
          </BodyShort>
          <Tag
            size="xsmall"
            variant={
              successPercent >= 80
                ? "success"
                : successPercent >= 50
                  ? "warning"
                  : "error"
            }
          >
            {successPercent}% suksess
          </Tag>
        </HStack>
      </HStack>

      {theme.examples.length > 0 && (
        <div style={{ marginTop: "0.5rem" }}>
          <BodyShort size="small" textColor="subtle">
            Eksempler:
          </BodyShort>
          <ul style={{ margin: "0.25rem 0 0 1rem", padding: 0 }}>
            {theme.examples.slice(0, 3).map((example) => (
              <li key={example}>
                <BodyShort size="small" textColor="subtle">
                  "{example}"
                </BodyShort>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Edit button at bottom-right, outside of the main content flow */}
      {onEdit && (
        <HStack justify="end" style={{ marginTop: "0.75rem" }}>
          <Button
            variant="tertiary"
            size="xsmall"
            icon={<PencilIcon aria-hidden />}
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            title="Rediger tema"
          >
            Rediger
          </Button>
        </HStack>
      )}
    </div>
  );
}
