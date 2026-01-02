import {
  InformationSquareIcon,
  MagnifyingGlassIcon,
} from "@navikt/aksel-icons";
import {
  BodyShort,
  Box,
  HStack,
  Heading,
  Tag,
  Tooltip,
  VStack,
} from "@navikt/ds-react";
import { DashboardCard } from "~/components/DashboardComponents";
import type { DiscoveryResponse, DiscoveryTheme } from "~/types/api";

interface DiscoveryAnalysisProps {
  data: DiscoveryResponse;
}

/**
 * Analyzes Discovery survey responses to identify common tasks and themes.
 * Shows word frequency cloud, theme clustering, and recent responses.
 */
export function DiscoveryAnalysis({ data }: DiscoveryAnalysisProps) {
  const { wordFrequency, themes, recentResponses, totalSubmissions } = data;

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
          </HStack>
          <BodyShort
            size="small"
            textColor="subtle"
            style={{ marginTop: "0.25rem" }}
          >
            Mest brukte ord i brukerens beskrivelser
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
                <span
                  key={word}
                  style={{
                    fontSize: `${scale}rem`,
                    fontWeight: index < 5 ? 600 : 400,
                    color:
                      index < 3
                        ? "var(--ax-text-default)"
                        : index < 10
                          ? "var(--ax-text-neutral-subtle)"
                          : "var(--ax-text-muted)",
                    cursor: "default",
                    transition: "color 0.2s ease",
                  }}
                  title={`${word}: ${count} ganger`}
                >
                  {word}
                </span>
              );
            })}
          </div>
        </Box.New>
      </DashboardCard>

      {/* Themes Section */}
      {themes.length > 0 && (
        <DashboardCard padding="0" style={{ overflow: "hidden" }}>
          <Box.New
            padding={{ xs: "space-16", md: "space-24" }}
            borderWidth="0 0 1 0"
            borderColor="neutral-subtle"
          >
            <HStack gap="space-8" align="center">
              <Heading size="small">Identifiserte temaer</Heading>
              <Tooltip content="Gruppert basert på nøkkelord i fritekst-svarene">
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
              Gruppert basert på lignende svar
            </BodyShort>
          </Box.New>

          <Box.New padding={{ xs: "space-16", md: "space-24" }}>
            <VStack gap="space-16">
              {themes.map((theme) => (
                <ThemeCard key={theme.theme} theme={theme} />
              ))}
            </VStack>
          </Box.New>
        </DashboardCard>
      )}

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
    </>
  );
}

function ThemeCard({ theme }: { theme: DiscoveryTheme }) {
  const successPercent = Math.round(theme.successRate * 100);

  return (
    <div
      style={{
        padding: "1rem",
        backgroundColor: "var(--ax-bg-neutral-soft)",
        borderRadius: "var(--ax-border-radius-medium)",
        borderLeft: `3px solid ${
          successPercent >= 80
            ? "var(--ax-status-success)"
            : successPercent >= 50
              ? "var(--ax-status-warning)"
              : "var(--ax-status-danger)"
        }`,
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
