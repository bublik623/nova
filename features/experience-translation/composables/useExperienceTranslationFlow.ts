import { allCustomHighlights } from "@/features/experience-highlights/lib/get-all-custom-highlights";
import { ExperienceCurationDocument, useExperienceCuration } from "@/stores/experience-curation";
import { ExperienceTranslation } from "@/types/generated/ContentCommandApi";
import { AvailableLanguage } from "@/types/Language";
import { useExperienceTranslationStore } from "@/features/experience-translation/stores/useExperienceTranslationStore";
import { useNotifications } from "@/stores/notifications";
import { useLogger } from "@/features/core-shared/composables/useLogger";
import { useTranslationAsterixIntegrationStore } from "../asterix-integration/stores/useTranslationAsterixIntegrationStore";

export function useExperienceTranslationFlow(languageCode: AvailableLanguage, experienceId: string) {
  const notificationStore = useNotifications();
  const { logError } = useLogger();

  // Editorial document
  const curationStore = useExperienceCuration();
  const curationDocument = computed<ExperienceCurationDocument | null>(
    () => curationStore.curationDocuments[experienceId]
  );

  // Translations store
  const translationStore = useExperienceTranslationStore();

  // Asterix integration store
  const asterixIntegrationStore = useTranslationAsterixIntegrationStore();

  const isSaving = computed(() => {
    return translationStore.isSaving || asterixIntegrationStore.isSaving;
  });

  async function updateStore(updatedValues: Partial<ExperienceTranslation & allCustomHighlights>) {
    if (translationStore.loaded) {
      const initialValues = translationStore;

      translationStore.modified = true;

      const updatedTranslation = {
        ...initialValues.translation,
        ...updatedValues,
      };

      const updatedHighlights = {
        custom_highlights: updatedValues.custom_highlights || initialValues.translation.custom_highlights,
        custom_important_information:
          updatedValues.custom_important_information || initialValues.translation.custom_important_information,
        custom_included: updatedValues.custom_included || initialValues.translation.custom_included,
        custom_non_included: updatedValues.custom_non_included || initialValues.translation.custom_non_included,
      };

      translationStore.$patch({
        translation: { ...updatedTranslation, ...updatedHighlights },
      });

      translationStore.validation.runValidation();
    } else {
      throw new Error("Cannot update a translation document which is not loaded.");
    }
  }

  // Saving logic (event bus)
  async function handleEventBusSaveDraft(opt: {
    nextSectionRoute?: string;
    publish?: boolean;
    afterSaving?: () => void;
  }) {
    try {
      translationStore.isSaving = true;
      await translationStore.saveTranslation(opt.publish);

      if (opt.publish) {
        await translationStore.publishTranslationExperience();
      }

      if (opt.afterSaving) {
        opt.afterSaving();
      }

      notificationStore.addNotification({
        theme: "success",
        message: "notifications.success.saving.document",
      });
    } catch (err) {
      logError(opt.publish ? "publish-translation" : "update-translation", err);
      notificationStore.addNotification({
        theme: "error",
        message: "notifications.error.saving.document",
      });
    } finally {
      translationStore.isSaving = false;
    }
  }

  return {
    curationStore,
    curationDocument,
    translationStore,
    isSaving,
    updateStore,
    handleEventBusSaveDraft,
  };
}
