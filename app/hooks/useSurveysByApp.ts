import { useQuery } from "@tanstack/react-query";
import { fetchSurveysByAppServerFn } from "~/server/actions";

/**
 * Hook to fetch surveys grouped by app.
 * Returns a mapping of app name -> array of surveyIds
 */
export function useSurveysByApp() {
  return useQuery({
    queryKey: ["surveysByApp"],
    queryFn: () => fetchSurveysByAppServerFn(),
    staleTime: 60000, // 1 minute - these don't change often
  });
}
