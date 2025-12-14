import { describe, expect, it } from "vitest";

// We need to export these from mockData.ts or just copy/paste for testing if they are not exported
// Since we are modifying mockData.ts, let's assume we can access the functions if we export them
// or just test the public generateSurveyData function.

// For this test, we'll focus on the public API `generateSurveyData` but check the internal logic results.

import {
  generateSurveyData,
  // @ts-ignore - these might not be exported but we can check the results
} from "./mockData";

describe("Mock Data Generation", () => {
  it("should generate items from scenarios", () => {
    const testScenarios = [
      { rating: 5, text: "Scenario 1", tags: ["Tag1"] },
      {
        rating: 1,
        text: "Scenario 2",
        tags: ["Tag2"],
        isRedacted: true,
        redactedText: "Her er et fnr: [FØDSELSNUMMER FJERNET]",
      },
    ];

    const data = generateSurveyData(4, {
      app: "test-app",
      surveyId: "test-survey",
      basePath: "/test",
      scenarios: testScenarios,
      questions: {
        ratingLabel: "Test",
        textLabel: "Test label",
      },
    });

    expect(data.length).toBe(4);

    // Check if it cycles through
    const item1 = data[0];
    const item2 = data[1];
    const item3 = data[2];

    // Item 1 should match Scenario 1
    const textAnswer1 = item1.answers.find((a) => a.fieldType === "TEXT")
      ?.value as { text: string };
    expect(textAnswer1.text).toBe("Scenario 1");
    expect(item1.tags).toContain("Tag1");

    // Item 2 should match Scenario 2 (redacted)
    const textAnswer2 = item2.answers.find((a) => a.fieldType === "TEXT")
      ?.value as { text: string };
    expect(textAnswer2.text).toBe("Her er et fnr: [FØDSELSNUMMER FJERNET]");
    expect(item2.sensitiveDataRedacted).toBe(true);

    // Item 3 should loop back to Scenario 1
    const textAnswer3 = item3.answers.find((a) => a.fieldType === "TEXT")
      ?.value as { text: string };
    expect(textAnswer3.text).toBe("Scenario 1");
  });
});
