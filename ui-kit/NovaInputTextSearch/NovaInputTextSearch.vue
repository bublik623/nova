<template>
  <div ref="component">
    <NovaDropdown
      :options="searchResults.map((r) => ({ label: r, value: r }))"
      :show="dropdownOpen"
      :loading="dropdownLoading"
      :max-height="maxHeight"
      @select:option="handleSelectOption"
    >
      <template #toggle>
        <NovaInputText
          :id="id"
          :model-value="searchText ?? modelValue"
          :placeholder="placeholder"
          :disabled="disabled"
          :error="error"
          left-icon="search"
          @update:model-value="handleInputUpdate"
        />
      </template>
    </NovaDropdown>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import debounce from "lodash.debounce";
import NovaDropdown from "../NovaDropdown/NovaDropdown.vue";
import NovaInputText from "../NovaInputText/NovaInputText.vue";
import { useDetectClickOutside } from "@/composables/useDetectClickOutside";
import { Option } from "@/types/Option";

export interface Props {
  id: string;
  modelValue: string;
  onSearchUpdate: (value: string) => Promise<string[]>;
  debounce?: number;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  maxHeight?: number;
}

interface Events {
  (e: "update:modelValue", opt: string): void;
}

const props = defineProps<Props>();
const emits = defineEmits<Events>();
const component = ref<Element | null>(null);

useDetectClickOutside(component, () => {
  toggleDropdown(false);
  searchText.value = null;
});

const dropdownOpen = ref(false);
const dropdownLoading = ref(false);
const toggleDropdown = (show: boolean) => {
  dropdownOpen.value = show;
};

const searchText = ref<null | string>(null);
const searchResults = ref<string[]>([]);
function handleInputUpdate(value: string) {
  searchText.value = value;

  if (value) {
    dropdownLoading.value = true;
    toggleDropdown(true);
    debouncedOnSearchUpdate();
  } else {
    toggleDropdown(false);
  }
}

const debouncedOnSearchUpdate = debounce(async () => {
  searchResults.value = await props.onSearchUpdate(searchText.value ?? "");
  dropdownLoading.value = false;

  if (searchResults.value.length < 1) {
    toggleDropdown(false);
  }
}, props.debounce);

function handleSelectOption(opt: Option) {
  emits("update:modelValue", opt.value);
  toggleDropdown(false);
  searchText.value = null;
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.SelectSearch {
  position: relative;
  cursor: pointer;
  width: 100%;
  border: var(--border-default);
  border-radius: var(--border-radius-default);
  padding: rem(5);
  display: flex;
  align-items: center;
  justify-content: space-between;

  & > svg {
    flex-shrink: 0;
  }

  &__input {
    width: 100%;
    margin: 0 rem(5);
    background-color: transparent;
    outline: none;
    border: none;

    @include font-semibold(14);

    &::placeholder {
      font-style: italic;
      color: var(--color-text-70);
    }

    &:disabled {
      cursor: not-allowed;
    }
  }

  &__label {
    position: relative;
    bottom: 5px;

    @include font-semibold(12);

    color: var(--color-text-90);
  }

  &:hover:not([disabled]),
  &:focus-visible:not([disabled]),
  &[open] {
    border: var(--border-primary);
  }

  &[disabled] {
    cursor: not-allowed;
    background-color: var(--color-grey-70);

    & > svg {
      color: var(--color-text-70);
    }
  }

  &[error] {
    border: 1px solid var(--color-error-100);
  }

  &__right-icon {
    transition: transform 0.2s;

    &[open] {
      transform: rotate(180deg);
    }
  }

  &__error-msg {
    position: absolute;
    right: 5px;
    top: calc(100% + 2px);
    color: var(--color-error-100);

    @include font-semibold(12);
  }
}
</style>
