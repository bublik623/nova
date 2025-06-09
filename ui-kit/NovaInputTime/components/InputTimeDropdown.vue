<template>
  <NovaDropdown
    ref="element"
    :show="showDropdown"
    :options="dropdownOptions"
    :max-height="260"
    :hide-scrollbar="true"
    @select:option="
      $emit('update:modelValue', $event.label);
      showDropdown = false;
    "
  >
    <template #toggle>
      <input
        :id="id"
        type="text"
        class="InputTime__input"
        :theme="isInvalid ? 'error' : 'default'"
        :data-testid="`${id}-input`"
        :value="inputValue"
        placeholder="00"
        :disabled="disabled"
        :readonly="!showDropdown"
        maxlength="2"
        @input="handleInput"
        @click="showDropdown = !showDropdown"
      />
    </template>
    <template #default="{ option }">
      <span :id="`${id}-dropdown-item-${option.label}`" class="InputTime__dropdown-item">{{ option.label }}</span>
    </template>
  </NovaDropdown>
</template>

<script lang="ts" setup>
import { Option } from "@/types/Option";
import { onClickOutside } from "@vueuse/core";
import NovaDropdown from "../../NovaDropdown/NovaDropdown.vue";

interface Props {
  id: string;
  modelValue: string;
  dropdownOptions: Option[];
  isInvalid?: boolean;
  disabled?: boolean;
}

interface Events {
  (e: "update:modelValue", value: string): void;
}

const props = defineProps<Props>();
defineEmits<Events>();

const element = ref<HTMLElement | null>(null);
const showDropdown = ref(false);

onClickOutside(element, () => (showDropdown.value = false));

// Data handling
const inputValue = ref(props.modelValue);

watch(
  () => props.modelValue,
  (val) => (inputValue.value = val)
);

watch(showDropdown, () => {
  inputValue.value = showDropdown.value ? "" : props.modelValue;
});

// Input handling
function handleInput(event: Event) {
  showDropdown.value = true;
  const value = (event.target as HTMLInputElement).value;
  const filteredOptions = props.dropdownOptions.filter((h) => h.label.includes(value));

  if (filteredOptions.length) {
    // Scroll dropdown to first matching option
    const el = document.getElementById(`${props.id}-dropdown-item-${filteredOptions[0].label}`);
    if (!el) {
      return;
    }
    el.scrollIntoView();
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.InputTime {
  &__input {
    --border-color: var(--color-grey-100);

    width: rem(38);
    height: rem(32);
    padding: 0 rem(7);
    border: var(--border-default);
    border-color: var(--border-color);
    border-radius: var(--border-radius-sm);
    background-color: white;
    outline: none;
    color: var(--color-text-100);
    @include font-regular(14);

    &::placeholder {
      font-style: italic;
      color: var(--color-text-70);
    }

    &:hover,
    &:focus-within {
      border-color: var(--color-primary-100);
    }

    &:disabled {
      cursor: not-allowed;
      background: #f9f9fb;
      color: var(--color-text-70);

      &:hover:not([data-invalid]) {
        border-color: var(--color-grey-100);
      }
    }

    &[theme="error"] {
      --border-color: var(--color-error-100);
    }
  }

  &__dropdown-item {
    margin-left: -6px;
  }
}
</style>
