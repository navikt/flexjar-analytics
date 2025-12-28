import { Box, Skeleton, VStack } from "@navikt/ds-react";

function FieldStatCardSkeleton() {
  return (
    <Box.New
      padding="space-20"
      background="raised"
      borderRadius="large"
      style={{ boxShadow: "var(--ax-shadow-small)", width: "100%" }}
      borderColor="neutral-subtle"
      borderWidth="1"
    >
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <Skeleton variant="circle" width={20} height={20} />
        <VStack gap="space-4">
          <Skeleton variant="text" width={120} />
          <Skeleton variant="text" width={100} height={14} />
        </VStack>
      </div>
      <div style={{ marginTop: "1rem" }}>
        <Skeleton variant="text" width={80} height={40} />
      </div>
      <VStack gap="space-8" style={{ marginTop: "1rem" }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
          >
            <Skeleton variant="text" width={16} />
            <Skeleton variant="rectangle" width="100%" height={16} />
          </div>
        ))}
      </VStack>
    </Box.New>
  );
}

export function FieldStatsSkeleton() {
  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "1.5rem",
  };

  return (
    <VStack gap="space-24">
      <div style={{ marginBottom: "1rem" }}>
        <Skeleton variant="text" width={150} height={32} />
      </div>
      <div style={gridStyle}>
        <FieldStatCardSkeleton />
        <FieldStatCardSkeleton />
      </div>
    </VStack>
  );
}
