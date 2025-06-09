import { AvailableLanguage } from "@/types/Language";
import { defineStore } from "pinia";
import { useRoute } from "vue-router";
import {
  useAsterixServiceAndModalitiesTitleTranslationsListField,
  serviceAndModalitiesTitleTranslationList,
} from "@/features/experience-shared/asterix-integration/asterix-service-and-modalities-titles/composables/useAsterixServiceAndModalitiesTitleTranslationsListField";
import { useStoreFields } from "@/features/experience-shared/composables/useStoreFields";

export const useCurationAsterixIntegrationStore = defineStore("curationServiceAndModalities", () => {
  const route = useRoute();
  const experienceId = computed(() => route.params.id as string | undefined);
  const masterLanguageCode = readonly(ref<AvailableLanguage>("en"));

  const titleTranslationListField = useAsterixServiceAndModalitiesTitleTranslationsListField(
    experienceId,
    masterLanguageCode
  );

  const storeFields = useStoreFields((_) => [serviceAndModalitiesTitleTranslationList], {
    initialValues: computed(() => ({
      serviceAndModalitiesTitleTranslationList: titleTranslationListField.lastSavedValue.value,
    })),
  });

  return {
    ...storeFields,
    canSave: storeFields.isValid,
    save,
    $reset,
  };

  async function save() {
    if (storeFields.updatedValues.value.serviceAndModalitiesTitleTranslationList) {
      await titleTranslationListField.save(storeFields.updatedValues.value.serviceAndModalitiesTitleTranslationList);
    }
  }

  function $reset() {
    Object.assign(storeFields.values, {
      serviceAndModalitiesTitleTranslationList: titleTranslationListField.lastSavedValue.value,
    });
  }
});
