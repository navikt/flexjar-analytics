import { InformationSquareIcon, PencilIcon } from "@navikt/aksel-icons";
import { BodyShort, Button, HStack, Tag, Tooltip } from "@navikt/ds-react";
import type { DiscoveryTheme, TextTheme } from "~/types/api";

export interface DiscoveryThemeDisplay extends DiscoveryTheme {
  definedTheme?: TextTheme;
}

interface ThemeCardProps {
  theme: DiscoveryThemeDisplay;
  onClick?: () => void;
  onEdit?: () => void;
}

/**
 * Card component for displaying a discovery theme with success rate
 * and example quotes. Supports click to navigate and edit actions.
 */
export function ThemeCard({ theme, onClick, onEdit }: ThemeCardProps) {
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
