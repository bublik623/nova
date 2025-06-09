import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { AvailableLanguage } from "@/types/Language";
import { SERVICE_AND_MODALITIES_TITLE_TRANSLATIONS_QUERY_KEY } from "./useServiceAndModalitiesTitleTranslationsQuery";
import { OptionTranslation, ServiceCodeTranslation } from "@/types/generated/ContentCommandApi";
import { useContentCommandApi } from "@/composables/useContentCommandApi";

export const SERVICE_AND_MODALITIES_TITLE_TRANSLATIONS_MUTATION_KEY =
  "SERVICE_AND_MODALITIES_TITLE_TRANSLATIONS_MUTATION_KEY";

export type DataToUpdate = {
  servicesTranslationsToUpdate: Array<ServiceCodeTranslation>;
  modalitiesTranslationsToUpdate: Array<OptionTranslation>;
};

/**
 * This mutation save the changes made to the Asterix Service and Modalities titles translations.
 * @param experienceId the (reactive) id that identifies the experience for which you want to retrieve the data.
 * @param languageCode the (reactive) language code that identifies the language for which you want to retrieve the data.
 * @returns the query that reacts to the given experience and language.
 */
export function useServiceAndModalitiesTitleTranslationsMutation(
  experienceId: Ref<string | undefined>,
  languageCode: Ref<AvailableLanguage | undefined>
) {
  const queryClient = useQueryClient();
  const contentCommandApi = useContentCommandApi();

  return useMutation({
    mutationKey: [SERVICE_AND_MODALITIES_TITLE_TRANSLATIONS_MUTATION_KEY, experienceId, languageCode],
    mutationFn: async (translations: DataToUpdate) => {
      const serviceTranslationsSavePromises = translations.servicesTranslationsToUpdate.map((translationToUpdate) =>
        contentCommandApi.putServiceCodeTranslation(translationToUpdate)
      );
      const modalitiesTranslationsSavePromises = translations.modalitiesTranslationsToUpdate.map(
        (translationToUpdate) => contentCommandApi.putOptionTranslation(translationToUpdate)
      );

      await Promise.all([serviceTranslationsSavePromises, modalitiesTranslationsSavePromises].flat());
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: [SERVICE_AND_MODALITIES_TITLE_TRANSLATIONS_QUERY_KEY, experienceId, languageCode],
      });
    },
  });
}
