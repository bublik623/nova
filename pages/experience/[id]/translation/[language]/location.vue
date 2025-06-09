<template>
  <TranslationLocationForm
    v-if="curationDocument"
    data-testid="experience-translation-location"
    :language="languageCode"
    :initial-values="{
      ...translationStore.translation,
    }"
    :curation-values="{ ...curationDocument.data }"
    :diff-values="{
      meeting_point_details:
        curationStore.secondLastEnglishSnapshot?.experience_translation?.meeting_point_details ?? '',
    }"
    :has-diff="!translationStore.isTranslationPublished"
    :readonly="readonly"
    @update:model-value="updateStore"
  />
</template>

<script setup lang="ts">
import TranslationLocationForm from "@/features/experience-translation/forms/TranslationLocationForm.vue";
import { useExperienceTranslationFlow } from "@/features/experience-translation/composables/useExperienceTranslationFlow";
import { eventBusTranslation } from "@/features/experience-shared/composables/useEventBus";
import { AvailableLanguage } from "@/types/Language";
import { TranslationPageProps, TranslationPageEvents } from "@/features/experience-translation/types";

defineProps<TranslationPageProps>();
const emit = defineEmits<TranslationPageEvents>();

const route = useRoute();
const experienceId = route.params.id as string;
const languageCode = route.params.language as AvailableLanguage;

const { translationStore, curationStore, curationDocument, updateStore, handleEventBusSaveDraft } =
  useExperienceTranslationFlow(languageCode, experienceId);

watch(
  // watch all the stores used in the page
  () => translationStore.translation,
  (curr, prev) => {
    // needed to not trigger the watcher when translation document load
    if (curr === prev) {
      emit("hasUnsavedChanges", true);
    }
  },
  {
    deep: true,
  }
);

// Saving
const stopBus = eventBusTranslation.on(async (event, opt: { nextSectionRoute?: string; publish?: boolean }) => {
  if (event === "SAVE") {
    await handleEventBusSaveDraft({
      nextSectionRoute: opt?.nextSectionRoute,
      publish: opt?.publish,
      afterSaving: () => {
        emit("hasUnsavedChanges", false);
        eventBusTranslation.emit("SAVED", opt);
      },
    });
  }
});
onUnmounted(() => stopBus());
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";
</style>
