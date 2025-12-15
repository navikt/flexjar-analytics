import type { ComponentPropsWithoutRef, ReactNode } from "react";

interface DashboardGridProps extends ComponentPropsWithoutRef<"div"> {
  minColumnWidth?: string;
  gap?: string;
  children?: ReactNode;
}

export function DashboardGrid({
  children,
  style,
  minColumnWidth = "300px",
  gap = "1.5rem",
  ...props
}: DashboardGridProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(auto-fit, minmax(${minColumnWidth}, 1fr))`,
        gap,
        width: "100%",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
