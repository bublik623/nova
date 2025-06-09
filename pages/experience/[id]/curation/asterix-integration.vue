<template>
  <AsterixIntegrationForm
    :experience-id="experienceId"
    :show-raw-fields="showRawFields"
    :readonly="isReadonly"
    @has-unsaved-changes="(newValue) => emit('hasUnsavedChanges', newValue)"
  >
  </AsterixIntegrationForm>
</template>
<script setup lang="ts">
import AsterixIntegrationForm from "@/features/experience-curation/asterix-integration/forms/AsterixIntegrationForm.vue";
import { CurationPageEvents, CurationPageProps } from "@/features/experience-curation/types";
import { eventBusCuration } from "@/features/experience-shared/composables/useEventBus";
import { useCurationAsterixIntegrationStore } from "@/features/experience-curation/asterix-integration/stores/useCurationAsterixIntegrationStore";
import { saveCurationContent } from "@/features/experience-curation/lib/saveCurationContent";

defineProps<CurationPageProps>();
const emit = defineEmits<CurationPageEvents>();

const { params } = useRoute();
const experienceId = params.id as string;

const store = useCurationAsterixIntegrationStore();

// Saving
const stopBus = eventBusCuration.on(
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
          eventBusCuration.emit("SAVED", opt);
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
