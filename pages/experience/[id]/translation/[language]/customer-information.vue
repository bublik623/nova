<template>
  <TranslationCustomerInformationForm
    v-if="curationDocument"
    data-testid="experience-translation-customer-information"
    :initial-values="{
      info_voucher: translationStore.translation?.info_voucher,
    }"
    :curation-values="{
      info_voucher: curationDocument.data.info_voucher,
    }"
    :diff-values="{
      info_voucher: curationStore.secondLastEnglishSnapshot?.experience_translation?.info_voucher ?? '',
    }"
    :has-diff="!translationStore.isTranslationPublished"
    :language="languageCode"
    :readonly="readonly"
    @update:model-value="updateStore"
  />
</template>

<script setup lang="ts">
import TranslationCustomerInformationForm from "@/features/experience-translation/forms/TranslationCustomerInformationForm.vue";
import { useExperienceTranslationFlow } from "@/features/experience-translation/composables/useExperienceTranslationFlow";
import { eventBusTranslation } from "@/features/experience-shared/composables/useEventBus";
import { AvailableLanguage } from "@/types/Language";
import { TranslationPageProps, TranslationPageEvents } from "@/features/experience-translation/types";

defineProps<Omit<TranslationPageProps, "nextSectionRoute">>();
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
