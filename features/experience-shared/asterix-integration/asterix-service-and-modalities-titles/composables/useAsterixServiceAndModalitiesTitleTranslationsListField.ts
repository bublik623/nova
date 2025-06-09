import { AvailableLanguage } from "@/types/Language";
import { useServiceAndModalitiesTitleTranslationsMutation } from "../queries/useServiceAndModalitiesTitleTranslationsMutation";
import {
  ServiceAndModalitiesTitleListValue,
  serviceAndModalitiesTitleListValueSchema,
} from "../types/service-and-modalities-title-list-value";
import { useServiceAndModalitiesTitleTranslationsQuery } from "../queries/useServiceAndModalitiesTitleTranslationsQuery";
import { isEqual } from "lodash";
import { StoreField } from "@/features/experience-shared/composables/useStoreFields";
import { OptionTranslation, ServiceCodeTranslation } from "@/types/generated/ContentCommandApi";

export const serviceAndModalitiesTitleTranslationList: StoreField = {
  key: "serviceAndModalitiesTitleTranslationList",
  isRequired: true,
  schema: serviceAndModalitiesTitleListValueSchema,
};

type Translations = {
  asterixServicesTranslations: Array<ServiceCodeTranslation>;
  asterixModalitiesTranslations: Array<OptionTranslation>;
};

export function useAsterixServiceAndModalitiesTitleTranslationsListField(
  experienceId: Readonly<Ref<string | undefined>>,
  language: Readonly<Ref<AvailableLanguage | undefined>>
) {
  const titlesListTranslationsQuery = useServiceAndModalitiesTitleTranslationsQuery(experienceId, language);
  const titlesListMutation = useServiceAndModalitiesTitleTranslationsMutation(experienceId, language);

  const lastSavedValue = computed(() => mapToFieldValue(titlesListTranslationsQuery.data.value));
  const isSaving = computed(() => titlesListMutation.isPending.value);

  return {
    lastSavedValue,
    isSaving,
    save,
  };

  async function save(newValue: ServiceAndModalitiesTitleListValue) {
    if (isEqual(lastSavedValue.value, newValue)) {
      return;
    }

    const translationsToUpdate = getTranslationsToUpdate(newValue, titlesListTranslationsQuery.data.value);
    return await titlesListMutation.mutateAsync(translationsToUpdate);
  }
}

function mapToFieldValue(translations: Translations | undefined): ServiceAndModalitiesTitleListValue {
  if (!translations) {
    return [];
  }

  return translations.asterixServicesTranslations.map((serviceTranslation) => ({
    serviceCode: serviceTranslation.code,
    title: serviceTranslation.name,
    modalities: translations.asterixModalitiesTranslations
      .filter((modalityTranslation) => modalityTranslation.asx_service_code_translation_id === serviceTranslation.id)
      .map((modalityTranslation) => ({
        modalityCode: modalityTranslation.asx_modality_code!,
        title: modalityTranslation.name ?? "",
      })),
  }));
}

function getTranslationsToUpdate(
  newValue: ServiceAndModalitiesTitleListValue,
  lastSavedTranslations: Translations | undefined
) {
  const servicesTranslationsToUpdate = getServiceTranslationsToUpdate(
    newValue,
    lastSavedTranslations?.asterixServicesTranslations ?? []
  );
  const modalitiesTranslationsToUpdate = getModalitiesTranslationsToUpdate(
    newValue,
    lastSavedTranslations?.asterixServicesTranslations ?? [],
    lastSavedTranslations?.asterixModalitiesTranslations ?? []
  );

  return { servicesTranslationsToUpdate, modalitiesTranslationsToUpdate };
}

function getServiceTranslationsToUpdate(
  dataToSave: ServiceAndModalitiesTitleListValue,
  lastSavedTranslations: Array<ServiceCodeTranslation>
): Array<ServiceCodeTranslation> {
  return dataToSave
    .map((itemToSave) =>
      Object.assign(
        {},
        { itemToSave },
        {
          lastSavedTranslation: lastSavedTranslations.find(
            (translation) => translation.code === itemToSave.serviceCode
          )!,
        }
      )
    )
    .filter((item) => item.itemToSave.title !== item.lastSavedTranslation?.name)
    .map((item) => ({ ...item.lastSavedTranslation, name: item.itemToSave.title }));
}

function getModalitiesTranslationsToUpdate(
  dataToSave: ServiceAndModalitiesTitleListValue,
  lastSavedServiceTranslations: Array<ServiceCodeTranslation>,
  lastSavedOptionTranslations: Array<OptionTranslation>
): Array<OptionTranslation> {
  return dataToSave
    .flatMap((itemToSave) => {
      const serviceTranslationId = lastSavedServiceTranslations.find(
        (translation) => translation.code === itemToSave.serviceCode
      )?.id;

      return itemToSave.modalities.map((modality) =>
        Object.assign(
          {},
          { itemToSave: modality },
          {
            lastSavedTranslation: lastSavedOptionTranslations.find(
              (translation) =>
                translation.asx_service_code_translation_id === serviceTranslationId &&
                translation.asx_modality_code === modality.modalityCode
            )!,
          }
        )
      );
    })
    .filter((item) => item.itemToSave.title !== item.lastSavedTranslation?.name)
    .map((item) => ({ ...item.lastSavedTranslation, name: item.itemToSave.title }));
}
