import { DistributionStatus, DistributionDate } from "@/types/generated/ContentQueryApiV2";
import { DistributionContent } from "@/types/generated/ExperienceRawServiceApi";

export type ExperienceState = "draft" | "ready" | "in_review" | "unpublished";

interface ExperienceStateParams {
  experienceStatus?: DistributionStatus;
  mediaStatus?: DistributionStatus;
  experienceDate?: DistributionDate;
}

interface TranslationStateParams {
  experienceStatus?: DistributionStatus;
  experienceDate?: DistributionDate;
}
/**
 * Determines the state of an experience
 */
export function getExperienceState({
  experienceStatus,
  mediaStatus,
  experienceDate,
}: ExperienceStateParams): ExperienceState {
  if (experienceStatus === "UNPUBLISHED") {
    return "unpublished";
  }
  if (
    (experienceStatus === "READY" || experienceStatus === "SENT") &&
    (mediaStatus === "READY" || mediaStatus === "SENT")
  ) {
    return "ready";
  }
  if (experienceDate && (experienceStatus === "NOT_READY" || mediaStatus === "NOT_READY")) {
    return "in_review";
  }
  return "draft";
}

/**
 * Determines the state of a translation
 */
export function getTranslationState({ experienceStatus, experienceDate }: TranslationStateParams): ExperienceState {
  if (experienceStatus === "UNPUBLISHED") {
    return "unpublished";
  }
  if (experienceStatus === "READY" || experienceStatus === "SENT") {
    return "ready";
  }
  if (experienceDate && experienceStatus === "NOT_READY") {
    return "in_review";
  }
  return "draft";
}

/**
 * A wrapper that returns the experience state from a Distribution Content response.
 */
export function getDistributionState(response: DistributionContent) {
  const mediaStatus = response.media_content?.distribution_status;
  const englishTranslation = response.translation_content_list?.find((content) => content.language_code === "en");
  const experienceStatus = englishTranslation ? englishTranslation.distribution_status : undefined;
  const experienceDate = response.media_content?.distribution_date;

  const params: ExperienceStateParams = {
    experienceStatus,
    mediaStatus,
    experienceDate,
  };

  return getExperienceState(params);
}
