import { ChatExclamationmarkIcon, StarIcon } from "@navikt/aksel-icons";
import {
  BodyShort,
  HStack,
  Heading,
  Label,
  Tag,
  VStack,
} from "@navikt/ds-react";
import { DashboardCard, DashboardGrid } from "~/components/DashboardComponents";
import { useSearchParams } from "~/hooks/useSearchParams";
import { useStats } from "~/hooks/useStats";
import type { FieldStat, RatingStats, TextStats } from "~/types/api";
import { formatRelativeTime } from "~/utils/wordAnalysis";

import { FieldStatsSkeleton } from "./FieldStatsSection/FieldStatsSkeleton";

export function FieldStatsSection() {
  const { data: stats, isPending } = useStats();
  const { params } = useSearchParams();
  const hasSurveyFilter = !!params.feedbackId;

  // isPending: skeleton only during initial load when a survey is selected
  if (isPending && hasSurveyFilter) {
    return <FieldStatsSkeleton />;
  }

  if (!stats?.fieldStats?.length) {
    return null;
  }

  const ratingFields = stats.fieldStats.filter((f) => f.fieldType === "RATING");
  const textFields = stats.fieldStats.filter((f) => f.fieldType === "TEXT");

  return (
    <VStack gap="space-16" marginBlock="space-24 space-16">
      <Heading level="3" size="small">
        Statistikk per felt
      </Heading>

      <DashboardGrid
        minColumnWidth="280px"
        gap={{ xs: "space-16", md: "space-24" }}
      >
        {ratingFields.map((field) => (
          <RatingFieldCard
            key={field.fieldId}
            field={field}
            totalCount={stats.totalCount}
          />
        ))}
        {textFields.map((field) => (
          <TextFieldCard
            key={field.fieldId}
            field={field}
            totalCount={stats.totalCount}
          />
        ))}
      </DashboardGrid>
    </VStack>
  );
}

interface FieldCardProps {
  field: FieldStat;
  totalCount: number;
}

function RatingFieldCard({ field, totalCount }: FieldCardProps) {
  const stats = field.stats as RatingStats;
  const distribution = stats.distribution;

  // Regn ut totalt antall svar for dette feltet
  const fieldTotalResponses = Object.values(distribution).reduce(
    (sum, count) => sum + count,
    0,
  );
  // Finn max antall for å skalere barene
  const maxCount = Math.max(...Object.values(distribution), 1);

  return (
    <DashboardCard padding="space-20">
      <HStack gap="space-8" align="start" marginBlock="0 space-8">
        <StarIcon fontSize="1.25rem" aria-hidden />
        <VStack gap="0" style={{ flex: 1 }}>
          <Label size="small" style={{ flex: 1, minWidth: 0 }}>
            {field.label}
          </Label>
          <BodyShort
            size="small"
            style={{ color: "var(--ax-text-neutral-subtle)" }}
          >
            {fieldTotalResponses} av {totalCount} har svart (
            {Math.round((fieldTotalResponses / totalCount) * 100)}%)
          </BodyShort>
        </VStack>
      </HStack>

      <HStack gap="space-8" align="center" marginBlock="space-8">
        <span
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          {stats.average.toFixed(1)}
        </span>
        <span style={{ fontSize: "1.5rem" }}>
          {getRatingEmoji(stats.average)}
        </span>
      </HStack>

      <VStack gap="space-4" marginBlock="space-12 0">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = distribution[rating] || 0;
          // Skalér barene relativt til høyeste verdi, ikke prosent
          const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;
          return (
            <HStack
              key={rating}
              gap="space-8"
              align="center"
              style={{ fontSize: "0.875rem" }}
            >
              <span
                style={{
                  width: "1.25rem",
                  textAlign: "center",
                  fontWeight: 500,
                }}
              >
                {rating}
              </span>
              <div
                style={{
                  flex: 1,
                  height: 10,
                  background: "var(--ax-bg-neutral-moderate)",
                  borderRadius: 5,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${barWidth}% `,
                    height: "100%",
                    borderRadius: 5,
                    backgroundColor: getRatingColor(rating),
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
              <span
                style={{
                  width: "2rem",
                  textAlign: "right",
                  color: "var(--ax-text-neutral-subtle)",
                  fontSize: "0.75rem",
                }}
              >
                {count}
              </span>
            </HStack>
          );
        })}
      </VStack>
    </DashboardCard>
  );
}

function TextFieldCard({ field, totalCount }: FieldCardProps) {
  const stats = field.stats as TextStats;
  // Beregn prosent basert på responseCount og totalCount
  const responseRate =
    totalCount > 0 ? Math.round((stats.responseCount / totalCount) * 100) : 0;

  const hasKeywords = stats.topKeywords && stats.topKeywords.length > 0;
  const hasRecentResponses =
    stats.recentResponses && stats.recentResponses.length > 0;

  return (
    <DashboardCard
      padding="space-20"
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <HStack gap="space-8" align="start" marginBlock="0 space-8">
        <ChatExclamationmarkIcon fontSize="1.25rem" aria-hidden />
        <VStack gap="0" style={{ flex: 1 }}>
          <Label size="small" style={{ flex: 1, minWidth: 0 }}>
            {field.label}
          </Label>
          <BodyShort
            size="small"
            style={{ color: "var(--ax-text-neutral-subtle)" }}
          >
            {stats.responseCount} av {totalCount} har svart ({responseRate}%)
          </BodyShort>
        </VStack>
      </HStack>

      {/* Top Keywords */}
      {hasKeywords && (
        <VStack gap="space-8" marginBlock="space-12 0">
          <BodyShort
            size="small"
            weight="semibold"
            style={{ color: "var(--ax-text-neutral-subtle)" }}
          >
            Hyppigste ord
          </BodyShort>
          <HStack gap="space-8" wrap>
            {stats.topKeywords.map(({ word, count }) => (
              <Tag key={word} size="small" variant="neutral">
                {word}
                <span
                  style={{
                    opacity: 0.5,
                    marginLeft: "0.35rem",
                    fontSize: "0.75rem",
                  }}
                >
                  {count}
                </span>
              </Tag>
            ))}
          </HStack>
        </VStack>
      )}

      {/* Recent Responses */}
      {hasRecentResponses && (
        <VStack gap="space-8" marginBlock="space-16 0">
          <BodyShort
            size="small"
            weight="semibold"
            style={{ color: "var(--ax-text-neutral-subtle)" }}
          >
            Siste svar
          </BodyShort>
          <VStack gap="space-8">
            {stats.recentResponses.map((response, index) => (
              <div
                key={`${response.submittedAt}-${index}`}
                style={{
                  padding: "0.5rem 0.75rem",
                  backgroundColor: "var(--ax-bg-neutral-soft)",
                  borderRadius: "var(--ax-border-radius-medium)",
                  borderLeft: "3px solid var(--ax-border-info)",
                }}
              >
                <BodyShort
                  size="small"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  "{response.text}"
                </BodyShort>
                <BodyShort
                  size="small"
                  style={{
                    color: "var(--ax-text-neutral-subtle)",
                    marginTop: "0.25rem",
                    fontSize: "0.75rem",
                  }}
                >
                  {formatRelativeTime(response.submittedAt)}
                </BodyShort>
              </div>
            ))}
          </VStack>
        </VStack>
      )}

      {/* Fallback if no keywords or responses */}
      {!hasKeywords && !hasRecentResponses && (
        <BodyShort
          size="small"
          style={{
            color: "var(--ax-text-neutral-subtle)",
            marginTop: "0.5rem",
            fontStyle: "italic",
          }}
        >
          Ingen tekstsvar ennå
        </BodyShort>
      )}
    </DashboardCard>
  );
}

function getRatingEmoji(rating: number): string {
  if (Number.isNaN(rating)) return "";
  if (rating < 1.5) return "😡";
  if (rating < 2.5) return "🙁";
  if (rating < 3.5) return "😐";
  if (rating < 4.5) return "😀";
  return "😍";
}

// Konsistent farge per rating - ikke "progress bar" stil
function getRatingColor(rating: number): string {
  switch (rating) {
    case 5:
      return "#22C55E"; // Grønn
    case 4:
      return "#84CC16"; // Lime
    case 3:
      return "#EAB308"; // Gul
    case 2:
      return "#F97316"; // Oransje
    case 1:
      return "#EF4444"; // Rød
    default:
      return "#9CA3AF";
  }
}
