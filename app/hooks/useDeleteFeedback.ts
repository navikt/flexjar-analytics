import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteFeedbackServerFn } from "~/server/actions";

export function useDeleteFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteFeedbackServerFn({ data: { id } }),
    onSuccess: () => {
      // Invalidate feedback queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}
