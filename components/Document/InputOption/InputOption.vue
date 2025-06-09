<template>
  <NovaSelect
    :max-height="260"
    :loading="isLoading"
    :placeholder="$t('input.option.placeholder')"
    :disabled="!asterixId"
    :options="modalities || []"
    :selected="modelValue"
    @select:option="$emit('update:modelValue', $event)"
  ></NovaSelect>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useCharlieContentMasterDataApi } from "@/composables/useCharlieContentMasterDataApi";
import NovaSelect from "@/ui-kit/NovaSelect/NovaSelect.vue";
import { Option } from "@/types/Option";

export interface Props {
  asterixId?: string;
  modelValue: Option;
}

interface Events {
  (e: "update:modelValue", value: Option | null): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Events>();
const { getModalities } = useCharlieContentMasterDataApi();

const modalities = ref();
const isLoading = ref(false);

async function searchOptions(searchValue: string) {
  isLoading.value = true;
  const { data } = await getModalities("modalities", {
    params: {
      contain: searchValue,
      limit: 10,
      offset: 0,
    },
  });

  modalities.value = data.map((el) => ({
    label: el.default_name,
    value: el.code,
  }));
  isLoading.value = false;
}

if (props.asterixId) {
  searchOptions(props.asterixId);
}

watch(
  () => props.asterixId,
  async () => {
    emit("update:modelValue", null);

    if (props.asterixId) {
      await searchOptions(props.asterixId);
    }
  }
);
</script>
