import {
  ArrowsCirclepathIcon,
  DownloadIcon,
  FileExcelIcon,
  FilesIcon,
} from "@navikt/aksel-icons";
import {
  Alert,
  BodyShort,
  Box,
  Button,
  HStack,
  Heading,
  Radio,
  RadioGroup,
  VStack,
} from "@navikt/ds-react";
import dayjs from "dayjs";
import { useState } from "react";
import { useSearchParams } from "~/lib/useSearchParams";

export function ExportPanel() {
  const { params } = useSearchParams();
  const [format, setFormat] = useState<"csv" | "json" | "excel">("csv");
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);
    setSuccess(false);

    try {
      const queryParams = new URLSearchParams();
      queryParams.set("format", format);
      if (params.team) queryParams.set("team", params.team);
      if (params.app) queryParams.set("app", params.app);
      if (params.feedbackId) queryParams.set("feedbackId", params.feedbackId);
      if (params.from) queryParams.set("from", params.from);
      if (params.to) queryParams.set("to", params.to);
      if (params.medTekst) queryParams.set("medTekst", params.medTekst);
      if (params.fritekst) queryParams.set("fritekst", params.fritekst);
      if (params.lavRating) queryParams.set("lavRating", params.lavRating);
      if (params.deviceType) queryParams.set("deviceType", params.deviceType);
      if (params.tags) queryParams.set("tags", params.tags);

      const response = await fetch(
        `/api/backend/api/v1/intern/export?${queryParams.toString()}`,
      );

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error("Du har ikke tilgang til å eksportere data");
        }
        if (response.status === 504 || response.status === 408) {
          throw new Error(
            "Forespørselen tok for lang tid. Prøv å begrense tidsperioden.",
          );
        }
        throw new Error(`Eksport feilet (${response.status})`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const extension = format === "excel" ? "xlsx" : format;
      a.download = `flexjar-export-${new Date().toISOString().split("T")[0]}.${extension}`;

      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Export failed:", err);
      setError(err instanceof Error ? err.message : "Ukjent feil ved eksport");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="dashboard-grid">
      {error && (
        <Alert
          variant="error"
          className="export-alert"
          closeButton
          onClose={() => setError(null)}
        >
          {error}
          <Button
            variant="tertiary"
            size="small"
            icon={<ArrowsCirclepathIcon />}
            onClick={handleExport}
            style={{ marginLeft: "0.5rem" }}
          >
            Prøv igjen
          </Button>
        </Alert>
      )}
      {success && (
        <Alert variant="success" className="export-alert">
          Eksport fullført! Filen er lastet ned.
        </Alert>
      )}
      <div className="dashboard-card">
        <VStack gap="4">
          <Heading size="small">Velg format</Heading>

          <RadioGroup
            legend="Eksportformat"
            hideLegend
            value={format}
            onChange={(val) => setFormat(val as typeof format)}
          >
            <Radio value="csv">
              <HStack gap="2" align="center">
                <FilesIcon />
                <VStack gap="0">
                  <BodyShort weight="semibold">CSV</BodyShort>
                  <BodyShort size="small">
                    Kommaseparert fil, fungerer med Excel og andre verktøy
                  </BodyShort>
                </VStack>
              </HStack>
            </Radio>
            <Radio value="excel">
              <HStack gap="2" align="center">
                <FileExcelIcon />
                <VStack gap="0">
                  <BodyShort weight="semibold">Excel (XLSX)</BodyShort>
                  <BodyShort size="small">
                    Native Excel-format med formatering
                  </BodyShort>
                </VStack>
              </HStack>
            </Radio>
            <Radio value="json">
              <HStack gap="2" align="center">
                <FilesIcon />
                <VStack gap="0">
                  <BodyShort weight="semibold">JSON</BodyShort>
                  <BodyShort size="small">
                    Maskinlesbart format for videre prosessering
                  </BodyShort>
                </VStack>
              </HStack>
            </Radio>
          </RadioGroup>

          <Button
            onClick={handleExport}
            loading={isExporting}
            icon={<DownloadIcon />}
          >
            Last ned {format.toUpperCase()}
          </Button>
        </VStack>
      </div>

      <div className="dashboard-card">
        <VStack gap="4">
          <Heading size="small">Aktive filtre</Heading>

          <Box>
            {params.app && (
              <BodyShort size="small" spacing>
                <strong>App:</strong> {params.app}
              </BodyShort>
            )}
            {params.feedbackId && (
              <BodyShort size="small" spacing>
                <strong>Survey:</strong> {params.feedbackId}
              </BodyShort>
            )}
            {params.from && (
              <BodyShort size="small" spacing>
                <strong>Fra:</strong> {dayjs(params.from).format("DD.MM.YYYY")}
              </BodyShort>
            )}
            {params.to && (
              <BodyShort size="small" spacing>
                <strong>Til:</strong> {dayjs(params.to).format("DD.MM.YYYY")}
              </BodyShort>
            )}
            {params.medTekst === "true" && (
              <BodyShort size="small" spacing>
                <strong>Filter:</strong> Kun med tekst
              </BodyShort>
            )}
            {params.lavRating === "true" && (
              <BodyShort size="small" spacing>
                <strong>Filter:</strong> Kun lave vurderinger (1-2)
              </BodyShort>
            )}
            {params.stjerne === "true" && (
              <BodyShort size="small" spacing>
                <strong>Filter:</strong> Kun stjernede
              </BodyShort>
            )}
            {params.deviceType && (
              <BodyShort size="small" spacing>
                <strong>Enhet:</strong>{" "}
                {params.deviceType === "mobile"
                  ? "Mobil"
                  : params.deviceType === "desktop"
                    ? "Desktop"
                    : "Alle"}
              </BodyShort>
            )}
          </Box>

          <BodyShort size="small" textColor="subtle">
            Eksporten inkluderer alle svar med metadata (enhet, side, tidspunkt)
            som matcher filtrene (maks 10 000).
          </BodyShort>
        </VStack>
      </div>
    </div>
  );
}
