import { BarChartIcon, DownloadIcon, TableIcon } from "@navikt/aksel-icons";
import { Button, HStack } from "@navikt/ds-react";
import { Link, useNavigate } from "@tanstack/react-router";

import { useSearchParams } from "~/lib/useSearchParams";

export function Header() {
    const { resetParams } = useSearchParams();
    const navigate = useNavigate();

    const handleResetAndNavigate = () => {
        resetParams();
        navigate({ to: "/" });
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
                    <Link to="/" className="[&.active]:font-bold">
                        <Button
                            variant="tertiary"
                            size="small"
                            icon={<BarChartIcon />}
                            onClick={handleResetAndNavigate}
                        >
                            Dashboard
                        </Button>
                    </Link>
                    <Link to="/feedback" className="[&.active]:font-bold">
                        <Button variant="tertiary" size="small" icon={<TableIcon />}>
                            Feedback
                        </Button>
                    </Link>
                    <Link to="/export" className="[&.active]:font-bold">
                        <Button variant="tertiary" size="small" icon={<DownloadIcon />}>
                            Eksporter
                        </Button>
                    </Link>

                </HStack>
            </div>
        </header>
    );
}
