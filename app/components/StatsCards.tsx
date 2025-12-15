import {
  CalendarIcon,
  ChatExclamationmarkIcon,
  ChatIcon,
  StarIcon,
} from "@navikt/aksel-icons";
import { BodyShort, HStack } from "@navikt/ds-react";
import type { ReactNode } from "react";
import type { RatingStats, TextStats } from "~/lib/api";
import { useSearchParams } from "~/lib/useSearchParams";
import { useStats } from "~/lib/useStats";
import styles from "./StatsCards/StatsCards.module.css";
import { StatsCardsSkeleton } from "./StatsCards/StatsCardsSkeleton";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  subtitle: string;
}

export function StatCard({ icon, label, value, subtitle }: StatCardProps) {
  return (
    <div className={styles.card}>
      <HStack gap="2" align="center">
        {icon}
        <BodyShort className={styles.label}>{label}</BodyShort>
      </HStack>
      <div className={styles.value}>{value}</div>
      <BodyShort size="small" className={styles.subtitle}>
        {subtitle}
      </BodyShort>
    </div>
  );
}

export function StatsCards() {
  const { data: stats, isLoading } = useStats();
  const { params } = useSearchParams();
  const hasSurveyFilter = !!params.feedbackId;

  // Vis default skeleton (3 kort) alltid for stabilitet
  if (isLoading) {
    return <StatsCardsSkeleton />;
  }

  const totalCount = stats?.totalCount || 0;
  const periodDays = stats?.period?.days || 30;
  const countWithText = stats?.countWithText || 0;
  const textPercentage =
    totalCount > 0 ? Math.round((countWithText / totalCount) * 100) : 0;

  // Kun vis detaljert felt-statistikk når én survey er valgt
  if (hasSurveyFilter) {
    // Find first rating field from fieldStats
    const ratingField = stats?.fieldStats?.find(
      (f) => f.fieldType === "RATING",
    );
    const ratingStats = ratingField?.stats as RatingStats | undefined;
    const avgRating = ratingStats?.average?.toFixed(1) || "–";

    // Count text fields with responses
    const textFields =
      stats?.fieldStats?.filter((f) => f.fieldType === "TEXT") || [];
    const totalTextResponses = textFields.reduce((sum, f) => {
      const textStats = f.stats as TextStats;
      return sum + textStats.responseCount;
    }, 0);

    return (
      <div className={styles.grid}>
        <StatCard
          icon={<ChatIcon fontSize="1.5rem" aria-hidden />}
          label="Antall tilbakemeldinger"
          value={totalCount.toLocaleString("no-NO")}
          subtitle={`Siste ${periodDays} dager`}
        />

        {ratingStats ? (
          <StatCard
            icon={<StarIcon fontSize="1.5rem" aria-hidden />}
            label="Gjennomsnittlig vurdering"
            value={`${avgRating} ${getRatingEmoji(Number(avgRating))}`}
            subtitle="av 5 mulige"
          />
        ) : (
          <StatCard
            icon={<StarIcon fontSize="1.5rem" aria-hidden />}
            label="Vurdering"
            value="–"
            subtitle="Ingen rating i denne surveyen"
          />
        )}

        <StatCard
          icon={<ChatExclamationmarkIcon fontSize="1.5rem" aria-hidden />}
          label="Antall tekstsvar"
          value={totalTextResponses.toLocaleString("no-NO")}
          subtitle={`${textFields.length} tekstfelt`}
        />

        <StatCard
          icon={<CalendarIcon fontSize="1.5rem" aria-hidden />}
          label="Periode"
          value={`${periodDays} dager`}
          subtitle={`${stats?.period?.from || "–"} til ${stats?.period?.to || "nå"}`}
        />
      </div>
    );
  }

  // Aggregert visning når "alle surveys" er valgt
  return (
    <div className={styles.grid}>
      <StatCard
        icon={<ChatIcon fontSize="1.5rem" aria-hidden />}
        label="Antall tilbakemeldinger"
        value={totalCount.toLocaleString("no-NO")}
        subtitle={`Siste ${periodDays} dager`}
      />

      <StatCard
        icon={<ChatExclamationmarkIcon fontSize="1.5rem" aria-hidden />}
        label="Tilbakemeldinger med tekst"
        value={countWithText.toLocaleString("no-NO")}
        subtitle={`${textPercentage}% av totalt`}
      />

      <StatCard
        icon={<CalendarIcon fontSize="1.5rem" aria-hidden />}
        label="Periode"
        value={`${periodDays} dager`}
        subtitle={`${stats?.period?.from || "–"} til ${stats?.period?.to || "nå"}`}
      />
    </div>
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
