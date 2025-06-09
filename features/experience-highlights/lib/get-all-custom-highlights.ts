import { CustomHighlightsEndpoint } from "@/types/Highlights";
import { AvailableLanguage } from "@/types/Language";
import builder from "@rsql/builder";
import { emit } from "@rsql/emitter";
import { useContentCommandApi } from "@/composables/useContentCommandApi";

export type allCustomHighlights = Awaited<ReturnType<typeof getAllCustomHighlights>>;

/**
 * @description fetch all the available custom highlights for the given experience and language
 */
export async function getAllCustomHighlights(languageCode: AvailableLanguage, experienceId: string) {
  const keys: CustomHighlightsEndpoint[] = [
    "custom-highlights",
    "custom-important-information",
    "custom-included",
    "custom-non-included",
  ];
  const { getCustomHighlights } = useContentCommandApi();

  const filters = emit(
    builder.and(builder.eq("language_code", languageCode), builder.eq("experience_id", experienceId))
  );

  const promises = keys.map((key) => {
    return getCustomHighlights(key, {
      params: {
        filters,
        sort: "visualization_order",
      },
    });
  });

  const [customHighlightsData, customImportantInformationData, customIncludedData, customNonIncludedData] =
    await Promise.all(promises);

  return {
    custom_highlights: customHighlightsData.data,
    custom_important_information: customImportantInformationData.data,
    custom_included: customIncludedData.data,
    custom_non_included: customNonIncludedData.data,
  };
}
