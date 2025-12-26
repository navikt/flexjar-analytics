import {
  ArrowsCirclepathIcon,
  DownloadIcon,
  FileExcelIcon,
  FilesIcon,
} from "@navikt/aksel-icons";
import {
  Alert,
  BodyShort,
  Button,
  HStack,
  Heading,
  Radio,
  RadioGroup,
  VStack,
} from "@navikt/ds-react";
import dayjs from "dayjs";
import { useState } from "react";
import { DashboardCard, DashboardGrid } from "~/components/DashboardComponents";
import { useSearchParams } from "~/hooks/useSearchParams";
import { exportServerFn } from "~/server/actions";

type ExportFormat = "csv" | "json" | "excel";

/**
 * Panel for exporting feedback data in various formats.
 * Uses server function for authenticated backend access.
 */
export function ExportPanel() {
  const { params } = useSearchParams();
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await exportServerFn({
        data: {
          format,
          team: params.team,
          app: params.app,
          feedbackId: params.feedbackId,
          from: params.from,
          to: params.to,
          medTekst: params.medTekst,
          fritekst: params.fritekst,
          lavRating: params.lavRating,
          deviceType: params.deviceType,
          tags: params.tags,
        },
      });

      // Convert base64 back to blob and download
      const binaryString = atob(result.data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: result.contentType });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
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
    <DashboardGrid minColumnWidth="300px">
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
      <DashboardCard padding="6">
        <VStack gap="4">
          <Heading size="small">Velg format</Heading>

          <RadioGroup
            legend="Eksportformat"
            hideLegend
            value={format}
            onChange={(val) => setFormat(val as ExportFormat)}
          >
            <Radio value="csv">
              <HStack gap="2" align="start">
                <FilesIcon style={{ marginTop: "2px" }} />
                <VStack gap="0">
                  <BodyShort weight="semibold">CSV</BodyShort>
                  <BodyShort size="small">
                    Kommaseparert fil, fungerer med Excel og andre verktøy
                  </BodyShort>
                </VStack>
              </HStack>
            </Radio>
            <Radio value="excel">
              <HStack gap="2" align="start">
                <FileExcelIcon style={{ marginTop: "2px" }} />
                <VStack gap="0">
                  <BodyShort weight="semibold">Excel (XLSX)</BodyShort>
                  <BodyShort size="small">
                    Native Excel-format med formatering
                  </BodyShort>
                </VStack>
              </HStack>
            </Radio>
            <Radio value="json">
              <HStack gap="2" align="start">
                <FilesIcon style={{ marginTop: "2px" }} />
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
      </DashboardCard>

      <DashboardCard padding="6">
        <VStack gap="4">
          <Heading size="small">Aktive filtre</Heading>
          <ActiveFilters params={params} />
          <BodyShort size="small" textColor="subtle">
            Eksporten inkluderer alle svar med metadata (enhet, side, tidspunkt)
            som matcher filtrene (maks 10 000).
          </BodyShort>
        </VStack>
      </DashboardCard>
    </DashboardGrid>
  );
}

/**
 * Displays active filter parameters in a readable format.
 */
function ActiveFilters({
  params,
}: { params: ReturnType<typeof useSearchParams>["params"] }) {
  return (
    <div style={{ display: "grid", gap: "1rem" }}>
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
    </div>
  );
}
