import { Alert, BodyShort, Heading } from "@navikt/ds-react";
import { ApiErrorException, ErrorType } from "~/types/errors";

export function ErrorComponent({ error }: { error: Error }) {
  // Handle structured ApiErrors
  if (error instanceof ApiErrorException) {
    const { type, message, status } = error.error;

    if (type === ErrorType.AUTHENTICATION_ERROR || status === 401) {
      // Reload page to re-trigger auth flow if session expired
      // Or show login message
      // For now, simple message
      return (
        <Alert variant="warning" className="m-4">
          <Heading spacing size="small" level="3">
            Du er ikke logget inn
          </Heading>
          <BodyShort>
            Din sesjon har utløpt. Vennligst last inn siden på nytt.
          </BodyShort>
        </Alert>
      );
    }

    if (type === ErrorType.AUTHORIZATION_ERROR || status === 403) {
      return (
        <Alert variant="error" className="m-4">
          <Heading spacing size="small" level="3">
            Ingen tilgang
          </Heading>
          <BodyShort>Du har ikke tilgang til å se denne ressursen.</BodyShort>
          {message && (
            <BodyShort className="mt-2 text-sm text-gray-600">
              {message}
            </BodyShort>
          )}
        </Alert>
      );
    }

    if (type === ErrorType.NOT_FOUND || status === 404) {
      return (
        <Alert variant="info" className="m-4">
          <Heading spacing size="small" level="3">
            Fant ikke ressursen
          </Heading>
          <BodyShort>{message || "Vi fant ikke det du lette etter."}</BodyShort>
        </Alert>
      );
    }

    // Default ApiError handling
    return (
      <Alert variant="error" className="m-4">
        <Heading spacing size="small" level="3">
          Noe gikk galt ({status})
        </Heading>
        <BodyShort>
          {message || "En uventet feil oppstod ved kommunikasjon med serveren."}
        </BodyShort>
        {type && (
          <BodyShort className="mt-2 text-xs font-mono">{type}</BodyShort>
        )}
      </Alert>
    );
  }

  // Handle standard errors
  return (
    <Alert variant="error" className="m-4">
      <Heading spacing size="small" level="3">
        En uventet feil oppstod
      </Heading>
      <BodyShort>{error.message || "Vennligst prøv igjen senere."}</BodyShort>
    </Alert>
  );
}
