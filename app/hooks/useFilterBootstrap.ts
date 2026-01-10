import { useQuery } from "@tanstack/react-query";
import { fetchFilterBootstrapServerFn } from "~/server/actions";
import type { FilterBootstrapResponse } from "~/types/schemas";

/**
 * Hook to fetch filter bootstrap data.
 *
 * Provides all data needed for FilterBar dropdowns in a single request:
 * - apps: List of available apps for the team
 * - surveysByApp: Surveys grouped by app
 * - tags: All available tags
 * - deviceTypes: Available device types
 *
 * This data is cached with a long staleTime (5 minutes) since it changes rarely.
 *
 * @example
 * ```tsx
 * function FilterBar() {
 *   const { data: bootstrap } = useFilterBootstrap();
 *
 *   return (
 *     <Select>
 *       {bootstrap?.apps.map(app => (
 *         <option key={app}>{app}</option>
 *       ))}
 *     </Select>
 *   );
 * }
 * ```
 */
export function useFilterBootstrap() {
  return useQuery<FilterBootstrapResponse>({
    queryKey: ["filterBootstrap"],
    queryFn: () => fetchFilterBootstrapServerFn(),
    staleTime: 5 * 60 * 1000, // 5 minutes - bootstrap data changes rarely
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache longer
  });
}
