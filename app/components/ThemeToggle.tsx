import { MoonIcon, SunIcon, LaptopIcon } from "@navikt/aksel-icons";
import { ToggleGroup } from "@navikt/ds-react";
import { useTheme } from "~/lib/ThemeContext";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <ToggleGroup size="small" value={theme} onChange={(val) => setTheme(val as any)}>
            <ToggleGroup.Item value="light" icon={<SunIcon title="Lys modus" />} />
            <ToggleGroup.Item value="auto" icon={<LaptopIcon title="Systemvalg" />} />
            <ToggleGroup.Item value="dark" icon={<MoonIcon title="Mørk modus" />} />
        </ToggleGroup>
    );
}
