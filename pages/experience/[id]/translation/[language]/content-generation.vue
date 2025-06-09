<template>
  <TranslationContentGenerationForm
    v-if="curationDocument && translationStore.translation"
    data-testid="experience-translation-content-generation"
    :initial-values="translationStore.translation"
    :curation-values="{
      ...curationDocument.data,
      custom_highlights: curationDocument.fields.highlights.value.custom,
      custom_included: curationDocument.fields.included.value.custom,
      custom_non_included: curationDocument.fields.non_included.value.custom,
      custom_important_information: curationDocument.fields.important_information.value.custom,
      premade_highlights: curationDocument.fields.highlights.value.premade,
      premade_important_information: curationDocument.fields.important_information.value.premade,
      premade_included: curationDocument.fields.included.value.premade,
      premade_non_included: curationDocument.fields.non_included.value.premade,
    }"
    :diff-values="{
      text1: curationStore.secondLastEnglishSnapshot?.experience_translation?.text1 ?? '',
      seo_description: curationStore.secondLastEnglishSnapshot?.experience_translation?.seo_description ?? '',
      text2: curationStore.secondLastEnglishSnapshot?.experience_translation?.text2 ?? '',
      custom_highlights: highlights.highlights.custom,
      custom_included: highlights.included.custom,
      custom_non_included: highlights.non_included.custom,
      custom_important_information: highlights.important_information.custom,
      premade_highlights: highlights.highlights.premade,
      premade_included: highlights.included.premade,
      premade_non_included: highlights.non_included.premade,
      premade_important_information: highlights.important_information.premade,
    }"
    :has-diff="!translationStore.isTranslationPublished"
    :language="languageCode"
    :readonly="readonly"
    @update:model-value="updateStore"
  />
</template>

<script setup lang="ts">
import TranslationContentGenerationForm from "@/features/experience-translation/forms/TranslationContentGenerationForm.vue";
import { useExperienceTranslationFlow } from "@/features/experience-translation/composables/useExperienceTranslationFlow";
import { eventBusTranslation } from "@/features/experience-shared/composables/useEventBus";
import { AvailableLanguage } from "@/types/Language";
import { TranslationPageEvents, TranslationPageProps } from "@/features/experience-translation/types";
import { CustomHighlights } from "@/types/generated/ExperienceRawServiceApi";

defineProps<TranslationPageProps>();
const emit = defineEmits<TranslationPageEvents>();

const route = useRoute();
const experienceId = route.params.id as string;
const languageCode = route.params.language as AvailableLanguage;

const { curationDocument, curationStore, updateStore, translationStore, handleEventBusSaveDraft } =
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

const snapshot = computed(() => curationStore.secondLastSnapshot);

const diffHighlights = computed(() => {
  const experienceEnglish = curationStore.secondLastEnglishSnapshot;

  return {
    custom_highlights: experienceEnglish?.customs?.custom_highlights,
    custom_included: experienceEnglish?.customs?.custom_included,
    custom_non_included: experienceEnglish?.customs?.custom_non_included,
    custom_important_information: experienceEnglish?.customs?.custom_important_information,
  };
});
// todo fix types once BE updates openapi definitions
const highlights = computed(() => {
  return {
    highlights: curationStore.mapDataToHighlights(
      "highlights",
      snapshot.value?.experience_functional_information?.highlights?.codes ?? [],
      (diffHighlights.value.custom_highlights as unknown as CustomHighlights[]) ?? []
    ),
    important_information: curationStore.mapDataToHighlights(
      "important_information",
      snapshot.value?.experience_functional_information?.important_information?.codes ?? [],
      (diffHighlights.value.custom_important_information as unknown as CustomHighlights[]) ?? []
    ),
    included: curationStore.mapDataToHighlights(
      "included",
      snapshot.value?.experience_functional_information?.included?.codes ?? [],
      (diffHighlights.value.custom_included as unknown as CustomHighlights[]) ?? []
    ),
    non_included: curationStore.mapDataToHighlights(
      "non_included",
      snapshot.value?.experience_functional_information?.excluded?.codes ?? [],
      (diffHighlights.value.custom_non_included as unknown as CustomHighlights[]) ?? []
    ),
  };
});
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";
</style>
