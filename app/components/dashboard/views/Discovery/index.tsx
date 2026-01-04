import {
  InformationSquareIcon,
  MagnifyingGlassIcon,
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
import { DashboardCard } from "~/components/dashboard";
import {
  type ContextExample,
  ThemeModal,
} from "~/components/shared/ThemeModal";
import { WordCloud } from "~/components/shared/WordCloud";
import { WordPopover } from "~/components/shared/WordPopover";
import { useThemes } from "~/hooks/useThemes";
import type {
  CreateThemeInput,
  DiscoveryResponse,
  TextTheme,
  UpdateThemeInput,
} from "~/types/api";
import { ThemeCard } from "./ThemeCard";

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

  // Filter to only GENERAL_FEEDBACK themes for Discovery (exclude BLOCKER themes)
  const generalFeedbackThemes = definedThemes.filter(
    (t) => t.analysisContext !== "BLOCKER",
  );

  // Combine defined themes with stats
  const allThemesDisplay = generalFeedbackThemes.map((definedTheme) => {
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
    if (!generalFeedbackThemes.some((dt) => dt.name === statTheme.theme)) {
      allThemesDisplay.push({
        theme: statTheme.theme,
        count: statTheme.count,
        successRate: statTheme.successRate,
        examples: statTheme.examples,
        definedTheme: undefined,
      });
    }
  }

  // Filter out themes with 0 count (they have no data) - keeps UI clean for demos
  const themesWithData = allThemesDisplay.filter((t) => t.count > 0);

  // Sort by count (descending), then by name, but keep "Annet" at the bottom
  themesWithData.sort((a, b) => {
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
          <WordCloud
            words={wordFrequency}
            maxWords={30}
            getThemeForWord={getThemeForWord}
            onWordClick={handleWordClick}
          />
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
            {themesWithData.length > 0
              ? `${themesWithData.length} temaer vist`
              : "Ingen temaer med data ennå."}
          </BodyShort>
        </Box.New>

        <Box.New padding={{ xs: "space-16", md: "space-24" }}>
          {themesWithData.length > 0 ? (
            <VStack gap="space-16">
              {themesWithData.map((theme) => {
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
