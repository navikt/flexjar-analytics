import { useQuery } from "@tanstack/react-query";
import { fetchSurveysByApp } from "./api";

/**
 * Hook to fetch surveys grouped by app.
 * Returns a mapping of app name -> array of survey feedbackIds
 */
export function useSurveysByApp() {
  return useQuery<Record<string, string[]>>({
    queryKey: ["surveysByApp"],
    queryFn: () => fetchSurveysByApp(),
    staleTime: 60000, // 1 minute - these don't change often
  });
}
