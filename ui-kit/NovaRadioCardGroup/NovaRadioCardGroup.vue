<template>
  <span v-if="readonly && modelValue">
    <p class="text-sm">{{ selectedOption?.title }}</p>
    <p class="text-sm text-text-80 font-normal">{{ selectedOption?.description }}</p>
  </span>
  <NoContentUtil v-else-if="!modelValue" />
  <span v-else class="flex">
    <NovaRadioCard
      v-for="{ title, value, description } in options"
      :key="value"
      :title
      :value
      :disabled
      class="mr-2"
      :checked="modelValue === value"
      @input="$emit('update:modelValue', $event)"
    >
      <template #description>
        {{ description }}
      </template>
    </NovaRadioCard>
  </span>
</template>

<script setup lang="ts">
import NoContentUtil from "@/features/experience-shared/components/NoContentUtil.vue";
import NovaRadioCard from "../NovaRadioCard/NovaRadioCard.vue";

export interface Props {
  modelValue?: string;
  options: { title: string; description?: string; value: string }[];
  disabled?: boolean;
  readonly?: boolean;
}

interface Events {
  (e: "update:modelValue", value: string): void;
}

defineEmits<Events>();
const props = defineProps<Props>();
const selectedOption = props.options.find((opt) => opt.value === props.modelValue);
</script>
