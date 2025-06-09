<template>
  <span class="hidden">{{ isDisabled }}</span>
  <NovaSelectSearch
    :id="`asx-modalities-select-${serviceAndModalitiesId}`"
    :options="availableOptions"
    :selected="selectedOptions"
    :placeholder="$t('common.select')"
    :multi="true"
    :background-color="'white'"
    :max-height="200"
    :disabled="isDisabled"
    :loading="isLoading"
    @update:search-query="(newQuery) => (searchQuery = newQuery)"
    @select:option="toggleModalitySelection"
    @clear:options="clearAllSelectedModalities"
  />
</template>
<script setup lang="ts">
import NovaSelectSearch from "@/ui-kit/NovaSelectSearch/NovaSelectSearch.vue";
import { BaseOption } from "@/types/Option";
import { ModalityCodes } from "@/types/generated/ExperienceRawServiceApi";
import { useRawServiceAndModalitiesStore } from "../../stores/useRawServiceAndModalitiesStore";
import { watchDebounced } from "@vueuse/core";

const config = useRuntimeConfig();
const { WATCH_DEBOUNCE_TIMEOUT } = config.public;

export interface Props {
  serviceAndModalitiesId: string;
}

const props = defineProps<Props>();
const servicesAndModalitiesStore = useRawServiceAndModalitiesStore();
const searchQuery = ref("");

const serviceAndRelatedModalities = computed(() =>
  servicesAndModalitiesStore.selectedServicesAndModalities.find((item) => item.id === props.serviceAndModalitiesId)
);

const selectedOptions = computed(() => {
  const selectedModalities = serviceAndRelatedModalities.value?.modalities ?? [];
  return selectedModalities.map(toOption);
});

const {
  status,
  refresh: refreshAvailableModalities,
  data: availableModalities,
} = await useLazyAsyncData(
  `asterix-available-modalities-${props.serviceAndModalitiesId}`,
  async () => await servicesAndModalitiesStore.getAvailableModalities(props.serviceAndModalitiesId, searchQuery.value)
);

watchDebounced(
  [searchQuery, () => serviceAndRelatedModalities.value?.service],
  async ([_, newService]) => {
    if (!newService) return;

    await refreshAvailableModalities();
  },
  { debounce: parseInt(WATCH_DEBOUNCE_TIMEOUT) }
);

const isLoading = computed(() => status.value === "pending");

const availableOptions = computed(() => availableModalities.value?.map(toOption) ?? []);

const isDisabled = computed(() => {
  return !serviceAndRelatedModalities.value?.service;
});

function toggleModalitySelection(selectedOption: BaseOption<ModalityCodes>) {
  servicesAndModalitiesStore.toggleModalitySelection(props.serviceAndModalitiesId, selectedOption.value);
}

function clearAllSelectedModalities() {
  servicesAndModalitiesStore.removeAllModalities(props.serviceAndModalitiesId);
}

function toOption(modality: ModalityCodes) {
  return { label: `${modality.code} - ${modality.default_name}`, value: modality };
}
</script>
