<template>
  <ExperienceFormWrapper
    :show-save-and-go-next="!!nextAvailableSection"
    :is-readonly="store.isReadonly"
    :is-save-enabled="isSaveEnabled"
    :is-saving-draft="isSavingDraft"
    :next-section-route="nextAvailableSection"
    @click:navigate="handleNavigate"
    @click:save-and-navigate="handleSaveAndNavigate"
  >
    <NuxtPage
      :show-raw-fields="showRawFields"
      :selected-view="selectedView"
      :is-saving-draft="isSavingDraft"
      :next-section-route="nextAvailableSection"
      :is-readonly="store.isReadonly"
      :is-save-enabled="isSaveEnabled"
      @has-unsaved-changes="(e) => $emit('update-unsaved-changes-flag', e)"
    />
  </ExperienceFormWrapper>
</template>

<script setup lang="ts">
import ExperienceFormWrapper from "@/features/experience-shared/components/ExperienceFormWrapper.vue";
import { useCurationExperienceStore } from "../stores/useCurationExperienceStore";
import { eventBusCuration } from "@/features/experience-shared/composables/useEventBus";

interface Props {
  showRawFields: boolean;
  selectedView: string;
  isSavingDraft: boolean;
  nextAvailableSection?: string;
  isSaveEnabled: boolean;
}

interface Events {
  (e: "update-unsaved-changes-flag", value: boolean): void;
}

const props = defineProps<Props>();
defineEmits<Events>();

const store = useCurationExperienceStore();
const router = useRouter();

function handleSaveAndNavigate() {
  eventBusCuration.emit("SAVE", { nextSection: props.nextAvailableSection });
}

async function handleNavigate() {
  if (!props.nextAvailableSection) {
    return;
  }
  await router.push(props.nextAvailableSection);
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";
</style>
