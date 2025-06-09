<template>
  <AsterixIntegrationForm
    :experience-id="experienceId"
    :language-code="languageCode"
    :readonly="readonly"
    @has-unsaved-changes="(newValue) => emit('hasUnsavedChanges', newValue)"
  >
  </AsterixIntegrationForm>
</template>
<script setup lang="ts">
import AsterixIntegrationForm from "@/features/experience-translation/asterix-integration/forms/AsterixIntegrationForm.vue";
import { TranslationPageEvents, TranslationPageProps } from "@/features/experience-translation/types";
import { eventBusTranslation } from "@/features/experience-shared/composables/useEventBus";
import { useTranslationAsterixIntegrationStore } from "@/features/experience-translation/asterix-integration/stores/useTranslationAsterixIntegrationStore";
import { saveCurationContent } from "@/features/experience-curation/lib/saveCurationContent";
import { AvailableLanguage } from "@/types/Language";

defineProps<TranslationPageProps>();
const emit = defineEmits<TranslationPageEvents>();

const { params } = useRoute();
const experienceId = params.id as string;
const languageCode = params.language as AvailableLanguage;

const store = useTranslationAsterixIntegrationStore();

// Saving
const stopBus = eventBusTranslation.on(
  async (
    event,
    opt: { nextSection: string; publish: boolean; redirect: boolean; translate: boolean; force: boolean }
  ) => {
    if (event === "SAVE") {
      saveCurationContent({
        promise: async () => {
          await store.save();
        },
        afterSaving: () => {
          eventBusTranslation.emit("SAVED", opt);
        },
        id: experienceId,
        nextSection: opt?.nextSection,
        redirect: opt?.redirect,
        translate: opt?.translate,
        publish: opt?.publish,
        force: opt?.force,
      });
    }
  }
);

onBeforeUnmount(() => stopBus());

onUnmounted(() => store.$reset());
</script>
