import { LanguageTranslation } from "@/types/generated/ContentCommandApi";
import { AvailableLanguage } from "@/types/Language";
import { useContentCommandApi } from "@/composables/useContentCommandApi";
import {
  automaticTranslationLanguages,
  availableLanguages,
} from "@/features/experience-masterdata/lib/masterdata-languages";

export async function sendToTranslation(experienceId: string) {
  const { translateExperience } = useContentCommandApi();

  const toTranslate: LanguageTranslation[] = [];

  availableLanguages.forEach((language) => {
    if (language !== "en") {
      toTranslate.push({
        language_code: language,
        to_be_translated: true,
        automatic_review: shouldHaveManualTranslationState(language),
      });
    }
  });

  await translateExperience(`/experiences/${experienceId}/translate`, {
    language_list: toTranslate,
  });

  function shouldHaveManualTranslationState(language: AvailableLanguage): boolean {
    // true for AUTOMATIC_TRANSLATION state
    // false for MANUAL_TRANSLATION state
    return automaticTranslationLanguages.has(language);
  }
}
