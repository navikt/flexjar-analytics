import { Skeleton } from "@navikt/ds-react";
import styles from "./FilterBar.module.css";

interface FilterBarSkeletonProps {
  showDetails?: boolean;
  hasActiveFilters?: boolean;
}

export function FilterBarSkeleton({
  showDetails,
  hasActiveFilters,
}: FilterBarSkeletonProps) {
  // Using inline styles to strictly match the loaded state and prevent FOUC (Flash of Unstyled Content)
  // These values MUST match .bar in FilterBar.module.css
  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.75rem",
    alignItems: "flex-end",
    padding: "1rem",
    background: "var(--ax-bg-raised)",
    borderRadius: "8px",
    boxShadow: "var(--ax-shadow-small)",
    border: "1px solid var(--ax-border-neutral-subtle)",
    minHeight: "52px",
    width: "100%",
  };

  return (
    <div
      className={styles.container}
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
      }}
    >
      <div className={styles.bar} style={containerStyle}>
        {/* App Select (32px) - Fixed Width 200 */}
        <Skeleton variant="rounded" width={200} height={32} />

        {/* Survey Select (32px) - Fixed Width 250 */}
        <Skeleton variant="rounded" width={250} height={32} />

        <div style={{ flex: 1 }} />

        {/* Period Selector (34px) - Exact measured width 156 */}
        <Skeleton variant="rounded" width={156} height={34} />

        {/* Reset Button (32px) */}
        {hasActiveFilters && (
          <Skeleton variant="rounded" width={100} height={32} />
        )}
      </div>

      {showDetails && (
        <div
          className={styles.secondary}
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem",
            alignItems: "center",
            padding: "0.75rem 1rem",
            background: "var(--ax-bg-default)",
            borderRadius: "8px",
            border: "1px solid var(--ax-border-neutral-subtle)",
            minHeight: "44px",
          }}
        >
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            {/* Search + Tags */}
            <Skeleton variant="rounded" width={200} height={32} />
            <Skeleton variant="rounded" width={200} height={32} />
          </div>

          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            {/* Device Toggle + Buttons */}
            <Skeleton variant="rounded" width={150} height={32} />
            <div
              style={{
                width: "1px",
                height: "24px",
                background: "var(--ax-border-neutral-subtle)",
                margin: "0 0.25rem",
              }}
            />
            <Skeleton variant="rounded" width={100} height={32} />
            <Skeleton variant="rounded" width={100} height={32} />
          </div>
        </div>
      )}
    </div>
  );
}
