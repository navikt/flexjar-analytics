import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type DeleteSurveyResult, deleteSurvey } from "./api";

export function useDeleteSurvey() {
  const queryClient = useQueryClient();

  return useMutation<DeleteSurveyResult, Error, string>({
    mutationFn: (surveyId: string) => deleteSurvey(surveyId),
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["surveysByApp"] });
      queryClient.invalidateQueries({ queryKey: ["filterOptions"] });
    },
  });
}
