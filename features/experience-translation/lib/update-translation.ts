import {
  commitCustomHighlights,
  CustomHighlightOptions,
} from "@/features/experience-highlights/lib/commit-custom-highlights";
import { allCustomHighlights } from "@/features/experience-highlights/lib/get-all-custom-highlights";
import { ExperienceTranslation } from "@/types/generated/ContentCommandApi";
import { useContentCommandApi } from "@/composables/useContentCommandApi";
import { ExperienceFlowCode, ExperienceStatusCode } from "@/types/DocumentStatuses";

export async function updateTranslation(
  translationId: string,
  updatedValues: {
    translation: ExperienceTranslation;
    highlights: allCustomHighlights;
  }
) {
  const { putTranslation } = useContentCommandApi();
  const { highlights, translation } = updatedValues;

  const highlightOptions: CustomHighlightOptions = {
    curationFlowCode: translation.flow_code as ExperienceFlowCode,
    toBeEditedStatusCode: translation.status_code as ExperienceStatusCode,
  };

  const translationUpdatePromise = putTranslation(`experience-translations/${translationId}`, translation);

  const customHighlightPromise = commitCustomHighlights(
    translation.experience_id,
    "highlights",
    highlights.custom_highlights,
    highlightOptions
  );

  const customImportantInfoPromise = commitCustomHighlights(
    translation.experience_id,
    "important_information",
    highlights.custom_important_information,
    highlightOptions
  );

  const customIncludedPromise = commitCustomHighlights(
    translation.experience_id,
    "included",
    highlights.custom_included,
    highlightOptions
  );

  const customNonIncludedPromise = commitCustomHighlights(
    translation.experience_id,
    "non_included",
    highlights.custom_non_included,
    highlightOptions
  );

  return Promise.all([
    translationUpdatePromise,
    customHighlightPromise,
    customImportantInfoPromise,
    customIncludedPromise,
    customNonIncludedPromise,
  ]);
}
