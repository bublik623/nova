<template>
  <div class="flex flex-col">
    <div v-if="showReference" class="flex flex-col text-text-100">
      <div class="flex flex-row items-center" data-testid="reference-label"><slot name="reference-label"></slot></div>
      <span
        class="mt-1 text-sm overflow-hidden text-nowrap text-ellipsis"
        :title="referenceValue"
        data-testid="reference-value"
      >
        {{ referenceValue }}
      </span>
    </div>

    <div class="flex flex-col mt-4">
      <div class="flex flex-row items-center" data-testid="target-label"><slot name="target-label"></slot></div>
      <NovaInputText
        :id="id"
        :model-value="targetValue"
        :show-metrics="true"
        :readonly="readonly"
        :input-props="{ maxlength: maxLength }"
        :error="targetValue === '' ? $t('experience.title.input.error') : undefined"
        class="mt-2"
        @update:model-value="(newValue) => $emit('update:targetValue', newValue)"
      ></NovaInputText>
    </div>
  </div>
</template>
<script setup lang="ts">
import NovaInputText from "@/ui-kit/NovaInputText/NovaInputText.vue";

export interface Props {
  id: string;
  showReference: boolean;
  referenceValue: string;
  targetValue: string;
  readonly: boolean;
  maxLength: number;
}

export interface Events {
  (e: "update:targetValue", value: string): void;
}

defineProps<Props>();
defineEmits<Events>();
</script>
