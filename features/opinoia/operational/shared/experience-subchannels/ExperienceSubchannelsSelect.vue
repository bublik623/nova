<script setup lang="ts">
import { BaseOption } from "@/types/Option";
import InlineMultiSelect from "../inline-multi-select/InlineMultiSelect.vue";

export type ExperienceSubchannelsSelectProps = {
  experienceId: string;
};

defineProps<ExperienceSubchannelsSelectProps>();
const selected = defineModel<string[] | "all">("selected", { required: true });

// this is out of scope for now, so I limit it to a stub
// TODO: add implementation: see ExperiencePaxTypesSelect for an example
const options = computed<BaseOption<string>[]>(() => [
  { value: "1", label: "B2B Musement Italy" },
  { value: "2", label: "B2B Musement Poland" },
  { value: "3", label: "B2B Musement Portugal" },
  { value: "4", label: "B2B Musement Spain" },
  { value: "5", label: "B2B Musement France" },
]);
</script>
<template>
  <InlineMultiSelect v-model:selected-values="selected" :options />
</template>
