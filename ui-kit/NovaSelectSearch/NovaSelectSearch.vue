<template>
  <nova-dropdown
    ref="dropdown"
    :options="options"
    :show="dropdownOpen"
    :multi="multi"
    :max-height="maxHeight"
    :selected="selected"
    :loading="loading"
    @select:option="handleSelectOption"
    @keydown:esc="toggleDropdown(false)"
    @click:clear="$emit('clear:options')"
  >
    <template #toggle>
      <label v-if="label" :for="id" class="SelectSearch__label">{{ label }}</label>
      <div
        class="SelectSearch"
        :style="{ 'background-color': backgroundColor }"
        :disabled="disabled || null"
        :open="dropdownOpen || null"
        @click="toggleDropdown(!dropdownOpen)"
      >
        <nova-icon name="search" :size="18" class="SelectSearch__left-icon" />
        <input
          :id="id"
          type="text"
          class="SelectSearch__input"
          data-testid="select-search-input"
          :value="inputText"
          :placeholder="placeholder"
          :disabled="disabled"
          :error="error || null"
          :open="dropdownOpen || null"
          @input="handleInput"
          @keydown.esc="toggleDropdown(false)"
        />
        <nova-icon name="chevron-down" class="SelectSearch__right-icon" :open="dropdownOpen || null" :size="14" />
        <span v-if="error" class="SelectSearch__error-msg" data-testid="select-search-error">{{ error }}</span>
      </div>
    </template>
    <template #default="{ option }">
      <slot :option="option"></slot>
    </template>
  </nova-dropdown>
</template>

<script lang="ts" setup generic="TValue">
import { ref } from "vue";
import NovaDropdown from "../NovaDropdown/NovaDropdown.vue";
import NovaIcon from "../NovaIcon/NovaIcon.vue";
import { BaseOption } from "@/types/Option";
import { onClickOutside } from "@vueuse/core";

export interface Props<T> {
  id: string;
  loading?: boolean;
  options: BaseOption<T>[];
  selected?: BaseOption<T>[];
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  error?: string;
  maxHeight?: number;
  multi?: boolean;
  backgroundColor?: string;
}

interface Events {
  (e: "update:searchQuery", value: string): void;
  (e: "select:option", opt: BaseOption<TValue>): void;
  (e: "clear:options"): void;
  (e: "change:open", isOpen: boolean): void;
}

const props = withDefaults(defineProps<Props<TValue>>(), { loading: false, backgroundColor: "transparent" });
const emits = defineEmits<Events>();

const dropdown = ref();
const searchQuery = ref("");
const dropdownOpen = ref(false);

const toggleDropdown = (show: boolean) => {
  dropdownOpen.value = show;

  emits("change:open", show);

  if (!show) {
    searchQuery.value = "";
  }
};

onClickOutside(dropdown, () => toggleDropdown(false));

const handleInput = (event: Event) => {
  toggleDropdown(true);

  if (event.target) {
    const { value } = event.target as HTMLInputElement;
    searchQuery.value = value;
    emits("update:searchQuery", value);
  }
};

const handleSelectOption = (opt: BaseOption<TValue>) => {
  if (!props.multi) {
    toggleDropdown(false);
  }
  emits("select:option", opt);
};

const inputText = computed(() => {
  if (dropdownOpen.value) {
    return searchQuery.value;
  } else if (!props.multi && props.selected?.length) {
    return props.selected[0].label;
  }
});
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
