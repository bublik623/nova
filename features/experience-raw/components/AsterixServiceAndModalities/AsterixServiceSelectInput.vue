<template>
  <NovaSelectSearch
    v-if="!readonly"
    :id="`asx-service-select-${serviceAndModalitiesId}`"
    :options="availableOptions"
    :selected="selectedOption"
    :placeholder="$t('common.select')"
    :multi="false"
    :max-height="200"
    :loading="isLoading"
    @update:search-query="(newQuery) => (searchQuery = newQuery)"
    @change:open="(isOpen) => (dropdownOpen = isOpen)"
    @select:option="handleSelectedOptionUpdate"
  >
    <template #default="{ option }">
      <NovaSelectSearchOption :option="option" />
    </template>
  </NovaSelectSearch>
  <span v-else data-testid="selected-service-name">{{ selectedServiceName }}</span>
</template>
<script setup lang="ts">
import NovaSelectSearch from "@/ui-kit/NovaSelectSearch/NovaSelectSearch.vue";
import { AsxExperience } from "@/types/generated/ExperienceRawServiceApi";
import { AvailableService, useRawServiceAndModalitiesStore } from "../../stores/useRawServiceAndModalitiesStore";
import { watchDebounced } from "@vueuse/core";
import NovaSelectSearchOption, {
  NovaSelectSearchOptionItem,
} from "@/ui-kit/NovaSelectSearch/NovaSelectSearchOption.vue";

const config = useRuntimeConfig();
const { WATCH_DEBOUNCE_TIMEOUT } = config.public;

export interface Props {
  serviceAndModalitiesId: string;
  readonly: boolean;
}

const props = defineProps<Props>();
const servicedAndModalitiesStore = useRawServiceAndModalitiesStore();
const dropdownOpen = ref(false);
const searchQuery = ref("");

const selectedOption = computed(() => {
  const serviceAndRelatedModalities = servicedAndModalitiesStore.selectedServicesAndModalities.find(
    (item) => item.id === props.serviceAndModalitiesId
  );

  const selectedService = serviceAndRelatedModalities?.service;
  if (!selectedService) {
    return [];
  }

  return [toSelectedOption(selectedService)];
});

const selectedServiceName = computed(() => {
  const serviceAndRelatedModalities = servicedAndModalitiesStore.getSelectedServiceOrThrowError(
    props.serviceAndModalitiesId
  );

  return serviceAndRelatedModalities.service?.default_name ?? "";
});

const {
  status,
  refresh: refreshAvailableServices,
  data: availableServices,
} = await useLazyAsyncData(
  `asterix-available-service-${props.serviceAndModalitiesId}`,
  async () => await servicedAndModalitiesStore.getAvailableServices(props.serviceAndModalitiesId, searchQuery.value),
  { immediate: true }
);

watchDebounced(searchQuery, () => refreshAvailableServices(), { debounce: parseInt(WATCH_DEBOUNCE_TIMEOUT) });
servicedAndModalitiesStore.$onAction(({ name, after }) => {
  if (["setSelectedService", "remove"].includes(name)) {
    after(() => {
      refreshAvailableServices();
    });
  }
});

const isLoading = computed(() => status.value === "pending");

const availableOptions = computed(() => availableServices.value?.map(toOption) ?? []);

function handleSelectedOptionUpdate(selectedOption: NovaSelectSearchOptionItem<AsxExperience>) {
  servicedAndModalitiesStore.setSelectedService(props.serviceAndModalitiesId, selectedOption.value);
}

function toSelectedOption(service: AsxExperience): NovaSelectSearchOptionItem<AsxExperience> {
  return {
    label: `${service.code} - ${service.default_name}`,
    value: service,
  };
}

function toOption(service: AvailableService): NovaSelectSearchOptionItem<AvailableService> {
  return {
    label: `${service.code} - ${service.default_name}`,
    value: service,
    disabled: !service.can_be_selected,
    badge: !service.can_be_selected
      ? { text: `Connected to ${service.reference_code}`, theme: "middle-grey" }
      : undefined,
  };
}
</script>
