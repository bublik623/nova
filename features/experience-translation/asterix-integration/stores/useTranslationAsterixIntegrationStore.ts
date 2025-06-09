import { AvailableLanguage } from "@/types/Language";
import { defineStore } from "pinia";
import { useRoute } from "vue-router";
import {
  useAsterixServiceAndModalitiesTitleTranslationsListField,
  serviceAndModalitiesTitleTranslationList,
} from "@/features/experience-shared/asterix-integration/asterix-service-and-modalities-titles/composables/useAsterixServiceAndModalitiesTitleTranslationsListField";
import { useStoreFields } from "@/features/experience-shared/composables/useStoreFields";

export const useTranslationAsterixIntegrationStore = defineStore("translationServiceAndModalities", () => {
  const route = useRoute();
  const experienceId = computed(() => route.params.id as string | undefined);
  const translationLanguage = computed(() => route.params.language as AvailableLanguage);
  const isSaving = ref(false);

  const titleTranslationListField = useAsterixServiceAndModalitiesTitleTranslationsListField(
    experienceId,
    translationLanguage
  );

  const storeFields = useStoreFields((_) => [serviceAndModalitiesTitleTranslationList], {
    initialValues: computed(() => ({
      serviceAndModalitiesTitleTranslationList: titleTranslationListField.lastSavedValue.value,
    })),
  });

  return {
    ...storeFields,
    isSaving,
    save,
    $reset,
  };

  async function save() {
    if (storeFields.updatedValues.value.serviceAndModalitiesTitleTranslationList) {
      try {
        isSaving.value = true;
        await titleTranslationListField.save(storeFields.updatedValues.value.serviceAndModalitiesTitleTranslationList);
      } finally {
        isSaving.value = false;
      }
    }
  }

  function $reset() {
    Object.assign(storeFields.values, {
      serviceAndModalitiesTitleTranslationList: titleTranslationListField.lastSavedValue.value,
    });
  }
});
