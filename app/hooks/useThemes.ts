import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createThemeServerFn,
  deleteThemeServerFn,
  fetchThemesServerFn,
  updateThemeServerFn,
} from "~/server/actions/themes";
import type { CreateThemeInput, UpdateThemeInput } from "~/types/api";

/**
 * Hook for managing text themes (CRUD operations).
 * Provides queries and mutations with automatic cache invalidation.
 */
export function useThemes() {
  const queryClient = useQueryClient();

  const themesQuery = useQuery({
    queryKey: ["themes"],
    queryFn: () => fetchThemesServerFn(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateThemeInput) =>
      createThemeServerFn({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["themes"] });
      // Also invalidate discovery stats since themes affect grouping
      queryClient.invalidateQueries({ queryKey: ["discoveryStats"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      themeId,
      ...input
    }: UpdateThemeInput & { themeId: string }) =>
      updateThemeServerFn({ data: { themeId, ...input } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["themes"] });
      queryClient.invalidateQueries({ queryKey: ["discoveryStats"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (themeId: string) => deleteThemeServerFn({ data: { themeId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["themes"] });
      queryClient.invalidateQueries({ queryKey: ["discoveryStats"] });
    },
  });

  return {
    themes: themesQuery.data ?? [],
    isLoading: themesQuery.isLoading,
    error: themesQuery.error,

    createTheme: createMutation.mutate,
    isCreating: createMutation.isPending,

    updateTheme: updateMutation.mutate,
    isUpdating: updateMutation.isPending,

    deleteTheme: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}
