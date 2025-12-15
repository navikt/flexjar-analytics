import { Skeleton } from "@navikt/ds-react";

function FieldStatCardSkeleton() {
  const cardStyle: React.CSSProperties = {
    padding: "1.5rem",
    background: "var(--ax-bg-raised)",
    borderRadius: "8px",
    boxShadow: "var(--ax-shadow-small)",
    border: "1px solid var(--ax-border-neutral-subtle)",
    width: "100%",
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    gap: "0.5rem",
    alignItems: "center",
  };

  const vstackStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  };

  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <Skeleton variant="circle" width={20} height={20} />
        <div style={vstackStyle}>
          <Skeleton variant="text" width={120} />
          <Skeleton variant="text" width={100} height={14} />
        </div>
      </div>
      <div style={{ marginTop: "1rem" }}>
        <Skeleton variant="text" width={80} height={40} />
      </div>
      <div
        style={{
          marginTop: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
          >
            <Skeleton variant="text" width={16} />
            <Skeleton variant="rectangle" width="100%" height={16} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function FieldStatsSkeleton() {
  const sectionStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  };

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "1.5rem",
  };

  return (
    <div style={sectionStyle}>
      <div style={{ marginBottom: "1rem" }}>
        <Skeleton variant="text" width={150} height={32} />
      </div>
      <div style={gridStyle}>
        <FieldStatCardSkeleton />
        <FieldStatCardSkeleton />
      </div>
    </div>
  );
}
