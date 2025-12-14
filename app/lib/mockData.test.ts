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
  it("should generate items from topics", () => {
    const testTopics = [
      { rating: 5, comments: ["Topic 1"], tags: ["Tag1"] },
      {
        rating: 1,
        comments: ["Topic 2"],
        tags: ["Tag2"],
        isRedacted: true,
      },
    ];

    const data = generateSurveyData(4, {
      app: "test-app",
      surveyId: "test-survey",
      basePath: "/test",
      topics: testTopics,
      questions: {
        ratingLabel: "Test",
        textLabel: "Test label",
      },
    });

    expect(data.length).toBe(4);

    // Check if it generates correctly
    const items = data;

    // Verify we have both types of items
    const topic1Item = items.find((i) => i.tags?.includes("Tag1"));
    const topic2Item = items.find((i) => i.tags?.includes("Tag2"));

    expect(topic1Item).toBeDefined();
    if (topic1Item) {
      const textAnswer = topic1Item.answers.find((a) => a.fieldType === "TEXT")
        ?.value as { text: string };
      expect(textAnswer.text).toBe("Topic 1");
    }

    expect(topic2Item).toBeDefined();
    if (topic2Item) {
      const textAnswer = topic2Item.answers.find((a) => a.fieldType === "TEXT")
        ?.value as { text: string };
      expect(textAnswer.text).toBe("Topic 2");
      expect(topic2Item.sensitiveDataRedacted).toBe(true);
    }
  });
});
