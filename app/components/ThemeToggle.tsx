import { MoonIcon, SunIcon } from "@navikt/aksel-icons";
import { Button, Tooltip } from "@navikt/ds-react";
import { useTheme } from "~/lib/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Tooltip
      content={theme === "light" ? "Bytt til mørk modus" : "Bytt til lys modus"}
    >
      <Button
        variant="tertiary-neutral"
        size="small"
        onClick={toggleTheme}
        icon={
          theme === "light" ? <MoonIcon aria-hidden /> : <SunIcon aria-hidden />
        }
      />
    </Tooltip>
  );
}
