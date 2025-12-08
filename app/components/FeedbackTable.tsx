import { Table, Pagination, CopyButton, Button, Tag, BodyShort, Skeleton, Alert, HStack, Tooltip, Box, VStack, Label, Detail } from "@navikt/ds-react";
import { ChevronDownIcon, ChevronUpIcon, ShieldLockIcon, StarIcon, ChatIcon } from "@navikt/aksel-icons";
import React, { useState } from "react";
import { useFeedback } from "~/lib/useFeedback";
import { useSearchParams } from "~/lib/useSearchParams";
import type { FeedbackDto, Answer } from "~/lib/api";
import dayjs from "dayjs";

// Dark mode compatible colors
const COLORS = {
  textMuted: "rgba(255, 255, 255, 0.6)",
  iconWarning: "#FBBF24", // Yellow/amber
  iconInfo: "#60A5FA",    // Blue
};

export function FeedbackTable() {
  const { params, setParam } = useSearchParams();
  const page = parseInt(params.page || "1", 10);
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
                <Table.DataCell><Skeleton width={24} /></Table.DataCell>
                <Table.DataCell><Skeleton width={80} /></Table.DataCell>
                <Table.DataCell><Skeleton width={300} /></Table.DataCell>
                <Table.DataCell><Skeleton width={150} /></Table.DataCell>
                <Table.DataCell><Skeleton width={40} /></Table.DataCell>
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
        <Alert variant="info">Ingen tilbakemeldinger funnet med disse filtrene</Alert>
      ) : (
        <>
          <div className="table-wrapper">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell style={{ width: 40 }} />
                  <Table.HeaderCell style={{ width: 100 }}>Dato</Table.HeaderCell>
                  <Table.HeaderCell>Feedback</Table.HeaderCell>
                  <Table.HeaderCell style={{ width: 200 }}>App</Table.HeaderCell>
                  <Table.HeaderCell style={{ width: 80 }} />
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {feedbackList.map((feedback) => (
                  <React.Fragment key={feedback.id}>
                    <Table.Row onClick={() => toggleExpanded(feedback.id)} style={{ cursor: "pointer" }}>
                      <Table.DataCell>
                        <Button
                          variant="tertiary"
                          size="xsmall"
                          icon={expandedRows.has(feedback.id) ? <ChevronUpIcon /> : <ChevronDownIcon />}
                        />
                      </Table.DataCell>
                      <Table.DataCell>
                        <Tooltip content={dayjs(feedback.submittedAt).format("YYYY-MM-DD HH:mm:ss")}>
                          <BodyShort size="small">{dayjs(feedback.submittedAt).format("DD.MM.YY")}</BodyShort>
                        </Tooltip>
                      </Table.DataCell>
                      <Table.DataCell>
                        <VStack gap="1">
                          {/* Kompakt visning av alle ratings */}
                          <HStack gap="2" align="center" wrap>
                            {getAllRatings(feedback).map((r, i) => (
                              <Tooltip key={i} content={r.label}>
                                <span className="rating-emoji">{ratingToEmoji(r.rating)}</span>
                              </Tooltip>
                            ))}
                            {/* Vis første tekstsvar som preview */}
                            <BodyShort truncate style={{ maxWidth: 350 }}>
                              {getMainTextPreview(feedback) || <span style={{ color: COLORS.textMuted, fontStyle: "italic" }}>Ingen kommentar</span>}
                            </BodyShort>
                          </HStack>
                          {/* Vis survey-type og antall svar */}
                          <HStack gap="2" align="center">
                            {feedback.context?.deviceType && (
                              <Tooltip content={`${feedback.context.deviceType}${feedback.context.viewportWidth ? ` (${feedback.context.viewportWidth}px)` : ""}`}>
                                <span style={{ fontSize: "0.875rem" }}>{deviceToIcon(feedback.context.deviceType)}</span>
                              </Tooltip>
                            )}
                            <Detail textColor="subtle">
                              {feedback.surveyId}
                            </Detail>
                            {getAnswerSummary(feedback) && (
                              <Detail textColor="subtle">• {getAnswerSummary(feedback)}</Detail>
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
                          <Box.New padding="4" background="neutral-soft" borderRadius="medium">
                            <VStack gap="4">
                              {/* Grupper svar etter type for bedre oversikt */}
                              {renderExpandedAnswers(feedback.answers)}
                              
                              {/* Context info */}
                              {feedback.context && (
                                <HStack gap="4" wrap>
                                  {feedback.context.pathname && (
                                    <Tag variant="neutral" size="xsmall">📍 {feedback.context.pathname}</Tag>
                                  )}
                                  {feedback.context.deviceType && (
                                    <Tag variant="neutral" size="xsmall">
                                      {feedback.context.deviceType === "mobile" ? "📱" : feedback.context.deviceType === "tablet" ? "📱" : "🖥️"} {feedback.context.deviceType}
                                    </Tag>
                                  )}
                                  {(feedback.context.viewportWidth || feedback.context.viewportHeight) && (
                                    <Tag variant="neutral" size="xsmall">
                                      🖼️ {feedback.context.viewportWidth || "?"}×{feedback.context.viewportHeight || "?"}px
                                    </Tag>
                                  )}
                                </HStack>
                              )}
                              
                              {/* Metadata */}
                              <HStack gap="4">
                                <Detail textColor="subtle">ID: {feedback.id}</Detail>
                                <Detail textColor="subtle">Survey: {feedback.surveyId}</Detail>
                                {feedback.surveyVersion && (
                                  <Detail textColor="subtle">v{feedback.surveyVersion}</Detail>
                                )}
                              </HStack>
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
                Viser {(page - 1) * (data?.size || 10) + 1} - {Math.min(page * (data?.size || 10), data?.totalElements || 0)} av {data?.totalElements || 0}
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
    case 1: return "😡";
    case 2: return "🙁";
    case 3: return "😐";
    case 4: return "😀";
    case 5: return "😍";
    default: return "❓";
  }
}

function deviceToIcon(deviceType: string): string {
  switch (deviceType) {
    case "mobile": return "📱";
    case "tablet": return "📱";
    case "desktop": return "🖥️";
    default: return "";
  }
}

// Get all ratings from a feedback item
function getAllRatings(feedback: FeedbackDto): { label: string; rating: number }[] {
  return feedback.answers
    .filter(a => a.fieldType === "RATING" && a.value.type === "rating")
    .map(a => ({
      label: a.question.label,
      rating: (a.value as { type: "rating"; rating: number }).rating,
    }));
}

// Get the first text response as a preview
function getMainTextPreview(feedback: FeedbackDto): string | null {
  const textAnswer = feedback.answers.find(a => a.fieldType === "TEXT" && a.value.type === "text" && a.value.text);
  if (textAnswer && textAnswer.value.type === "text") {
    return textAnswer.value.text;
  }
  return null;
}

// Get a summary of answer types
function getAnswerSummary(feedback: FeedbackDto): string | null {
  const ratingCount = feedback.answers.filter(a => a.fieldType === "RATING").length;
  const textCount = feedback.answers.filter(a => a.fieldType === "TEXT" && a.value.type === "text" && a.value.text).length;
  
  const parts: string[] = [];
  if (ratingCount > 1) parts.push(`${ratingCount} vurderinger`);
  if (textCount > 0) parts.push(`${textCount} kommentar${textCount > 1 ? 'er' : ''}`);
  
  return parts.length > 0 ? parts.join(', ') : null;
}

// Render expanded view with grouped answers
function renderExpandedAnswers(answers: Answer[]) {
  const ratingAnswers = answers.filter(a => a.fieldType === "RATING");
  const textAnswers = answers.filter(a => a.fieldType === "TEXT");
  const choiceAnswers = answers.filter(a => a.fieldType === "SINGLE_CHOICE" || a.fieldType === "MULTI_CHOICE");
  
  return (
    <>
      {/* Ratings med visuell bar */}
      {ratingAnswers.length > 0 && (
        <VStack gap="3">
          {ratingAnswers.map((answer) => {
            const ratingValue = answer.value.type === "rating" ? answer.value.rating : 0;
            return (
              <VStack key={answer.fieldId} gap="1">
                <HStack gap="2" align="center">
                  <StarIcon fontSize="1rem" style={{ color: COLORS.iconWarning }} />
                  <Label size="small">{answer.question.label}</Label>
                </HStack>
                <HStack gap="2" align="center">
                  <div className="expanded-rating-bar">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span 
                        key={n} 
                        className={`expanded-rating-dot ${n <= ratingValue ? 'filled' : ''}`}
                        data-rating={n}
                      >
                        {ratingToEmoji(n)}
                      </span>
                    ))}
                  </div>
                  <BodyShort weight="semibold">{ratingValue}/5</BodyShort>
                </HStack>
              </VStack>
            );
          })}
        </VStack>
      )}

      {/* Tekstsvar */}
      {textAnswers.length > 0 && (
        <VStack gap="3">
          {textAnswers.map((answer) => (
            <VStack key={answer.fieldId} gap="1">
              <HStack gap="2" align="center">
                <ChatIcon fontSize="1rem" style={{ color: COLORS.iconInfo }} />
                <Label size="small">
                  {answer.question.label}
                  {answer.question.description && (
                    <span style={{ color: COLORS.textMuted, fontWeight: "normal" }}> ({answer.question.description})</span>
                  )}
                </Label>
              </HStack>
              <Box.New background="default" padding="3" borderRadius="medium" borderWidth="1" borderColor="neutral-subtle">
                <BodyShort style={{ whiteSpace: "pre-wrap" }}>
                  {answer.value.type === "text" && answer.value.text ? answer.value.text : <span style={{ color: COLORS.textMuted }}>Ikke utfylt</span>}
                </BodyShort>
              </Box.New>
            </VStack>
          ))}
        </VStack>
      )}

      {/* Valgsvar */}
      {choiceAnswers.length > 0 && (
        <VStack gap="3">
          {choiceAnswers.map((answer) => (
            <VStack key={answer.fieldId} gap="1">
              <Label size="small">{answer.question.label}</Label>
              <BodyShort>{formatAnswerValue(answer)}</BodyShort>
            </VStack>
          ))}
        </VStack>
      )}
    </>
  );
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
