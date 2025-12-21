import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteFeedbackServerFn } from "./serverFunctions";

export function useDeleteFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (feedbackId: string) =>
      deleteFeedbackServerFn({ data: { feedbackId } }),
    onSuccess: () => {
      // Invalidate feedback queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}
