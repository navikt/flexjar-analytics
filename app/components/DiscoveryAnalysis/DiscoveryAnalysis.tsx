import {
  CogIcon,
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
import { DashboardCard } from "~/components/DashboardComponents";
import { ThemeModal } from "~/components/ThemeModal";
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

  // Handle word click from word cloud
  const handleWordClick = useCallback(
    (word: string) => {
      handleOpenCreate(word);
    },
    [handleOpenCreate],
  );

  if (totalSubmissions === 0) {
    return (
      <DashboardCard>
        <BodyShort textColor="subtle">
          Ingen discovery-data tilgjengelig ennå. Data vises når brukere
          begynner å svare på discovery-surveyen.
        </BodyShort>
      </DashboardCard>
    );
  }

  // Map discovery themes to their ID if possible to allow editing
  const getThemeObject = (themeName: string) => {
    return definedThemes.find((t) => t.name === themeName);
  };

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
            Klikk på et ord for å lage tema
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

              return (
                <button
                  key={word}
                  type="button"
                  onClick={() => handleWordClick(word)}
                  style={{
                    fontSize: `${scale}rem`,
                    fontWeight: index < 5 ? 600 : 400,
                    color:
                      index < 3
                        ? "var(--ax-text-default)"
                        : index < 10
                          ? "var(--ax-text-neutral-subtle)"
                          : "var(--ax-text-muted)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    background: "none",
                    border: "none",
                    padding: "0.125rem 0.25rem",
                    borderRadius: "var(--ax-border-radius-small)",
                  }}
                  title={`${word}: ${count} ganger – klikk for å opprette tema`}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "var(--ax-bg-neutral-soft-hover)";
                    e.currentTarget.style.color = "var(--ax-text-action)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color =
                      index < 3
                        ? "var(--ax-text-default)"
                        : index < 10
                          ? "var(--ax-text-neutral-subtle)"
                          : "var(--ax-text-muted)";
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
              icon={<CogIcon aria-hidden />}
              onClick={() => handleOpenCreate()}
            >
              Administrer temaer
            </Button>
          </HStack>
          <BodyShort
            size="small"
            textColor="subtle"
            style={{ marginTop: "0.25rem" }}
          >
            {themes.length > 0
              ? `${themes.length} temaer funnet basert på nøkkelord`
              : "Ingen temaer definert ennå. Klikk på 'Administrer temaer' for å komme i gang."}
          </BodyShort>
        </Box.New>

        <Box.New padding={{ xs: "space-16", md: "space-24" }}>
          {themes.length > 0 ? (
            <VStack gap="space-16">
              {themes.map((theme) => {
                const themeObj = getThemeObject(theme.theme);
                return (
                  <ThemeCard
                    key={theme.theme}
                    theme={theme}
                    onClick={
                      themeObj ? () => handleOpenEdit(themeObj) : undefined
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

      {/* Theme Modal */}
      <ThemeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        isSubmitting={isCreating || isUpdating}
        theme={editingTheme}
        initialKeywords={initialKeywords}
      />
    </>
  );
}

function ThemeCard({
  theme,
  onClick,
}: { theme: DiscoveryTheme; onClick?: () => void }) {
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
          successPercent >= 80
            ? "var(--ax-status-success)"
            : successPercent >= 50
              ? "var(--ax-status-warning)" // Fixed: was "var(--ax-status-warning)"
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
        <BodyShort weight="semibold">{theme.theme}</BodyShort>
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
    </div>
  );
}
