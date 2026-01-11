import { TrashIcon } from "@navikt/aksel-icons";
import {
  Alert,
  BodyLong,
  Button,
  ConfirmationPanel,
  HStack,
  Modal,
  VStack,
} from "@navikt/ds-react";
import { useState } from "react";
import { useDeleteSurvey } from "~/hooks/useDeleteSurvey";

interface DeleteSurveyDialogProps {
  surveyId: string;
  feedbackCount: number;
  isOpen: boolean;
  onClose: () => void;
  onDeleted?: () => void;
}

export function DeleteSurveyDialog({
  surveyId,
  feedbackCount,
  isOpen,
  onClose,
  onDeleted,
}: DeleteSurveyDialogProps) {
  const [confirmed, setConfirmed] = useState(false);
  const deleteMutation = useDeleteSurvey();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(surveyId);
      setConfirmed(false);
      onClose();
      onDeleted?.();
    } catch (error) {
      // Error is handled by mutation state
    }
  };

  const handleClose = () => {
    setConfirmed(false);
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      header={{
        heading: "Slett alle svar for survey",
        icon: <TrashIcon aria-hidden />,
      }}
      width="small"
    >
      <Modal.Body>
        <VStack gap="space-16">
          <Alert variant="warning">
            Du er i ferd med å slette <strong>alle {feedbackCount} svar</strong>{" "}
            for survey <strong>"{surveyId}"</strong>. Denne handlingen kan ikke
            angres.
          </Alert>

          <BodyLong>
            Dette fjerner tekstsvarene fra tilbakemeldingene (soft delete).
            Ratings, tags og annen metadata kan fortsatt være igjen.
          </BodyLong>

          <ConfirmationPanel
            checked={confirmed}
            onChange={() => setConfirmed(!confirmed)}
            label="Ja, jeg forstår at dette fjerner tekstsvarene"
          />

          {deleteMutation.isError && (
            <Alert variant="error">
              Kunne ikke slette survey. Prøv igjen senere.
            </Alert>
          )}
        </VStack>
      </Modal.Body>

      <Modal.Footer>
        <HStack gap="space-8" justify="end">
          <Button variant="secondary" onClick={handleClose}>
            Avbryt
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={!confirmed}
            loading={deleteMutation.isPending}
          >
            Slett {feedbackCount} svar
          </Button>
        </HStack>
      </Modal.Footer>
    </Modal>
  );
}
