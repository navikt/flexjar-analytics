import {
  ChatIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ShieldLockIcon,
  StarIcon,
  TagIcon,
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
  Skeleton,
  Table,
  Tag,
  Tooltip,
  VStack,
} from "@navikt/ds-react";
import dayjs from "dayjs";
import React, { useState } from "react";
import type { Answer, FeedbackDto } from "~/lib/api";
import { useFeedback } from "~/lib/useFeedback";
import { useSearchParams } from "~/lib/useSearchParams";
import { TagEditor } from "./TagEditor";

// Dark mode compatible colors
const COLORS = {
  textMuted: "rgba(255, 255, 255, 0.6)",
  iconWarning: "#FBBF24", // Yellow/amber
  iconInfo: "#60A5FA", // Blue
};

export function FeedbackTable() {
  const { params, setParam } = useSearchParams();
  const page = Number.parseInt(params.page || "1", 10);
  const { data, isLoading, error } = useFeedback();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

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
    return (
      <div className="feedback-table">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell />
              <Table.HeaderCell>Dato</Table.HeaderCell>
              <Table.HeaderCell>Feedback</Table.HeaderCell>
              <Table.HeaderCell>App</Table.HeaderCell>
              <Table.HeaderCell />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {[1, 2, 3, 4, 5].map((i) => (
              <Table.Row key={i}>
                <Table.DataCell>
                  <Skeleton width={24} />
                </Table.DataCell>
                <Table.DataCell>
                  <Skeleton width={80} />
                </Table.DataCell>
                <Table.DataCell>
                  <Skeleton width={300} />
                </Table.DataCell>
                <Table.DataCell>
                  <Skeleton width={150} />
                </Table.DataCell>
                <Table.DataCell>
                  <Skeleton width={40} />
                </Table.DataCell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    );
  }

  const feedbackList = data?.content || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div className="feedback-table">
      {feedbackList.length === 0 ? (
        <Alert variant="info">
          Ingen tilbakemeldinger funnet med disse filtrene
        </Alert>
      ) : (
        <>
          <div className="table-wrapper">
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
                            {getAllRatings(feedback).map((r, i) => (
                              <Tooltip key={i} content={r.label}>
                                <span className="rating-emoji">
                                  {ratingToEmoji(r.rating)}
                                </span>
                              </Tooltip>
                            ))}
                            {/* Vis første tekstsvar som preview */}
                            <BodyShort truncate style={{ maxWidth: 350 }}>
                              {getMainTextPreview(feedback) || (
                                <span
                                  style={{
                                    color: COLORS.textMuted,
                                    fontStyle: "italic",
                                  }}
                                >
                                  Ingen kommentar
                                </span>
                              )}
                            </BodyShort>
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
                            {getAnswerSummary(feedback) && (
                              <Detail textColor="subtle">
                                • {getAnswerSummary(feedback)}
                              </Detail>
                            )}
                            {feedback.sensitiveDataRedacted && (
                              <Tooltip content="Sensitiv data har blitt fjernet">
                                <Tag variant="warning" size="xsmall">
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
                        <CopyButton
                          copyText={getMainTextPreview(feedback) || ""}
                          size="xsmall"
                          variant="neutral"
                        />
                      </Table.DataCell>
                    </Table.Row>
                      {expandedRows.has(feedback.id) && (
                      <Table.Row>
                        <Table.DataCell colSpan={5}>
                          <Box.New
                            padding="5"
                            background="neutral-soft"
                            borderRadius="medium"
                          >
                            <VStack gap="5">
                              {/* Grupper svar etter type for bedre oversikt */}
                              {renderExpandedAnswers(feedback.answers)}

                              {/* Tags - editable */}
                              <div className="expanded-section">
                                <Label size="small" className="expanded-section-label">
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
                                <div className="expanded-section">
                                  <Label size="small" className="expanded-section-label">
                                    Kontekst
                                  </Label>
                                  <div className="context-grid">
                                    {feedback.context.pathname && (
                                      <div className="context-item">
                                        <span className="context-icon">📍</span>
                                        <div className="context-content">
                                          <span className="context-label">Side</span>
                                          <span className="context-value">{feedback.context.pathname}</span>
                                        </div>
                                      </div>
                                    )}
                                    {feedback.context.deviceType && (
                                      <div className="context-item">
                                        <span className="context-icon">
                                          {feedback.context.deviceType === "mobile"
                                            ? "📱"
                                            : feedback.context.deviceType === "tablet"
                                              ? "📱"
                                              : "🖥️"}
                                        </span>
                                        <div className="context-content">
                                          <span className="context-label">Enhet</span>
                                          <span className="context-value">{feedback.context.deviceType}</span>
                                        </div>
                                      </div>
                                    )}
                                    {(feedback.context.viewportWidth ||
                                      feedback.context.viewportHeight) && (
                                      <div className="context-item">
                                        <span className="context-icon">🖼️</span>
                                        <div className="context-content">
                                          <span className="context-label">Skjermstørrelse</span>
                                          <span className="context-value">
                                            {feedback.context.viewportWidth || "?"}×
                                            {feedback.context.viewportHeight || "?"}
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Metadata */}
                              <div className="expanded-metadata">
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
    </div>
  );
}

function ratingToEmoji(rating: number): string {
  switch (rating) {
    case 1:
      return "😡";
    case 2:
      return "🙁";
    case 3:
      return "😐";
    case 4:
      return "😀";
    case 5:
      return "😍";
    default:
      return "❓";
  }
}

function deviceToIcon(deviceType: string): string {
  switch (deviceType) {
    case "mobile":
      return "📱";
    case "tablet":
      return "📱";
    case "desktop":
      return "🖥️";
    default:
      return "";
  }
}

// Get all ratings from a feedback item
function getAllRatings(
  feedback: FeedbackDto,
): { label: string; rating: number }[] {
  return feedback.answers
    .filter((a) => a.fieldType === "RATING" && a.value.type === "rating")
    .map((a) => ({
      label: a.question.label,
      rating: (a.value as { type: "rating"; rating: number }).rating,
    }));
}

// Get the first text response as a preview
function getMainTextPreview(feedback: FeedbackDto): string | null {
  const textAnswer = feedback.answers.find(
    (a) => a.fieldType === "TEXT" && a.value.type === "text" && a.value.text,
  );
  if (textAnswer && textAnswer.value.type === "text") {
    return textAnswer.value.text;
  }
  return null;
}

// Get a summary of answer types
function getAnswerSummary(feedback: FeedbackDto): string | null {
  const ratingCount = feedback.answers.filter(
    (a) => a.fieldType === "RATING",
  ).length;
  const textCount = feedback.answers.filter(
    (a) => a.fieldType === "TEXT" && a.value.type === "text" && a.value.text,
  ).length;

  const parts: string[] = [];
  if (ratingCount > 1) parts.push(`${ratingCount} vurderinger`);
  if (textCount > 0)
    parts.push(`${textCount} kommentar${textCount > 1 ? "er" : ""}`);

  return parts.length > 0 ? parts.join(", ") : null;
}

// Render expanded view - preserves original form order
function renderExpandedAnswers(answers: Answer[]) {
  return (
    <div className="expanded-section">
      <Label size="small" className="expanded-section-label">
        Svar ({answers.length} {answers.length === 1 ? "felt" : "felter"})
      </Label>
      <div className="survey-answers-list">
        {answers.map((answer, index) => (
          <div key={answer.fieldId} className="survey-answer-item">
            <div className="survey-answer-number">{index + 1}</div>
            {renderAnswer(answer)}
          </div>
        ))}
      </div>
    </div>
  );
}

// Render a single answer based on its type
function renderAnswer(answer: Answer) {
  switch (answer.fieldType) {
    case "RATING": {
      const ratingValue =
        answer.value.type === "rating" ? answer.value.rating : 0;
      return (
        <div className="answer-card answer-card--rating">
          <div className="answer-header">
            <StarIcon fontSize="1rem" style={{ color: COLORS.iconWarning }} />
            <span className="answer-label">{answer.question.label}</span>
          </div>
          <div className="answer-content">
            <div className="expanded-rating-bar">
              {[1, 2, 3, 4, 5].map((n) => (
                <span
                  key={n}
                  className={`expanded-rating-dot ${n <= ratingValue ? "filled" : ""}`}
                  data-rating={n}
                >
                  {ratingToEmoji(n)}
                </span>
              ))}
            </div>
            <span className="rating-answer-score">{ratingValue}/5</span>
          </div>
        </div>
      );
    }
    case "TEXT":
      return (
        <div className="answer-card answer-card--text">
          <div className="answer-header">
            <ChatIcon fontSize="1rem" style={{ color: COLORS.iconInfo }} />
            <span className="answer-label">
              {answer.question.label}
              {answer.question.description && (
                <span className="answer-description">
                  {" "}— {answer.question.description}
                </span>
              )}
            </span>
          </div>
          <div className="answer-content answer-content--text">
            {answer.value.type === "text" && answer.value.text ? (
              answer.value.text
            ) : (
              <span className="answer-empty">Ikke utfylt</span>
            )}
          </div>
        </div>
      );
    case "SINGLE_CHOICE":
    case "MULTI_CHOICE": {
      const selectedIds =
        answer.value.type === "singleChoice"
          ? [answer.value.selectedOptionId]
          : answer.value.type === "multiChoice"
            ? answer.value.selectedOptionIds
            : [];
      const options = answer.question.options || [];

      return (
        <div className="answer-card answer-card--choice">
          <div className="answer-header">
            <span className="answer-type-icon">☑️</span>
            <span className="answer-label">{answer.question.label}</span>
          </div>
          <div className="answer-content answer-content--choice">
            {options.length > 0 ? (
              <div className="choice-options">
                {options.map((opt) => (
                  <span
                    key={opt.id}
                    className={`choice-option ${selectedIds.includes(opt.id) ? "choice-option--selected" : ""}`}
                  >
                    {selectedIds.includes(opt.id) ? "✓ " : ""}
                    {opt.label}
                  </span>
                ))}
              </div>
            ) : (
              <span>{selectedIds.join(", ") || "Ingen valgt"}</span>
            )}
          </div>
        </div>
      );
    }
    case "DATE":
      return (
        <div className="answer-card answer-card--date">
          <div className="answer-header">
            <span className="answer-type-icon">📅</span>
            <span className="answer-label">{answer.question.label}</span>
          </div>
          <div className="answer-content">
            {answer.value.type === "date" ? answer.value.date : "—"}
          </div>
        </div>
      );
    default:
      return null;
  }
}

function formatAnswerValue(answer: Answer): string {
  switch (answer.value.type) {
    case "rating":
      return `${ratingToEmoji(answer.value.rating)} (${answer.value.rating})`;
    case "text":
      return answer.value.text || "—";
    case "singleChoice":
      return answer.value.selectedOptionId;
    case "multiChoice":
      return answer.value.selectedOptionIds.join(", ") || "—";
    case "date":
      return answer.value.date;
    default:
      return "—";
  }
}
