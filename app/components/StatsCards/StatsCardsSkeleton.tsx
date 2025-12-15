import { Box, Skeleton } from "@navikt/ds-react";

interface StatCardSkeletonProps {
  labelWidth?: number;
}

function StatCardSkeleton({ labelWidth = 140 }: StatCardSkeletonProps) {
  return (
    <Box.New
      padding="5"
      background="raised"
      borderRadius="large"
      style={{ boxShadow: "var(--ax-shadow-small)" }}
      borderColor="neutral-subtle"
      borderWidth="1"
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "0.5rem",
        }}
      >
        <Skeleton variant="circle" width={24} height={24} />
        <Skeleton variant="text" width={labelWidth} />
      </div>

      <div style={{ marginBottom: "0.2rem" }}>
        <Skeleton variant="text" width={100} height={40} />
      </div>

      <Skeleton variant="text" width={120} height={20} />
    </Box.New>
  );
}

export function StatsCardsSkeleton() {
  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "1rem",
  };

  return (
    <div style={gridStyle}>
      <StatCardSkeleton labelWidth={160} />
      <StatCardSkeleton labelWidth={180} />
      <StatCardSkeleton labelWidth={80} />
    </div>
  );
}
