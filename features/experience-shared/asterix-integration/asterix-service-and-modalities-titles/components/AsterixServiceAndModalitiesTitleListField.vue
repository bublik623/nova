<template>
  <div class="grid grid-cols-1">
    <div v-for="item in targetValue" :key="item.serviceCode">
      <AsterixServiceAndModalitiesTitleEditor
        :show-reference="showReference"
        :reference-value="referenceValueIndex.get(item.serviceCode)"
        :target-value="item"
        :readonly="readonly"
        class="mb-3"
        @update:value="updateValue"
      >
        <template #reference-label><slot name="reference-label"></slot></template>
        <template #target-label><slot name="target-label"></slot></template>
      </AsterixServiceAndModalitiesTitleEditor>
    </div>
  </div>
</template>
<script setup lang="ts">
import AsterixServiceAndModalitiesTitleEditor from "./AsterixServiceAndModalitiesTitleEditor.vue";
import {
  ServiceAndModalitiesTitleListValue,
  ServiceAndModalitiesTitleValue,
} from "@/features/experience-shared/asterix-integration/asterix-service-and-modalities-titles/types/service-and-modalities-title-list-value";

export interface AsterixServiceAndModalitiesTitleListFieldProps {
  referenceValue: ServiceAndModalitiesTitleListValue;
  targetValue: ServiceAndModalitiesTitleListValue;
  readonly: boolean;
  showReference: boolean;
}

export interface AsterixServiceAndModalitiesTitleListFieldEvents {
  (e: "update:value", value: ServiceAndModalitiesTitleListValue): void;
}

const props = defineProps<AsterixServiceAndModalitiesTitleListFieldProps>();
const emit = defineEmits<AsterixServiceAndModalitiesTitleListFieldEvents>();

const referenceValueIndex = computed<Map<string, ServiceAndModalitiesTitleValue>>(() => {
  return new Map(props.referenceValue.map((value) => [value.serviceCode, value]));
});

function updateValue(newItemValue: ServiceAndModalitiesTitleValue) {
  const updatedValue = props.targetValue.map((item) => ({ ...item }));
  updatedValue[updatedValue.findIndex((item) => item.serviceCode === newItemValue.serviceCode)] = newItemValue;

  emit("update:value", updatedValue);
}
</script>
