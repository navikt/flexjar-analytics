import { ChatIcon, StarIcon } from "@navikt/aksel-icons";
import type { Answer } from "~/lib/api";
import { COLORS, ratingToEmoji } from "./utils";

// Render a single answer based on its type
export function RenderAnswer({ answer }: { answer: Answer }) {
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
