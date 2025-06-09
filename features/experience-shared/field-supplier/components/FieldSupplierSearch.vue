<template>
  <NovaDropdown
    :options="suppliersList"
    :show="isDropdownOpen"
    :max-height="200"
    :loading="suppliersListIsLoading"
    @select:option="handleSelect"
  >
    <template #toggle>
      <div ref="component">
        <NovaInputText
          :id="inputId"
          v-model="searchRef"
          :placeholder="$t('experience.supplier_name.input.placeholder')"
          left-icon="search"
          :readonly="readonly"
          :readonly-placeholder="$t('common.no-content')"
          @click="isDropdownOpen = true"
          @clear="handleClear"
        />
      </div>
    </template>

    <template #empty>
      <p class="text-xs text-text-90 text-center p-6" data-testid="field-supplier-no-results">
        {{ $t("common.field.supplier.no_results") }}
      </p>
    </template>
  </NovaDropdown>
</template>

<script setup lang="ts">
import NovaDropdown from "@/ui-kit/NovaDropdown/NovaDropdown.vue";
import { useSupplierField } from "../composables/useSupplierField";
import { Option } from "@/types/Option";
import NovaInputText from "@/ui-kit/NovaInputText/NovaInputText.vue";
import { useNuxtApp } from "#app";
import { useDetectClickOutside } from "@/composables/useDetectClickOutside";

interface Props {
  inputId: string;
  modelValue?: string;
  readonly?: boolean;
}

type Events = {
  "update:modelValue": [id: string | undefined];
};

defineProps<Props>();
const emits = defineEmits<Events>();

const { $t } = useNuxtApp();

const { suppliersList, suppliersListIsLoading, searchRef, supplierId, selectSupplier } = useSupplierField();

const component = ref<Element | null>(null);
const isDropdownOpen = ref(false);

useDetectClickOutside(component, () => {
  isDropdownOpen.value = false;
});

function handleSelect(option: Option) {
  selectSupplier(option.value);
  isDropdownOpen.value = false;

  emits("update:modelValue", supplierId.value);
}

function handleClear() {
  isDropdownOpen.value = false;
  emits("update:modelValue", "");
}
</script>
