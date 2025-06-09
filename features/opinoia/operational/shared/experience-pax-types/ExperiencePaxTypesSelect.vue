<script setup lang="ts">
import { BaseOption } from "@/types/Option";
import InlineMultiSelect from "../inline-multi-select/InlineMultiSelect.vue";
import { useSavedExperiencePaxTypes } from "./useSavedExperiencePaxTypes";

export type ExperiencePaxTypeSelectProps = {
  experienceId: string;
};

const props = defineProps<ExperiencePaxTypeSelectProps>();
const selected = defineModel<string[] | "all">("selected", { required: true });

const savedExperiencePaxTypes = useSavedExperiencePaxTypes(readonly(toRef(props.experienceId)));
const options = computed<BaseOption<string>[]>(() => {
  return savedExperiencePaxTypes.value.map((paxType) => ({ value: paxType.code, label: paxType.name }));
});
</script>

<template>
  <InlineMultiSelect :options v-model:selected-values="selected" />
</template>
