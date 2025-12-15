import {
  ChevronDownIcon,
  ChevronUpIcon,
  ShieldLockIcon,
  TagIcon,
  TrashIcon,
} from "@navikt/aksel-icons";
import {
  Alert,
  BodyShort,
  Box,
  Button,
  CopyButton,
  Detail,
  HStack,
  Label,
  Pagination,
  Table,
  Tag,
  Tooltip,
  VStack,
} from "@navikt/ds-react";
import dayjs from "dayjs";
import React, { useState } from "react";

import { useDeleteFeedback } from "~/lib/useDeleteFeedback";
import { useFeedback } from "~/lib/useFeedback";
import { useSearchParams } from "~/lib/useSearchParams";
import { DeleteFeedbackDialog } from "./DeleteFeedbackDialog";
import { DeleteSurveyDialog } from "./DeleteSurveyDialog";
import styles from "./FeedbackTable/FeedbackTable.module.css";
import { FeedbackTableSkeleton } from "./FeedbackTable/FeedbackTableSkeleton";
import { TagEditor } from "./TagEditor";
import { TimelineView } from "./feedback/TimelineView";
import {
  deviceToIcon,
  getAllRatings,
  getFeedbackPreview,
  getMainTextPreview,
  ratingToEmoji,
} from "./feedback/utils";

export function FeedbackTable() {
  const { params, setParam } = useSearchParams();
  const page = Number.parseInt(params.page || "1", 10);
  const { data, isLoading, error } = useFeedback();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState<string | null>(null);
  const deleteFeedbackMutation = useDeleteFeedback();

  const toggleExpanded = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (error) {
    return <Alert variant="error">Kunne ikke laste tilbakemeldinger</Alert>;
  }

  if (isLoading) {
    return <FeedbackTableSkeleton />;
  }

  const feedbackList = data?.content || [];
  const totalPages = data?.totalPages || 1;
  const totalElements = data?.totalElements || 0;
  const selectedSurvey = params.feedbackId;

  return (
    <div className={styles.table}>
      {/* Toolbar with actions when survey is selected */}
      {selectedSurvey && totalElements > 0 && (
        <div className={styles.toolbar}>
          <HStack justify="space-between" align="center">
            <BodyShort size="small" textColor="subtle">
              Viser {totalElements} svar for <strong>{selectedSurvey}</strong>
            </BodyShort>
            <Tooltip
              content={`Slett alle ${totalElements} svar for denne surveyen`}
            >
              <Button
                variant="danger"
                size="small"
                icon={<TrashIcon />}
                onClick={() => setDeleteDialogOpen(true)}
              >
                Slett alle svar
              </Button>
            </Tooltip>
          </HStack>
        </div>
      )}

      {feedbackList.length === 0 ? (
        <Alert variant="info">
          Ingen tilbakemeldinger funnet med disse filtrene
        </Alert>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell style={{ width: 40 }} />
                  <Table.HeaderCell style={{ width: 100 }}>
                    Dato
                  </Table.HeaderCell>
                  <Table.HeaderCell>Feedback</Table.HeaderCell>
                  <Table.HeaderCell style={{ width: 200 }}>
                    App
                  </Table.HeaderCell>
                  <Table.HeaderCell style={{ width: 80 }} />
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {feedbackList.map((feedback) => (
                  <React.Fragment key={feedback.id}>
                    <Table.Row
                      onClick={() => toggleExpanded(feedback.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <Table.DataCell>
                        <Button
                          variant="tertiary"
                          size="xsmall"
                          icon={
                            expandedRows.has(feedback.id) ? (
                              <ChevronUpIcon />
                            ) : (
                              <ChevronDownIcon />
                            )
                          }
                        />
                      </Table.DataCell>
                      <Table.DataCell>
                        <Tooltip
                          content={dayjs(feedback.submittedAt).format(
                            "YYYY-MM-DD HH:mm:ss",
                          )}
                        >
                          <BodyShort size="small">
                            {dayjs(feedback.submittedAt).format("DD.MM.YY")}
                          </BodyShort>
                        </Tooltip>
                      </Table.DataCell>
                      <Table.DataCell>
                        <VStack gap="1">
                          {/* Kompakt visning av alle ratings */}
                          <HStack gap="2" align="center" wrap>
                            {getAllRatings(feedback).map((r) => (
                              <Tooltip key={r.label} content={r.label}>
                                <span className={styles.ratingEmoji}>
                                  {ratingToEmoji(r.rating)}
                                </span>
                              </Tooltip>
                            ))}
                            {/* Smart preview */}
                            {(() => {
                              const preview = getFeedbackPreview(feedback);
                              if (preview) {
                                return (
                                  <VStack gap="0">
                                    <BodyShort
                                      truncate
                                      style={{ maxWidth: 350, fontWeight: 500 }}
                                    >
                                      {preview.text}
                                    </BodyShort>
                                    {preview.subText && (
                                      <BodyShort
                                        truncate
                                        style={{
                                          maxWidth: 350,
                                          fontSize: "0.85rem",
                                          color:
                                            "var(--ax-text-neutral-subtle)",
                                        }}
                                      >
                                        {preview.subText}
                                      </BodyShort>
                                    )}
                                  </VStack>
                                );
                              }
                              return null;
                            })()}
                          </HStack>
                          {/* Vis survey-type og antall svar */}
                          <HStack gap="2" align="center">
                            {feedback.context?.deviceType && (
                              <Tooltip
                                content={`${feedback.context.deviceType}${feedback.context.viewportWidth ? ` (${feedback.context.viewportWidth}px)` : ""}`}
                              >
                                <span style={{ fontSize: "0.875rem" }}>
                                  {deviceToIcon(feedback.context.deviceType)}
                                </span>
                              </Tooltip>
                            )}
                            <Detail textColor="subtle">
                              {feedback.surveyId}
                            </Detail>
                            {feedback.tags && feedback.tags.length > 0 && (
                              <HStack gap="1" wrap>
                                {feedback.tags.slice(0, 2).map((tag) => (
                                  <Tag key={tag} variant="neutral" size="small">
                                    {tag}
                                  </Tag>
                                ))}
                                {feedback.tags.length > 2 && (
                                  <Detail textColor="subtle">
                                    +{feedback.tags.length - 2}
                                  </Detail>
                                )}
                              </HStack>
                            )}
                            {feedback.sensitiveDataRedacted && (
                              <Tooltip content="Sensitiv data har blitt fjernet">
                                <Tag variant="warning" size="small">
                                  <ShieldLockIcon /> Redigert
                                </Tag>
                              </Tooltip>
                            )}
                          </HStack>
                        </VStack>
                      </Table.DataCell>
                      <Table.DataCell>
                        <BodyShort size="small">{feedback.app}</BodyShort>
                      </Table.DataCell>
                      <Table.DataCell>
                        <HStack gap="1">
                          <CopyButton
                            copyText={getMainTextPreview(feedback) || ""}
                            size="xsmall"
                            variant="neutral"
                          />
                          <Tooltip content="Slett denne tilbakemeldingen">
                            <Button
                              variant="tertiary-neutral"
                              size="xsmall"
                              icon={<TrashIcon aria-hidden />}
                              onClick={(e) => {
                                e.stopPropagation();
                                setFeedbackToDelete(feedback.id);
                              }}
                              loading={
                                deleteFeedbackMutation.isPending &&
                                feedbackToDelete === feedback.id
                              }
                            />
                          </Tooltip>
                        </HStack>
                      </Table.DataCell>
                    </Table.Row>
                    {expandedRows.has(feedback.id) && (
                      <Table.Row className={styles.expandedRow}>
                        <Table.DataCell
                          colSpan={5}
                          className={styles.expandedCell}
                        >
                          <Box.New
                            padding="5"
                            background="neutral-soft"
                            borderRadius="medium"
                          >
                            <VStack gap="5">
                              {/* Grupper svar etter type for bedre oversikt */}
                              <div className={styles.expandedSection}>
                                <Label
                                  size="small"
                                  className={styles.expandedSectionLabel}
                                >
                                  Svar ({feedback.answers.length})
                                </Label>
                                <TimelineView
                                  answers={feedback.answers}
                                  styles={styles}
                                />
                              </div>

                              {/* Tags - editable */}
                              <div className={styles.expandedSection}>
                                <Label
                                  size="small"
                                  className={styles.expandedSectionLabel}
                                >
                                  <HStack gap="1" align="center">
                                    <TagIcon fontSize="1rem" />
                                    Tags
                                  </HStack>
                                </Label>
                                <TagEditor
                                  feedbackId={feedback.id}
                                  currentTags={feedback.tags || []}
                                />
                              </div>

                              {/* Context info */}
                              {feedback.context && (
                                <div className={styles.expandedSection}>
                                  <Label
                                    size="small"
                                    className={styles.expandedSectionLabel}
                                  >
                                    Kontekst
                                  </Label>
                                  <div className={styles.contextGrid}>
                                    {feedback.context.pathname && (
                                      <div className={styles.contextItem}>
                                        <span className={styles.contextIcon}>
                                          📍
                                        </span>
                                        <div className={styles.contextContent}>
                                          <span className={styles.contextLabel}>
                                            Side
                                          </span>
                                          <span className={styles.contextValue}>
                                            {feedback.context.pathname}
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                    {feedback.context.deviceType && (
                                      <div className={styles.contextItem}>
                                        <span className={styles.contextIcon}>
                                          {feedback.context.deviceType ===
                                          "mobile"
                                            ? "📱"
                                            : feedback.context.deviceType ===
                                                "tablet"
                                              ? "📱"
                                              : "🖥️"}
                                        </span>
                                        <div className={styles.contextContent}>
                                          <span className={styles.contextLabel}>
                                            Enhet
                                          </span>
                                          <span className={styles.contextValue}>
                                            {feedback.context.deviceType}
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                    {(feedback.context.viewportWidth ||
                                      feedback.context.viewportHeight) && (
                                      <div className={styles.contextItem}>
                                        <span className={styles.contextIcon}>
                                          🖼️
                                        </span>
                                        <div className={styles.contextContent}>
                                          <span className={styles.contextLabel}>
                                            Skjermstørrelse
                                          </span>
                                          <span className={styles.contextValue}>
                                            {feedback.context.viewportWidth ||
                                              "?"}
                                            ×
                                            {feedback.context.viewportHeight ||
                                              "?"}
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Metadata */}
                              <div className={styles.metadata}>
                                <Detail textColor="subtle">
                                  ID: {feedback.id}
                                </Detail>
                                <Detail textColor="subtle">
                                  Survey: {feedback.surveyId}
                                </Detail>
                                {feedback.surveyVersion && (
                                  <Detail textColor="subtle">
                                    v{feedback.surveyVersion}
                                  </Detail>
                                )}
                              </div>
                            </VStack>
                          </Box.New>
                        </Table.DataCell>
                      </Table.Row>
                    )}
                  </React.Fragment>
                ))}
              </Table.Body>
            </Table>
          </div>

          <Box padding="4">
            <HStack justify="space-between" align="center">
              <BodyShort size="small">
                Viser {(page - 1) * (data?.size || 10) + 1} -{" "}
                {Math.min(page * (data?.size || 10), data?.totalElements || 0)}{" "}
                av {data?.totalElements || 0}
              </BodyShort>
              <Pagination
                page={page}
                count={totalPages}
                onPageChange={(p) => setParam("page", String(p))}
                size="small"
              />
            </HStack>
          </Box>
        </>
      )}

      {/* Delete survey confirmation dialog */}
      {selectedSurvey && (
        <DeleteSurveyDialog
          surveyId={selectedSurvey}
          feedbackCount={totalElements}
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onDeleted={() => setParam("feedbackId", undefined)}
        />
      )}

      {/* Delete single feedback confirmation dialog */}
      <DeleteFeedbackDialog
        feedbackId={feedbackToDelete}
        onClose={() => setFeedbackToDelete(null)}
        onConfirm={() => {
          if (feedbackToDelete) {
            deleteFeedbackMutation.mutate(feedbackToDelete, {
              onSuccess: () => setFeedbackToDelete(null),
            });
          }
        }}
        isPending={deleteFeedbackMutation.isPending}
      />
    </div>
  );
}
