import type { FeedbackDto } from "../../lib/api";


// Dark mode compatible colors
export const COLORS = {
    textMuted: "rgba(255, 255, 255, 0.6)",
    iconWarning: "#FBBF24", // Yellow/amber
    iconInfo: "#60A5FA", // Blue
};

export function ratingToEmoji(rating: number): string {
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

export function deviceToIcon(deviceType: string): string {
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
export function getAllRatings(
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
export function getMainTextPreview(feedback: FeedbackDto): string | null {
    const textAnswer = feedback.answers.find(
        (a) => a.fieldType === "TEXT" && a.value.type === "text" && a.value.text,
    );
    if (textAnswer && textAnswer.value.type === "text") {
        return textAnswer.value.text;
    }
    return null;
}
