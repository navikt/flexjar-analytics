import { useQuery } from "@tanstack/react-query";

/**
 * Hook to fetch surveys grouped by app.
 * Returns a mapping of app name -> array of survey feedbackIds
 */
export function useSurveysByApp() {
  return useQuery<Record<string, string[]>>({
    queryKey: ["surveysByApp"],
    queryFn: async () => {
      const response = await fetch(`/api/backend/api/v1/intern/feedback/surveys`);
      if (!response.ok) {
        throw new Error("Failed to fetch surveys");
      }
      return response.json();
    },
    staleTime: 60000, // 1 minute - these don't change often
  });
}
