import { describe, expect, it } from "vitest";
import {
  generateSurveyData,
  getMockDiscoveryStats,
  getMockTaskPriorityStats,
  getMockTopTasksStats,
} from "~/mock/mockData";

describe("Mock Data Generation", () => {
  it("should generate items from topics", () => {
    const items = generateSurveyData(10, {
      app: "test-app",
      surveyId: "test-survey",
      basePath: "/test",
      topics: [
        { rating: 5, comments: ["Bra"], tags: ["Tag1"] },
        { rating: 1, comments: ["Dårlig"], tags: ["Tag2"] },
      ],
      questions: { ratingLabel: "Rating" },
    });

    expect(items).toHaveLength(10);
    expect(items[0].surveyId).toBe("test-survey");
    expect(items[0].answers).toHaveLength(1); // Only rating by default
  });

  it("should generate discovery stats correctly", () => {
    const params = new URLSearchParams();
    const stats = getMockDiscoveryStats(params);

    expect(stats.totalSubmissions).toBeGreaterThan(0);
    expect(stats.themes.length).toBeGreaterThan(0);
    expect(stats.wordFrequency.length).toBeGreaterThan(0);
    expect(stats.recentResponses.length).toBeGreaterThan(0);

    // Check structure of a response
    const firstResponse = stats.recentResponses[0];
    expect(firstResponse).toHaveProperty("task");
    expect(firstResponse).toHaveProperty("success");
    expect(["yes", "partial", "no"]).toContain(firstResponse.success);
  });

  it("should generate task priority stats correctly", () => {
    const params = new URLSearchParams();
    const stats = getMockTaskPriorityStats(params);

    expect(stats.totalSubmissions).toBeGreaterThan(0);
    expect(stats.tasks.length).toBeGreaterThan(0);
    expect(stats.longNeckCutoff).toBeGreaterThan(0);

    // Check that votes are counted
    const totalVotes = stats.tasks.reduce((acc, t) => acc + t.votes, 0);
    expect(totalVotes).toBeGreaterThan(0);

    // Check percentage calculation
    if (stats.tasks.length > 0) {
      const task = stats.tasks[0];
      expect(task.percentage).toBeDefined();
      expect(task.percentage).toBeLessThanOrEqual(100);
    }
  });

  it("should generate top tasks stats correctly with optimizations", () => {
    // const items = generateTopTasksMockData(); // implicit in stats
    const stats = getMockTopTasksStats(new URLSearchParams());

    expect(stats.totalSubmissions).toBeGreaterThan(0);
    expect(stats.tasks.length).toBeGreaterThan(0);

    // Check TPI fields
    expect(stats.overallTpi).toBeDefined();
    expect(stats.avgCompletionTimeMs).toBeDefined();

    // Check Other percentage calculation
    // We know "annet" is in the task list in generators.ts
    const hasOther = stats.tasks.some((t) =>
      t.task.toLowerCase().includes("annet"),
    );
    if (hasOther) {
      // Validation: percentage should be a number between 0 and 100
      expect(stats.otherTasksPercentage).toBeGreaterThanOrEqual(0);
      expect(stats.otherTasksPercentage).toBeLessThanOrEqual(100);
    }

    // Check duration aggregation
    const taskWithDuration = stats.tasks.find((t) => t.totalCount > 0);
    expect(taskWithDuration?.avgTimeMs).toBeGreaterThan(0);
  });
});
