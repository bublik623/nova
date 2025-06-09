<template>
  <div class="flex flex-col m-5">
    <div class="flex flex-row justify-between">
      <span>Readonly:</span>
      <NovaButtonToggle :model-value="readonly" @update:model-value="readonly = !readonly">
        <template #firstOption>ON</template>
        <template #secondOption>OFF</template>
      </NovaButtonToggle>
    </div>
    <div class="flex flex-row justify-between mt-5">
      <span>Show reference:</span>
      <NovaButtonToggle :model-value="showReference" @update:model-value="showReference = !showReference">
        <template #firstOption>TRUE</template>
        <template #secondOption>FALSE</template>
      </NovaButtonToggle>
    </div>
    <div class="flex flex-row w-full justify-between">
      <div class="flex flex-column flex-wrap mt-5 w-2/4">
        <div class="flex flex-row w-full">
          <pre>{{ curationTargetValue }}</pre>
        </div>
        <div class="flex flex-row w-full">
          <AsterixServiceAndModalitiesTitleListField
            :reference-value="curationReferenceValue"
            :target-value="curationTargetValue"
            :show-reference="showReference"
            :readonly="readonly"
            style="width: 600px"
            @update:value="updateCurationTargetValue"
          >
            <template #reference-label>
              <NovaLabel theme="middle-grey" class="grow-0">Raw</NovaLabel>
            </template>
            <template #target-label>
              <NovaLabel theme="teal-green" class="grow-0">Commercial</NovaLabel>
            </template>
          </AsterixServiceAndModalitiesTitleListField>
        </div>
      </div>
      <div class="flex flex-column flex-wrap mt-5 w-2/4">
        <div class="flex flex-row w-full">
          <pre>{{ translationTargetValue }}</pre>
        </div>
        <div class="flex flex-row w-full">
          <AsterixServiceAndModalitiesTitleListField
            :reference-value="translationReferenceValue"
            :target-value="translationTargetValue"
            :show-reference="showReference"
            :readonly="readonly"
            style="width: 600px"
            @update:value="updateTranslationTargetValue"
          >
            <template #reference-label>
              <NovaIconFlag country-code="en" shape="circle" :size="12" class="mr-1"></NovaIconFlag>
              <span class="text-xs">English</span>
            </template>
            <template #target-label>
              <NovaIconFlag country-code="es" shape="circle" :size="12" class="mr-1"></NovaIconFlag>
              <span class="text-xs">Spanish</span>
            </template>
          </AsterixServiceAndModalitiesTitleListField>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ServiceAndModalitiesTitleListValue } from "@/features/experience-shared/asterix-integration/asterix-service-and-modalities-titles/types/service-and-modalities-title-list-value";
import AsterixServiceAndModalitiesTitleListField from "@/features/experience-shared/asterix-integration/asterix-service-and-modalities-titles/components/AsterixServiceAndModalitiesTitleListField.vue";
import NovaButtonToggle from "@/ui-kit/NovaButtonToggle/NovaButtonToggle.vue";
import NovaIconFlag from "@/ui-kit/NovaIconFlag/NovaIconFlag.vue";
import NovaLabel from "@/ui-kit/NovaLabel/NovaLabel.vue";

const curationReferenceValue = ref<ServiceAndModalitiesTitleListValue>([
  {
    serviceCode: "SVC-1",
    title:
      "SVC-1 loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong title from raw",
    modalities: [
      {
        modalityCode: "MOD-1",
        title: "MOD-1 title from raw",
      },
      { modalityCode: "MOD-2", title: "MOD-2 title from raw" },
    ],
  },
  {
    serviceCode: "SVC-2",
    title: "SVC-2 title from raw",
    modalities: [
      {
        modalityCode: "MOD-3",
        title: "MOD-3 title from raw",
      },
      { modalityCode: "MOD-4", title: "MOD-4 title from raw" },
    ],
  },
]);
const curationTargetValue = ref<ServiceAndModalitiesTitleListValue>([
  {
    serviceCode: "SVC-1",
    title: "",
    modalities: [
      { modalityCode: "MOD-1", title: "" },
      { modalityCode: "MOD-2", title: "" },
    ],
  },
  {
    serviceCode: "SVC-2",
    title: "",
    modalities: [
      { modalityCode: "MOD-3", title: "" },
      { modalityCode: "MOD-4", title: "" },
    ],
  },
]);

const translationReferenceValue = ref<ServiceAndModalitiesTitleListValue>([
  {
    serviceCode: "SVC-1",
    title: "SVC-1 title from master language",
    modalities: [
      {
        modalityCode: "MOD-1",
        title: "MOD-1 title from master language",
      },
      { modalityCode: "MOD-2", title: "MOD-2 title from master language" },
    ],
  },
  {
    serviceCode: "SVC-2",
    title: "SVC-2 title from master language",
    modalities: [
      {
        modalityCode: "MOD-3",
        title: "MOD-3 title from master language",
      },
      { modalityCode: "MOD-4", title: "MOD-4 title from master language" },
    ],
  },
]);

const translationTargetValue = ref<ServiceAndModalitiesTitleListValue>([
  {
    serviceCode: "SVC-1",
    title: "",
    modalities: [
      { modalityCode: "MOD-1", title: "" },
      { modalityCode: "MOD-2", title: "" },
    ],
  },
  {
    serviceCode: "SVC-2",
    title: "",
    modalities: [
      { modalityCode: "MOD-3", title: "" },
      { modalityCode: "MOD-4", title: "" },
    ],
  },
]);

const updateCurationTargetValue = updateValue(curationTargetValue);

const updateTranslationTargetValue = updateValue(translationTargetValue);

function updateValue(value: Ref<ServiceAndModalitiesTitleListValue>) {
  return (newValue: ServiceAndModalitiesTitleListValue) => {
    value.value = newValue;
  };
}
const readonly = ref(false);
const showReference = ref(true);
</script>
