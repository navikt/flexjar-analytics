import { BarChartIcon, DownloadIcon, TableIcon } from "@navikt/aksel-icons";
import { Button, HStack } from "@navikt/ds-react";
import { Link, useLocation } from "@tanstack/react-router";
import { ThemeToggle } from "~/components/ThemeToggle";

export function Header() {
  const location = useLocation();
  const currentPath = location.pathname;

  const handleResetAndNavigate = () => {
    // Force navigation to root and clear search params
    window.location.href = "/";
  };

  // Helper to determine button variant based on active path
  const getVariant = (path: string) => {
    if (path === "/") {
      return currentPath === "/" ? "primary" : "tertiary";
    }
    return currentPath.startsWith(path) ? "primary" : "tertiary";
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <button
          type="button"
          onClick={handleResetAndNavigate}
          className="header-title"
        >
          <img src="/static/flexjar.png" alt="" className="header-logo" />
          Flexjar Analytics
        </button>
        <HStack gap="4">
          <Link to="/" search={(prev) => prev}>
            <Button
              variant={getVariant("/")}
              size="small"
              icon={<BarChartIcon />}
            >
              Dashboard
            </Button>
          </Link>
          <Link to="/feedback" search={(prev) => prev}>
            <Button
              variant={getVariant("/feedback")}
              size="small"
              icon={<TableIcon />}
            >
              Tilbakemeldinger
            </Button>
          </Link>
          <Link to="/export" search={(prev) => prev}>
            <Button
              variant={getVariant("/export")}
              size="small"
              icon={<DownloadIcon />}
            >
              Eksporter
            </Button>
          </Link>
          <div
            style={{
              width: "1px",
              height: "32px",
              background: "var(--ax-border-neutral-subtle)",
            }}
          />
          <ThemeToggle />
        </HStack>
      </div>
    </header>
  );
}
