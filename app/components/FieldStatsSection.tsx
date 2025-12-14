import { ChatExclamationmarkIcon, StarIcon } from "@navikt/aksel-icons";
import {
  BodyShort,
  HStack,
  Heading,
  Label,
  Skeleton,
  VStack,
} from "@navikt/ds-react";
import type { FieldStat, RatingStats, TextStats } from "~/lib/api";
import { useSearchParams } from "~/lib/useSearchParams";
import { useStats } from "~/lib/useStats";

function FieldStatCardSkeleton() {
  return (
    <div className="dashboard-card field-stat-card">
      <HStack gap="2" align="center">
        <Skeleton variant="circle" width={20} height={20} />
        <VStack gap="1">
          <Skeleton variant="text" width={120} />
          <Skeleton variant="text" width={100} height={14} />
        </VStack>
      </HStack>
      <div style={{ marginTop: "1rem" }}>
        <Skeleton variant="text" width={80} height={40} />
      </div>
      <VStack gap="2" style={{ marginTop: "1rem" }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <HStack key={i} gap="2" align="center">
            <Skeleton variant="text" width={16} />
            <Skeleton variant="rectangle" width="100%" height={16} />
          </HStack>
        ))}
      </VStack>
    </div>
  );
}

export function FieldStatsSection() {
  const { data: stats, isLoading } = useStats();
  const { params } = useSearchParams();
  const hasSurveyFilter = !!params.feedbackId;

  // Vis skeleton når det lastes og en survey er valgt
  if (isLoading && hasSurveyFilter) {
    return (
      <div className="field-stats-section">
        <Heading level="3" size="small" spacing>
          Statistikk per felt
        </Heading>
        <div className="field-stats-grid">
          <FieldStatCardSkeleton />
          <FieldStatCardSkeleton />
        </div>
      </div>
    );
  }

  if (!stats?.fieldStats?.length) {
    return null;
  }

  const ratingFields = stats.fieldStats.filter((f) => f.fieldType === "RATING");
  const textFields = stats.fieldStats.filter((f) => f.fieldType === "TEXT");

  return (
    <div className="field-stats-section">
      <Heading level="3" size="small" spacing>
        Statistikk per felt
      </Heading>

      <div className="field-stats-grid">
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
      </div>
    </div>
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
    <div className="dashboard-card field-stat-card">
      <HStack gap="2" align="start" className="field-card-header">
        <StarIcon fontSize="1.25rem" aria-hidden />
        <VStack gap="0" style={{ flex: 1 }}>
          <Label size="small" className="field-card-label">
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

      <div className="rating-average">
        <span className="rating-value">{stats.average.toFixed(1)}</span>
        <span className="rating-emoji">{getRatingEmoji(stats.average)}</span>
      </div>

      <VStack gap="1" marginBlock="3 0">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = distribution[rating] || 0;
          // Skalér barene relativt til høyeste verdi, ikke prosent
          const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;
          return (
            <HStack
              key={rating}
              gap="2"
              align="center"
              className="rating-bar-row"
            >
              <span className="rating-label">{rating}</span>
              <div className="rating-bar">
                <div
                  className="rating-bar-fill"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: getRatingColor(rating),
                  }}
                />
              </div>
              <span className="rating-count">{count}</span>
            </HStack>
          );
        })}
      </VStack>
    </div>
  );
}

function TextFieldCard({ field, totalCount }: FieldCardProps) {
  const stats = field.stats as TextStats;
  // Beregn prosent basert på responseCount og totalCount
  const responseRate =
    totalCount > 0 ? Math.round((stats.responseCount / totalCount) * 100) : 0;

  return (
    <div className="dashboard-card field-stat-card text-field-card">
      <HStack gap="2" align="start" className="field-card-header">
        <ChatExclamationmarkIcon fontSize="1.25rem" aria-hidden />
        <VStack gap="0" style={{ flex: 1 }}>
          <Label size="small" className="field-card-label">
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

      <div className="text-stat-value">{stats.responseCount} svar</div>

      <div className="response-rate-bar" style={{ marginTop: "0.75rem" }}>
        <div
          className="response-rate-fill"
          style={{
            width: `${responseRate}%`,
            backgroundColor: getResponseRateColor(responseRate),
          }}
        />
      </div>
    </div>
  );
}

// Farge basert på svarprosent
function getResponseRateColor(rate: number): string {
  if (rate >= 70) return "#22C55E"; // Grønn - bra
  if (rate >= 40) return "#EAB308"; // Gul - ok
  return "#9CA3AF"; // Grå - lav
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
