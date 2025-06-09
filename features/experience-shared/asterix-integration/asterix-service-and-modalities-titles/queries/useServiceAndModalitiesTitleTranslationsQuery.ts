import { useQuery } from "@tanstack/vue-query";
import { AvailableLanguage } from "@/types/Language";
import { useContentCommandApi } from "@/composables/useContentCommandApi";
import { OptionTranslation, ServiceCodeTranslation } from "@/types/generated/ContentCommandApi";

export const SERVICE_AND_MODALITIES_TITLE_TRANSLATIONS_QUERY_KEY =
  "SERVICE_AND_MODALITIES_TITLE_TRANSLATIONS_QUERY_KEY";

export type ServiceAndModalitiesTitleTranslations = {
  asterixServicesTranslations: Array<ServiceCodeTranslation>;
  asterixModalitiesTranslations: Array<OptionTranslation>;
};

/**
 * This query fetch the translations of the Service and Modalities' titles for the given experience in the given language and returns them in a parent-child items list.
 * @param experienceId the (reactive) id that identifies the experience for which you want to retrieve the data.
 * @param languageCode the (reactive) language code that identifies the language for which you want to retrieve the data.
 * @returns the query that reacts to the given experience and language.
 */
export function useServiceAndModalitiesTitleTranslationsQuery(
  experienceId: Ref<string | undefined>,
  languageCode: Ref<AvailableLanguage | undefined>
) {
  const { getServiceCodeTranslations, getOptionTranslations } = useContentCommandApi();
  const queryEnabled = computed(() => !!experienceId.value && !!languageCode.value);

  return useQuery<ServiceAndModalitiesTitleTranslations>({
    queryKey: [SERVICE_AND_MODALITIES_TITLE_TRANSLATIONS_QUERY_KEY, experienceId, languageCode],
    queryFn: async () => {
      return await fetchTranslations(experienceId.value!, languageCode.value!);
    },
    enabled: queryEnabled,
  });

  async function fetchTranslations(experienceId: string, languageCode: AvailableLanguage) {
    const asterixServicesTranslationsPromise = getServiceCodeTranslations(experienceId, languageCode);
    const asterixModalitiesTranslationsPromise = getOptionTranslations(experienceId, languageCode);

    const [asterixServicesTranslations, asterixModalitiesTranslations] = await Promise.all([
      asterixServicesTranslationsPromise,
      asterixModalitiesTranslationsPromise,
    ]);

    return {
      asterixServicesTranslations: asterixServicesTranslations.data ?? [],
      asterixModalitiesTranslations: asterixModalitiesTranslations.data ?? [],
    };
  }
}
