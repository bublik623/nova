<template>
  <div
    v-for="serviceAndModalities in servicesAndModalitiesStore.selectedServicesAndModalities"
    :key="serviceAndModalities.id"
  >
    <AsterixServiceAndModalitiesField
      class="my-3"
      :service-and-modalities-id="serviceAndModalities.id"
      :readonly="readonly"
    ></AsterixServiceAndModalitiesField>
  </div>
  <NovaButton v-if="!readonly" test-id="add-new-service-and-modalities" @click="servicesAndModalitiesStore.addNew()">
    <NovaIcon name="plus" class="inline-block ml-1 mr-3" />{{ $t("common.add") }}
  </NovaButton>
</template>

<script setup lang="ts">
import AsterixServiceAndModalitiesField from "./AsterixServiceAndModalitiesField.vue";
import { useRawServiceAndModalitiesStore } from "../../stores/useRawServiceAndModalitiesStore";
import { RawAsterixAdapterInformation } from "@/types/generated/ExperienceRawServiceApi";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";
import { storeToRefs } from "pinia";

export interface Props {
  readonly: boolean;
  experienceReferenceCode?: string;
  value: Array<RawAsterixAdapterInformation>;
}
export interface Events {
  (e: "update:value", value: Array<RawAsterixAdapterInformation>): void;
}

const props = defineProps<Props>();
const emits = defineEmits<Events>();

const servicesAndModalitiesStore = useRawServiceAndModalitiesStore();
const { servicesAndModalitiesCodes } = storeToRefs(servicesAndModalitiesStore);

onMounted(async () => {
  await servicesAndModalitiesStore.initSelectedServicesAndModalities(props.experienceReferenceCode!, props.value);
});

watch(servicesAndModalitiesCodes, (newValue) => {
  emits("update:value", newValue);
});
</script>
