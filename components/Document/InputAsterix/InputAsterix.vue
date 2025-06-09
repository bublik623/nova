<template>
  <NovaInputTextSearch
    :id="id"
    :placeholder="placeholder"
    :model-value="modelValue"
    :max-height="260"
    :debounce="500"
    :on-search-update="searchAsterixCodes"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script lang="ts" setup>
import NovaInputTextSearch from "@/ui-kit/NovaInputTextSearch/NovaInputTextSearch.vue";
import { useCharlieContentMasterDataApi } from "@/composables/useCharlieContentMasterDataApi";

export interface Props {
  id: string;
  placeholder: string;
  modelValue: string;
}

interface Events {
  (e: "update:modelValue", value: string): void;
}

defineProps<Props>();
defineEmits<Events>();

const { getExperiences } = useCharlieContentMasterDataApi();
async function searchAsterixCodes(searchValue: string) {
  const { data } = await getExperiences("experiences", {
    params: {
      contain: searchValue,
      limit: 20,
      offset: 0,
    },
  });

  return data.map((d) => d.code);
}
</script>
