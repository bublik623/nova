<template>
  <nova-dropdown
    :options="options"
    :show="dropdownOpen"
    :max-height="maxHeight"
    :loading="loading"
    :selected="selected && [selected]"
    @select:option="handleSelectOption"
    @keydown:esc="toggleDropdown(false)"
  >
    <template #toggle>
      <button
        v-if="!readonly"
        ref="component"
        class="Select"
        aria-haspopup="listbox"
        aria-labelledby="dropdown-label"
        data-testid="select-button"
        :data-invalid="isInvalid === false ? undefined : true"
        :disabled="disabled"
        :error="error || null"
        :open="dropdownOpen || null"
        @click="toggleDropdown(!dropdownOpen)"
        @keydown.esc="toggleDropdown(false)"
      >
        <span v-if="selected" id="dropdown-label">
          <slot :option="selected">
            {{ selected.label }}
          </slot>
        </span>
        <span v-else id="dropdown-label" class="Select__placeholder">{{ placeholder }}</span>
        <nova-icon name="chevron-down" class="Select__icon" :open="dropdownOpen || null" :size="14" />
        <span v-if="error" class="Select__error-msg" data-testid="select-error">{{ error }}</span>
      </button>
      <div v-else-if="selected" data-testid="select-readonly" class="Select__readonly">
        <slot :option="selected">
          {{ selected.label }}
        </slot>
      </div>
      <NoContentUtil v-else />
    </template>
    <template #default="{ option }">
      <slot :option="option" />
    </template>
  </nova-dropdown>
</template>

<script lang="ts" setup generic="V">
import { ref } from "vue";
import NovaDropdown from "../NovaDropdown/NovaDropdown.vue";
import NovaIcon from "../NovaIcon/NovaIcon.vue";
import { useDetectClickOutside } from "@/composables/useDetectClickOutside";
import { BaseOption } from "@/types/Option";
import NoContentUtil from "@/features/experience-shared/components/NoContentUtil.vue";

export interface Props<T> {
  options: BaseOption<T>[];
  selected?: BaseOption<T>;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  maxHeight?: number;
  loading?: boolean;
  isInvalid?: boolean;
  readonly?: boolean;
}
const component = ref<Element | null>(null);

interface Events {
  (e: "select:option", opt: BaseOption<V>): void;
}
useDetectClickOutside(component, () => {
  toggleDropdown(false);
});

defineProps<Props<V>>();
const emits = defineEmits<Events>();

const dropdownOpen = ref(false);
const toggleDropdown = (show: boolean) => {
  dropdownOpen.value = show;
};

const handleSelectOption = (opt: BaseOption<V>) => {
  toggleDropdown(false);
  emits("select:option", opt);
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.Select {
  position: relative;
  cursor: pointer;
  width: 100%;
  background-color: transparent;
  outline: none;
  border: var(--border-default);
  border-radius: var(--border-radius-default);
  padding: rem(5) rem(10);

  @include font-regular(14);

  display: flex;
  align-items: center;
  justify-content: space-between;

  #dropdown-label {
    display: flex;
    align-items: center;
  }

  &:disabled {
    cursor: not-allowed;
    background-color: var(--color-grey-70);

    & > svg {
      color: var(--color-text-70);
    }
  }

  &[data-invalid] {
    border-color: var(--color-error-100) !important;
  }

  &:hover:not(:disabled),
  &:focus-visible:not(:disabled),
  &[open] {
    border: var(--border-primary);
  }

  &[error] {
    border: 1px solid var(--color-error-100);
  }

  &__placeholder {
    font-style: italic;
    color: var(--color-text-70);
  }

  &__icon {
    margin-left: rem(10);
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

  &__readonly {
    display: flex;
    align-items: center;
    @include font-regular(14);
  }
}
</style>
