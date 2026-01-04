import {
  BulletListIcon,
  CloudIcon,
  PencilIcon,
  PlusIcon,
} from "@navikt/aksel-icons";
import {
  BodyShort,
  Box,
  Button,
  HStack,
  Heading,
  Skeleton,
  VStack,
} from "@navikt/ds-react";
import { useCallback, useState } from "react";
import { DashboardCard } from "~/components/DashboardComponents";
import { type ContextExample, ThemeModal } from "~/components/ThemeModal";
import { WordCloud } from "~/components/WordCloud";
import { WordPopover } from "~/components/WordPopover";
import { useBlockerStats } from "~/hooks/useBlockerStats";
import { useThemes } from "~/hooks/useThemes";
import type {
  BlockerResponse,
  CreateThemeInput,
  TextTheme,
  UpdateThemeInput,
} from "~/types/api";

interface BlockerAnalysisProps {
  /** Optional - if provided, use this data instead of fetching */
  data?: BlockerResponse;
}

/**
 * Analyzes blocker patterns using keyword-based themes.
 * Supports creating and editing blocker themes from word cloud.
 */
export function BlockerAnalysis({ data: providedData }: BlockerAnalysisProps) {
  const blockerQuery = useBlockerStats();
  const {
    themes: allThemes,
    createTheme,
    updateTheme,
    deleteTheme,
    isCreating,
    isUpdating,
    isDeleting,
  } = useThemes();

  const [showModal, setShowModal] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string>("");
  const [editingTheme, setEditingTheme] = useState<TextTheme | undefined>();

  // Popover state for categorized words (lightweight removal)
  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null);
  const [popoverWord, setPopoverWord] = useState<string>("");
  const [popoverTheme, setPopoverTheme] = useState<TextTheme | null>(null);

  // Filter to blocker themes only
  const blockerThemes = allThemes.filter(
    (t) => t.analysisContext === "BLOCKER",
  );

  // Use provided data or fetch from hook
  const data = providedData ?? blockerQuery.data;
  const isLoading =
    !providedData && (blockerQuery.isLoading || blockerQuery.isFetching);

  // Helper to find which theme a word belongs to
  const getThemeForWord = (word: string): TextTheme | undefined => {
    const wordLower = word.toLowerCase();
    return blockerThemes.find((theme) =>
      theme.keywords.some(
        (kw) =>
          kw.toLowerCase() === wordLower ||
          wordLower.includes(kw.toLowerCase()) ||
          kw.toLowerCase().includes(wordLower),
      ),
    );
  };

  // Handle removing word from theme (via popover - lightweight)
  // Must be defined before early returns (React Rules of Hooks)
  const handleRemoveWord = useCallback(
    (themeId: string, word: string) => {
      const theme = blockerThemes.find((t) => t.id === themeId);
      if (!theme) return;

      const updatedKeywords = theme.keywords.filter(
        (k) => k.toLowerCase() !== word.toLowerCase(),
      );
      updateTheme({ themeId, keywords: updatedKeywords });
    },
    [blockerThemes, updateTheme],
  );

  // Handle edit theme from popover
  const handleEditFromPopover = useCallback((theme: TextTheme) => {
    setEditingTheme(theme);
    setSelectedWord("");
    setShowModal(true);
    setPopoverAnchor(null);
  }, []);

  // Loading state
  if (isLoading && !data) {
    return (
      <DashboardCard padding="0" style={{ overflow: "hidden" }}>
        <Box.New
          padding={{ xs: "space-16", md: "space-24" }}
          borderWidth="0 0 1 0"
          borderColor="neutral-subtle"
        >
          <Skeleton width="200px" height="24px" />
        </Box.New>
        <Box.New padding={{ xs: "space-16", md: "space-24" }}>
          <VStack gap="space-12">
            {[...Array(4)].map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Skeletons are static
              <Skeleton key={i} width="100%" height="40px" />
            ))}
          </VStack>
        </Box.New>
      </DashboardCard>
    );
  }

  if (!data || data.totalBlockers === 0) {
    return null;
  }

  const {
    themes: statsThemes,
    wordFrequency,
    totalBlockers,
    recentBlockers,
  } = data;

  // Get context examples for the selected word
  const getContextExamples = (word: string): ContextExample[] => {
    if (!word) return [];
    const wordLower = word.toLowerCase();
    return recentBlockers
      .filter((b) => b.blocker.toLowerCase().includes(wordLower))
      .map((b) => ({ text: b.blocker, submittedAt: b.submittedAt }));
  };

  const handleWordClick = (
    word: string,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    // Check if word belongs to existing theme
    const existingTheme = getThemeForWord(word);
    if (existingTheme) {
      // Show popover for categorized words (lightweight option)
      setPopoverWord(word);
      setPopoverTheme(existingTheme);
      setPopoverAnchor(event.currentTarget);
    } else {
      // Open create modal with this word
      setSelectedWord(word);
      setEditingTheme(undefined);
      setShowModal(true);
    }
  };

  const handleThemeClick = (themeId: string) => {
    const theme = blockerThemes.find((t) => t.id === themeId);
    if (theme) {
      setEditingTheme(theme);
      setSelectedWord("");
      setShowModal(true);
    }
  };

  const handleSubmit = (
    input: CreateThemeInput | (UpdateThemeInput & { themeId: string }),
  ) => {
    if ("themeId" in input) {
      // Update existing theme
      updateTheme(input);
    } else {
      // Create new theme with BLOCKER context
      createTheme({
        ...input,
        analysisContext: "BLOCKER",
      });
    }
    setShowModal(false);
    setEditingTheme(undefined);
    setSelectedWord("");
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingTheme(undefined);
    setSelectedWord("");
  };

  const handleDelete = (themeId: string) => {
    deleteTheme(themeId);
    setShowModal(false);
    setEditingTheme(undefined);
  };

  return (
    <>
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
              <BulletListIcon fontSize="1.25rem" aria-hidden />
            </span>
            <Heading size="small">Blocker-mønstre</Heading>
          </HStack>
          <BodyShort
            size="small"
            textColor="subtle"
            style={{ marginTop: "0.25rem" }}
          >
            Automatisk kategorisering av {totalBlockers} hindringer fra
            fritekst-svar
          </BodyShort>
        </Box.New>

        {/* Word Cloud Section */}
        {wordFrequency.length > 0 && (
          <Box.New
            padding={{ xs: "space-16", md: "space-24" }}
            borderWidth="0 0 1 0"
            borderColor="neutral-subtle"
          >
            <HStack
              gap="space-8"
              align="center"
              style={{ marginBottom: "0.75rem" }}
            >
              <CloudIcon
                fontSize="1rem"
                style={{ color: "var(--ax-text-neutral-subtle)" }}
              />
              <BodyShort size="small" weight="semibold">
                Ordfrekvens
              </BodyShort>
              <BodyShort size="small" textColor="subtle">
                – klikk for å opprette eller redigere tema
              </BodyShort>
            </HStack>
            <WordCloud
              words={wordFrequency}
              maxWords={20}
              getThemeForWord={getThemeForWord}
              onWordClick={handleWordClick}
            />
          </Box.New>
        )}

        {/* Theme List */}
        <Box.New padding={{ xs: "space-16", md: "space-24" }}>
          <HStack
            justify="space-between"
            align="center"
            style={{ marginBottom: "0.75rem" }}
          >
            <BodyShort size="small" weight="semibold">
              Identifiserte mønstre
            </BodyShort>
            <Button
              variant="tertiary"
              size="xsmall"
              icon={<PlusIcon aria-hidden />}
              onClick={() => {
                setSelectedWord("");
                setEditingTheme(undefined);
                setShowModal(true);
              }}
            >
              Nytt tema
            </Button>
          </HStack>

          {statsThemes.length > 0 ? (
            <VStack gap="space-12">
              {statsThemes.map((theme) => {
                const percentage = Math.round(
                  (theme.count / totalBlockers) * 100,
                );
                const maxCount = statsThemes[0]?.count ?? 1;
                const relativeWidth = (theme.count / maxCount) * 100;

                return (
                  <button
                    key={theme.themeId}
                    type="button"
                    onClick={() => {
                      // Navigate to feedback page filtered by this theme
                      const url = new URL(window.location.href);
                      url.pathname = "/feedback";
                      url.searchParams.set("theme", theme.themeId);
                      window.location.href = url.toString();
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      background: "none",
                      border: "none",
                      padding: "0.5rem",
                      borderRadius: "var(--ax-border-radius-medium)",
                      cursor: "pointer",
                      transition: "background-color 0.2s ease",
                    }}
                    title="Klikk for å se feedback med dette temaet"
                  >
                    <HStack
                      justify="space-between"
                      align="baseline"
                      wrap={false}
                    >
                      <HStack gap="space-8" align="center">
                        {theme.color && (
                          <div
                            style={{
                              width: "10px",
                              height: "10px",
                              borderRadius: "50%",
                              backgroundColor: theme.color,
                              flexShrink: 0,
                            }}
                          />
                        )}
                        <BodyShort size="small" weight="semibold" truncate>
                          {theme.theme}
                        </BodyShort>
                        <PencilIcon
                          fontSize="0.75rem"
                          style={{ color: "var(--ax-text-muted)" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleThemeClick(theme.themeId);
                          }}
                          title="Rediger tema"
                        />
                      </HStack>
                      <BodyShort
                        size="small"
                        textColor="subtle"
                        style={{ flexShrink: 0, marginLeft: "0.5rem" }}
                      >
                        {theme.count} ({percentage}%)
                      </BodyShort>
                    </HStack>

                    {/* Progress bar */}
                    <div
                      style={{
                        marginTop: "0.25rem",
                        height: "6px",
                        borderRadius: "3px",
                        backgroundColor: "var(--ax-bg-neutral-moderate)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${relativeWidth}%`,
                          height: "100%",
                          borderRadius: "3px",
                          backgroundColor:
                            theme.color ?? "var(--ax-status-danger)",
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>

                    {/* Examples */}
                    {theme.examples.length > 0 && (
                      <BodyShort
                        size="small"
                        textColor="subtle"
                        style={{
                          marginTop: "0.25rem",
                          fontStyle: "italic",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        "{theme.examples[0]}"
                      </BodyShort>
                    )}
                  </button>
                );
              })}
            </VStack>
          ) : (
            <VStack
              align="center"
              gap="space-12"
              style={{ padding: "1.5rem 0" }}
            >
              <BodyShort textColor="subtle">
                Ingen blocker-temaer matcher ennå
              </BodyShort>
            </VStack>
          )}
        </Box.New>
      </DashboardCard>

      {/* Recent Blocker Responses */}
      {recentBlockers.length > 0 && (
        <DashboardCard padding="0" style={{ overflow: "hidden" }}>
          <Box.New
            padding={{ xs: "space-16", md: "space-24" }}
            borderWidth="0 0 1 0"
            borderColor="neutral-subtle"
          >
            <Heading size="small">Siste blocker-svar</Heading>
            <BodyShort
              size="small"
              textColor="subtle"
              style={{ marginTop: "0.25rem" }}
            >
              Nylige hindringer brukere har rapportert
            </BodyShort>
          </Box.New>

          <Box.New padding={{ xs: "space-16", md: "space-24" }}>
            <VStack gap="space-12">
              {recentBlockers.slice(0, 5).map((blocker) => (
                <div
                  key={`${blocker.blocker}-${blocker.submittedAt}`}
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "var(--ax-bg-neutral-soft)",
                    borderRadius: "var(--ax-border-radius-medium)",
                  }}
                >
                  <BodyShort size="small">"{blocker.blocker}"</BodyShort>
                  <BodyShort
                    size="small"
                    textColor="subtle"
                    style={{ marginTop: "0.25rem" }}
                  >
                    Oppgave: {blocker.task}
                  </BodyShort>
                </div>
              ))}
            </VStack>
          </Box.New>
        </DashboardCard>
      )}

      <ThemeModal
        isOpen={showModal}
        onClose={handleClose}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        isSubmitting={isCreating || isUpdating || isDeleting}
        theme={editingTheme}
        initialKeywords={selectedWord ? [selectedWord] : []}
        availableWords={wordFrequency.map((w) => w.word)}
        allThemes={blockerThemes}
        contextExamples={selectedWord ? getContextExamples(selectedWord) : []}
      />

      {/* Word Popover for categorized words (lightweight removal) */}
      {popoverTheme && (
        <WordPopover
          word={popoverWord}
          theme={popoverTheme}
          anchorEl={popoverAnchor}
          isOpen={!!popoverAnchor}
          onClose={() => setPopoverAnchor(null)}
          onRemoveWord={handleRemoveWord}
          onEditTheme={handleEditFromPopover}
        />
      )}
    </>
  );
}
