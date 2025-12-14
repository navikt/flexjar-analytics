export type SurveyType = "topTasks" | "rating" | "custom";

export interface SurveyFeatureConfig {
  showTextFilter: boolean;
  showRatingFilter: boolean;
  showDeviceFilter: boolean;
  showTagsFilter: boolean;
}

export const SURVEY_CONFIG: Record<string, SurveyFeatureConfig> = {
  topTasks: {
    showTextFilter: false, // Top tasks heavily rely on structured data
    showRatingFilter: false, // Uses success/fail tasks instead of 1-5 stars
    showDeviceFilter: true,
    showTagsFilter: true,
  },
  rating: {
    showTextFilter: true,
    showRatingFilter: true,
    showDeviceFilter: true,
    showTagsFilter: true,
  },
  default: {
    showTextFilter: true,
    showRatingFilter: true,
    showDeviceFilter: true,
    showTagsFilter: true,
  },
};

export function getSurveyFeatures(type?: string): SurveyFeatureConfig {
  if (type && SURVEY_CONFIG[type]) {
    return SURVEY_CONFIG[type];
  }
  return SURVEY_CONFIG.default;
}
