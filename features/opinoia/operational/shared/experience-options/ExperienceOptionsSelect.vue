<script setup lang="ts">
import { BaseOption } from "@/types/Option";
import { useLastSavedOptionsSectionData } from "../../sections/options/composables/useLastSavedOptionsSectionData";
import InlineSingleSelect from "../inline-single-select/InlineSingleSelect.vue";

export type ExperienceOptionsSelectProps = {
  experienceId: string | undefined;
};

const props = defineProps<ExperienceOptionsSelectProps>();
const selected = defineModel<string | undefined>("selected", { required: true });

const lastSavedOptionsSectionData = useLastSavedOptionsSectionData(readonly(toRef(props, "experienceId")));
const options = computed<BaseOption<string>[]>(() => {
  return (
    lastSavedOptionsSectionData.data.value?.options.map((experienceOption) => ({
      value: experienceOption.id,
      label: experienceOption.title,
    })) ?? []
  );
});
</script>
<template>
  <InlineSingleSelect v-model:selected-value="selected" :options />
</template>
