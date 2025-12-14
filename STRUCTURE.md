# Data Structure & Contract

This document outlines the data contract between the **Flexjar Widget** and the **Flexjar Analytics API**.

## Core Concept
The Widget collects answers and sends a transport payload to the backend. The Analytics backend expects a **structured** payload to correctly parse, aggregate, and display feedback.

## Widget Payload (Transport)
The transport payload is a JSON object.

### Critical Fields
*   `surveyType`: **Required** for feature detection. Must be one of:
    *   `"rating"` (Standard smiley/star feedback)
    *   `"topTasks"` (Task-completion surveys)
    *   `"custom"` (Everything else)
*   `answers`: **Required** structured array. The backend **ignores** flat fields (like `{"questionId": "value"}`) for analytics purposes; it only looks at the `answers` array.

### The `answers` Array
Each item in the `answers` array must map to the following schema:

```typescript
interface Answer {
  fieldId: string;       // The unique ID of the question (e.g. "task", "feedback")
  fieldType: string;     // One of: "RATING", "TEXT", "SINGLE_CHOICE", "MULTI_CHOICE", "DATE"
  value: AnswerValue;    // The actual answer
  question: {
    label: string;       // The question text shown to the user
    description?: string;
    options?: Option[];  // Options, if applicable (crucial for choice mapping)
  };
}

// AnswerValue variants:
// { type: "text", text: "..." }
// { type: "rating", rating: 5 }
// { type: "singleChoice", selectedOptionId: "opt_1" }
// { type: "multiChoice", selectedOptionIds: ["opt_1", "opt_2"] }
```

### Why strict structure?
1.  **Labels**: The backend aggregates by `selectedOptionId`. To show human-readable results (e.g., "Søke om sykepenger" instead of "task_123"), the backend looks up the `label` from the `question.options` provided in this payload.
2.  **Types**: Correct aggregation depends on knowing if a field is a Rating (average) or Text (count).

## Backend Maps (Enum)
The backend maps `surveyType` strings to Enums strictly:
*   `"topTasks"` -> `SurveyType.TOP_TASKS`
*   `"rating"` -> `SurveyType.RATING`
*   Everything else -> `SurveyType.CUSTOM`

> **Note**: If you add a new question type to the Widget, you MUST ensure it maps to a valid `FieldType` in standard format, or the backend will ignore it.
