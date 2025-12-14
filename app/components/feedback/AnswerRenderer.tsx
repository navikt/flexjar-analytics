import {
  CalendarIcon,
  ChatIcon,
  StarIcon,
  TasklistIcon,
} from "@navikt/aksel-icons";
import {
  BodyShort,
  Detail,
  HStack,
  Label,
  Tooltip,
  VStack,
} from "@navikt/ds-react";
import type { ReactNode } from "react";
import type { Answer } from "~/lib/api";
import { COLORS, ratingToEmoji } from "./utils";

interface AnswerCardLayoutProps {
  icon: ReactNode;
  label: string;
  description?: string;
  children: ReactNode;
  className?: string; // For passing custom classes like "answer-card--rating"
}

function AnswerCardLayout({
  icon,
  label,
  description,
  children,
  className = "",
}: AnswerCardLayoutProps) {
  return (
    <div className={`answer-card ${className}`}>
      <HStack gap="4" align="start">
        <div className="answer-icon">{icon}</div>
        <VStack gap="2" style={{ flex: 1 }}>
          <div>
            <Label size="small">{label}</Label>
            {description && <Detail textColor="subtle">{description}</Detail>}
          </div>
          <div className="answer-content">{children}</div>
        </VStack>
      </HStack>
    </div>
  );
}

// Render a single answer based on its type
export function RenderAnswer({ answer }: { answer: Answer }) {
  switch (answer.fieldType) {
    case "RATING": {
      const ratingValue =
        answer.value.type === "rating" ? answer.value.rating : 0;
      return (
        <AnswerCardLayout
          className="answer-card--rating"
          icon={
            <Tooltip content="Vurdering (1-5)">
              <StarIcon
                fontSize="1.5rem"
                style={{ color: COLORS.iconWarning }}
              />
            </Tooltip>
          }
          label={answer.question.label}
          description={answer.question.description}
        >
          <HStack align="center" gap="2">
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
          </HStack>
        </AnswerCardLayout>
      );
    }
    case "TEXT":
      return (
        <AnswerCardLayout
          className="answer-card--text"
          icon={
            <Tooltip content="Fritekst">
              <ChatIcon fontSize="1.5rem" style={{ color: COLORS.iconInfo }} />
            </Tooltip>
          }
          label={answer.question.label}
          description={answer.question.description}
        >
          {answer.value.type === "text" && answer.value.text ? (
            <BodyShort>{answer.value.text}</BodyShort>
          ) : (
            <span className="answer-empty">Ikke utfylt</span>
          )}
        </AnswerCardLayout>
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
        <AnswerCardLayout
          className="answer-card--choice"
          icon={
            <Tooltip
              content={
                answer.fieldType === "MULTI_CHOICE" ? "Flervalg" : "Enkeltvalg"
              }
            >
              <TasklistIcon fontSize="1.5rem" aria-hidden />
            </Tooltip>
          }
          label={answer.question.label}
          description={answer.question.description}
        >
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
            <BodyShort>{selectedIds.join(", ") || "Ingen valgt"}</BodyShort>
          )}
        </AnswerCardLayout>
      );
    }
    case "DATE":
      return (
        <AnswerCardLayout
          className="answer-card--date"
          icon={
            <Tooltip content="Dato">
              <CalendarIcon fontSize="1.5rem" aria-hidden />
            </Tooltip>
          }
          label={answer.question.label}
          description={answer.question.description}
        >
          <BodyShort>
            {answer.value.type === "date" ? answer.value.date : "—"}
          </BodyShort>
        </AnswerCardLayout>
      );
    default:
      return null;
  }
}
