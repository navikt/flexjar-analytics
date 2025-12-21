import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteSurveyServerFn } from "~/server/actions";

export function useDeleteSurvey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (surveyId: string) =>
      deleteSurveyServerFn({ data: { surveyId } }),
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["surveysByApp"] });
      queryClient.invalidateQueries({ queryKey: ["filterOptions"] });
    },
  });
}
