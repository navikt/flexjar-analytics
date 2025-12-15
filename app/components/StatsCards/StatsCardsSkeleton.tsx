import {
  CalendarIcon,
  ChatExclamationmarkIcon,
  ChatIcon,
} from "@navikt/aksel-icons";
import { Skeleton } from "@navikt/ds-react";
import type { ReactNode } from "react";
import styles from "./StatsCards.module.css";

interface StatCardSkeletonProps {
  icon: ReactNode;
  labelWidth?: number;
}

function StatCardSkeleton({ icon, labelWidth = 140 }: StatCardSkeletonProps) {
  // Inline styles to match .card in StatsCards.module.css exactly
  const cardStyle: React.CSSProperties = {
    padding: "1.25rem",
    background: "var(--ax-bg-raised)",
    borderRadius: "8px",
    boxShadow: "var(--ax-shadow-small)",
    border: "1px solid var(--ax-border-neutral-subtle)",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  };

  return (
    <div className={styles.card} style={cardStyle}>
      {/* Icon + Label Row */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <div
          style={{ color: "var(--ax-text-neutral-subtle)", display: "flex" }}
        >
          {icon}
        </div>
        <Skeleton variant="text" width={labelWidth} />
      </div>

      {/* Value (Large) - Matches 2.5rem (40px) */}
      <Skeleton variant="text" width={100} height={40} />

      {/* Subtitle (Small) */}
      <Skeleton variant="text" width={120} height={20} />
    </div>
  );
}

export function StatsCardsSkeleton() {
  // Inline styles to match .grid in StatsCards.module.css
  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "1rem",
  };

  // Card definitions to match StatsCards.tsx logic
  const iconSize = "1.5rem";

  // Reverted to static 3-card view per user request for stability
  return (
    <div className={styles.grid} style={gridStyle}>
      {/* 1. Antall tilbakemeldinger */}
      <StatCardSkeleton
        icon={<ChatIcon fontSize={iconSize} aria-hidden />}
        labelWidth={160}
      />

      {/* 2. Tilbakemeldinger med tekst */}
      <StatCardSkeleton
        icon={<ChatExclamationmarkIcon fontSize={iconSize} aria-hidden />}
        labelWidth={180}
      />

      {/* 3. Periode */}
      <StatCardSkeleton
        icon={<CalendarIcon fontSize={iconSize} aria-hidden />}
        labelWidth={80}
      />
    </div>
  );
}
