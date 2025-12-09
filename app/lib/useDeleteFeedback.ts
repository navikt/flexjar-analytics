import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteFeedback } from "./api";

export function useDeleteFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (feedbackId: string) => deleteFeedback(feedbackId),
    onSuccess: () => {
      // Invalidate feedback queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}
