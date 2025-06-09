<template>
  <div class="w-full max-w-screen-lg">
    <main class="m-6 flex flex-col gap-10">
      <ExperienceFormBanners />
      <slot />
    </main>
    <div v-if="showSaveAndGoNext" class="my-10 mx-6 flex flex-row-reverse">
      <SaveAndGoNext
        :readonly="isReadonly"
        :disabled="!isSaveEnabled"
        :loading="isSavingDraft"
        @click:save-and-navigate="$emit('click:save-and-navigate')"
        @click:navigate="$emit('click:navigate')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import ExperienceFormBanners from "@/features/experience-shared/components/ExperienceFormBanners.vue";
import SaveAndGoNext from "@/features/experience-shared/components/SaveAndGoNext.vue";

type Props =
  | {
      showSaveAndGoNext?: false;
    }
  | ({
      showSaveAndGoNext: true;
    } & SaveAndGoNextProps);

type SaveAndGoNextProps = {
  isReadonly: boolean;
  isSaveEnabled: boolean;
  isSavingDraft: boolean;
};

interface Events {
  (e: "click:navigate"): void;
  (e: "click:save-and-navigate"): void;
}

const props = defineProps<Props>();
defineEmits<Events>();

const isReadonly = computed(() => (props.showSaveAndGoNext ? props.isReadonly : false));
const isSaveEnabled = computed(() => (props.showSaveAndGoNext ? props.isSaveEnabled : false));
const isSavingDraft = computed(() => (props.showSaveAndGoNext ? props.isSavingDraft : false));
</script>
