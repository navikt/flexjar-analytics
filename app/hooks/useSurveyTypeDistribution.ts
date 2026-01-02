import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchSurveyTypeDistributionServerFn } from "~/server/actions/fetchSurveyTypeDistribution";
import type { SurveyType } from "~/types/api";

export interface SurveyTypeCount {
  type: SurveyType;
  count: number;
  percentage: number;
}

export interface SurveyTypeDistributionData {
  totalSurveys: number;
  distribution: SurveyTypeCount[];
}

export function useSurveyTypeDistribution() {
  return useQuery({
    queryKey: ["surveyTypeDistribution"],
    queryFn: () => fetchSurveyTypeDistributionServerFn(),
    placeholderData: keepPreviousData,
  });
}
