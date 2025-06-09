<template>
  <div ref="component" class="MultiSelect__wrapper">
    <button
      class="MultiSelect__trigger"
      aria-haspopup="listbox"
      :disabled="disabled"
      aria-labelledby="dropdown-label"
      data-testid="multi-select-trigger"
      :data-open="dropdownOpen || null"
      @click="dropdownOpen = !dropdownOpen"
      @keydown.esc="dropdownOpen = false"
    >
      <span v-if="selectedOptions.length" class="MultiSelect__label" data-testid="multi-select-label">
        {{ customLabelText }}
      </span>
      <span v-else class="MultiSelect__placeholder"> {{ placeholder || $t("input.option.placeholder") }}</span>
      <nova-icon name="chevron-down" :data-open="dropdownOpen || null" :size="14" />
    </button>

    <div v-if="dropdownOpen" class="MultiSelect">
      <div class="MultiSelect__header">
        <span>
          {{ modelValue?.length }}
          {{ $t("common.dropdown.header.selected") }}
        </span>
        <NovaButton variant="underlined" size="xs" data-testid="multi-select-clear" @click="handleClear">
          {{ $t("common.dropdown.clear.button") }}</NovaButton
        >
      </div>

      <ul class="MultiSelect__content" data-testid="multi-select-content">
        <li v-for="option in options" :key="option.label" class="MultiSelect__item" data-testid="multi-select-item">
          <NovaCheckbox
            :value="option.value"
            :label="option.label"
            :status="modelValue?.some((p) => p.label === option.label) ? 'checked' : 'unchecked'"
            @update:status="handleSelectOption(option)"
          />
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useVModel } from "@vueuse/core";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";
import NovaCheckbox from "@/ui-kit/NovaCheckbox/NovaCheckbox.vue";
import { useDetectClickOutside } from "@/composables/useDetectClickOutside";

export type MultiSelectOption = {
  label: string;
  value: string;
};

export interface MultiSelectProps {
  options: MultiSelectOption[];
  modelValue: MultiSelectOption[];
  disabled?: boolean;
  placeholder?: string;
  /**
   * Custom Label
   *
   * If `label` is defined and a function, it is called with `commaSeparatedSelectedOptions` as an argument. It will render the return value of the cb.
   * If `label` is a string, it will render as is.
   */
  label?: string | ((text: string) => string);
}
const component = ref<Element | null>(null);

interface Events {
  (e: "update:modelValue", value: MultiSelectOption[]): void;
}

const props = defineProps<MultiSelectProps>();

const emits = defineEmits<Events>();
const selectedOptions = useVModel(props, "modelValue", emits, {
  passive: true,
  deep: true,
  defaultValue: [],
});

const dropdownOpen = ref(false);
const commaSeparatedSelectedOptions = computed(() => selectedOptions.value.map((option) => option.label).join(", "));

// Returns a custom label text based on the `props.label`
const customLabelText = computed(() => {
  if (props.label) {
    return typeof props.label === "function" ? props.label(commaSeparatedSelectedOptions.value) : props.label;
  } else {
    return commaSeparatedSelectedOptions.value;
  }
});

const handleClear = () => {
  selectedOptions.value = [];
};

const handleSelectOption = (option: MultiSelectOption) => {
  const existingOptionIndex = selectedOptions.value.findIndex(
    (existingOption) => existingOption.value === option.value
  );
  if (existingOptionIndex === -1) {
    selectedOptions.value.push(option);
  } else {
    selectedOptions.value.splice(existingOptionIndex, 1);
  }
};

useDetectClickOutside(component, () => {
  dropdownOpen.value = false;
});
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.MultiSelect__wrapper {
  position: relative;
}

.MultiSelect__label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.MultiSelect__placeholder {
  font-style: italic;
  color: var(--color-text-70);
}

.MultiSelect__trigger {
  width: 100%;
  cursor: pointer;
  background-color: transparent;
  outline: none;
  border: var(--border-default);
  border-radius: var(--border-radius-default);
  padding: rem(5) rem(10);
  @include font-semibold(14);

  display: flex;
  align-items: center;
  justify-content: space-between;

  &:disabled {
    background: var(--color-neutral-10);
    cursor: not-allowed;
  }

  &:focus-visible,
  &:hover:not([disabled]),
  &[data-open] {
    border: var(--border-primary);
  }

  .svg-icon {
    margin-left: rem(10);
    transition: transform 0.2s;
    flex-shrink: 0;

    &[data-open] {
      transform: rotate(180deg);
    }
  }
}

.MultiSelect {
  width: 100%;
  padding-bottom: rem(5);
  min-width: rem(265);
  max-height: rem(400);
  overflow-x: hidden;
  position: absolute;
  top: calc(100% + 4px);
  border: var(--border-default);
  border-radius: var(--border-radius-default);
  box-shadow: var(--box-shadow-popover);
  background-color: var(--color-white);
  z-index: var(--z-index-dropdown);
  display: flex;
  flex-direction: column;

  &__header {
    height: rem(40);
    padding: 0 rem(10);
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--color-grey-90);
    color: var(--color-text-90);
    @include font-regular(12);
  }

  &__content {
    padding: 0 rem(10);
  }

  &__item {
    height: rem(36);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
