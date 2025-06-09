import { AvailableLanguage } from "@/types/Language";
import { LanguageOption } from "../components/OptionLanguagesDropdown.vue";
import { OptionLanguage, Ticket } from "@/types/generated/OfferServiceApi";
import { BaseOption } from "@/types/Option";

/**
 * Map the languages from api to options for the dropdown
 * @param language - The language
 */
export function mapLanguagesPayloadToOption(language: OptionLanguage): LanguageOption {
  const { $t } = useNuxtApp();
  return {
    label: $t(`common.language.${language.language}`),
    val: language.language!,
  };
}

/**
 * Map the options to the offer service api payload
 * @param options - The options
 */
export function mapOptionsToLanguagesPayload(options: LanguageOption[]): OptionLanguage[] {
  return options.map((option) => ({ language: option.val }));
}

/**
 * Map the masterdata languages to options for the dropdown
 * @param languages - The masterdata languages
 */
export function mapMasterdataLanguagesToOptions(languages: Set<AvailableLanguage>): LanguageOption[] {
  return Array.from(languages)
    .map((language) => ({ language: language }))
    .map(mapLanguagesPayloadToOption);
}

/**
 * Get the initial languages from the allowed languages.
 * @param languages - allowed languages
 * @param limitedCapacity - is limited capacity
 */
export function getInitialLanguagesModel(
  languages: OptionLanguage[] | undefined,
  limitedCapacity: boolean
): Ticket["languages"] {
  if (!languages) return [];
  return (
    languages?.map((l) => ({
      language: l.language!,
      ...(limitedCapacity ? { capacity: 0 } : {}),
    })) ?? []
  );
}

/**
 * Map the languages from api to base options
 * @param language - The language
 */
export function mapLanguagesPayloadToBaseOption(language: OptionLanguage): BaseOption {
  const { $t } = useNuxtApp();
  return {
    label: $t(`common.language.${language.language}`),
    value: language.language!,
  };
}

/**
 * Map the masterdata languages to base options
 * @param languages - The masterdata languages
 */
export function mapMasterdataLanguagesToBaseOptions(languages: Set<AvailableLanguage>): BaseOption[] {
  return Array.from(languages)
    .map((language) => ({ language: language }))
    .map(mapLanguagesPayloadToBaseOption);
}
