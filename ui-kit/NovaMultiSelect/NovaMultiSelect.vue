<template>
  <nova-dropdown
    ref="dropdown"
    v-model:search-query="searchQuery"
    :options="filteredOptions"
    :selected="[...selectedOptions]"
    :show="openDropdown"
    :max-height="300"
    multi
    :show-searchbar="showSearchbar"
    @select:option="toggleSelection"
    @click:clear="selectedOptions = []"
    @keydown:esc="openDropdown = false"
  >
    <template #toggle>
      <button
        class="Multiselect__toggle"
        data-testid="multiselect-toggle-button"
        :open="openDropdown || null"
        :has-selected-options="!!selectedOptions.length || null"
        @click="handleToggleOpen"
      >
        {{ name }}
        <NovaIcon name="chevron-down" class="Multiselect__chevron" :class="{ rotate180: openDropdown }" />
        <span v-show="!!selectedOptions.length" class="Multiselect__chip">{{ selectedOptions.length }}</span>
      </button>
    </template>
    <template #empty>
      <p class="Multiselect__no-results">
        {{ $t("multiselect.no-results") }}
      </p>
    </template>
  </nova-dropdown>
</template>

<script setup lang="ts">
import NovaDropdown, { NovaDropdownMethods } from "@/ui-kit/NovaDropdown/NovaDropdown.vue";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";
import { onClickOutside, useVModel } from "@vueuse/core";
import { Option } from "@/types/Option";
export interface Props {
  options: Option[];
  modelValue: Option[];
  name?: string;
  isOpen?: boolean;
  searchQuery?: string;
  showSearchbar?: boolean;
}

interface Events {
  (e: "update:modelValue", value: Option[]): void;
  (e: "update:searchQuery", value: string[]): void;
  (e: "update:isOpen"): void;
}

const props = defineProps<Props>();
const emits = defineEmits<Events>();

const openDropdown = useVModel(props, "isOpen", emits, { passive: true, defaultValue: false });
const searchQuery = useVModel(props, "searchQuery", emits, { passive: true, defaultValue: "" });
const selectedOptions = useVModel(props, "modelValue", emits);

const filteredOptions = computed(() => {
  if (!searchQuery.value) {
    return props.options;
  }

  return props.options.filter((option) => option.label.toLowerCase().includes(searchQuery.value!.toLowerCase().trim()));
});

const toggleSelection = (option: Option) => {
  const index = selectedOptions.value.findIndex((selOpt) => selOpt.value === option.value);

  if (index !== -1) {
    selectedOptions.value = [...selectedOptions.value.slice(0, index), ...selectedOptions.value.slice(index + 1)];
  } else {
    selectedOptions.value = [...selectedOptions.value, option];
  }
};

const dropdown = ref<(HTMLElement & NovaDropdownMethods) | null>(null);

onClickOutside(dropdown, () => {
  openDropdown.value = false;
});

const handleToggleOpen = async () => {
  if (openDropdown.value) {
    openDropdown.value = false;
    return;
  }

  openDropdown.value = true;

  if (!dropdown.value || !props.showSearchbar) {
    return;
  }

  await nextTick();
  dropdown.value.focusSearchInput();
};
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.Multiselect {
  &__toggle {
    position: relative;
    background-color: var(--color-white);
    border: 1px solid var(--color-neutral-60);
    border-radius: var(--border-radius-default);
    padding: rem(7);
    cursor: pointer;
    @include font-regular(14);

    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    &:hover {
      border-color: var(--color-text-80);
    }

    &[open] {
      border-color: var(--color-primary-100);
    }

    &[has-selected-options] {
      border-color: var(--color-primary-100);
      background-color: var(--color-primary-05);

      &:hover {
        background-color: var(--color-primary-10);
      }
    }
  }

  &__chevron {
    transition: 0.2s ease-in-out;
  }

  &__no-results {
    display: flex;
    justify-content: center;
    align-items: center;
    height: rem(34);
    @include font-regular(14);
  }

  &__chip {
    @include font-regular(12);

    position: absolute;
    top: rem(-6);
    right: rem(-6);
    height: rem(18);
    width: rem(18);
    border-radius: 100%;
    background-color: var(--color-primary-100);
    color: var(--color-white);
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.rotate180 {
  transform: rotate(-180deg);
}
</style>
