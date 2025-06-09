<template>
  <div class="OptionsList">
    <div class="OptionsList__header">
      <div v-if="multi" class="OptionsList__clear">
        <span data-testid="options-list-selected">{{ selected?.length || "0" }} selected</span>
        <nova-button
          v-if="!readonly"
          variant="underlined"
          size="xs"
          data-testid="options-list-clear-button"
          :disabled="disabled"
          @click="$emit('click:clear')"
          >Clear all</nova-button
        >
      </div>
      <slot name="before-items" />
    </div>
    <ul v-if="readonly" class="OptionsList__readonly">
      <li
        v-for="selectedOption in selected"
        :key="selectedOption.value"
        :data-testid="`options-list-list-item-${selectedOption.value}`"
      >
        {{ options.find((opt) => isEqual(opt.value, selectedOption.value))?.label }}
      </li>
    </ul>
    <ul v-else class="OptionsList__list" data-testid="options-list-list">
      <li
        v-for="option in options"
        :id="`option-list-item-${option.label}`"
        :key="option.label + option.value"
        :tabindex="multi ? -1 : 0"
        class="OptionsList__list-item"
        :data-testid="`options-list-list-item-${option.value}`"
        :disabled="disabled || null"
        :selected="isOptionSelected(option) || null"
        @click="handleOptionSelection(option)"
        @keydown.enter.space="handleOptionSelection(option)"
        @keydown.esc="$emit('keydown:esc')"
      >
        <nova-checkbox
          v-if="multi"
          size="sm"
          :value="String(option.value)"
          class="mr-4"
          :status="isOptionSelected(option) ? 'checked' : 'unchecked'"
          :disabled="disabled"
          @update:status="$emit('select:option', option)"
        />

        <slot :option="option">{{ option.label }} </slot>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup generic="T extends ListOption">
import NovaCheckbox from "@/ui-kit/NovaCheckbox/NovaCheckbox.vue";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import { ListOption } from "@/types/Option";
import { isEqual } from "lodash";

export interface Props<T> {
  options: ListOption<T>[];
  selected?: ListOption<T>[];
  multi?: boolean;
  disabled?: boolean;
  readonly?: boolean;
}

interface Events<T> {
  (e: "select:option", option: ListOption<T>): void;
  (e: "click:clear"): void;
  (e: "keydown:esc"): void;
}

const props = defineProps<Props<T>>();
const emits = defineEmits<Events<T>>();

const handleOptionSelection = (opt: ListOption<T>) => {
  if (isOptionDisabled(opt) && !props.multi) {
    return;
  }

  emits("select:option", opt);
};

const isOptionSelected = (opt: ListOption<T>): boolean => {
  if (props.selected) {
    return props.selected.some((o) => isEqual(o.value, opt.value));
  }
  return false;
};

const isOptionDisabled = (opt: ListOption<T>): boolean => {
  return opt.disabled ?? false;
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.OptionsList {
  &__clear {
    padding: rem(2) rem(16) rem(2) rem(16);
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--color-grey-90);
    color: var(--color-text-90);
    @include font-regular(12);
  }

  &__list {
    width: 100%;

    @include font-regular(14);
  }

  &__list-item {
    cursor: pointer;
    padding: rem(8) rem(16);
    display: flex;
    align-items: center;

    &:hover {
      background-color: var(--color-grey-80);
    }

    &[disabled] {
      cursor: not-allowed;

      &:hover {
        background-color: inherit;
      }
    }

    &[selected] {
      color: var(--color-primary-100);

      &[disabled] {
        color: var(--color-text-100);
      }
    }
  }

  &__header {
    background: var(--color-white);
    position: sticky;
    top: 0;
    z-index: 3;
  }

  &__readonly {
    color: var(--color-text-100);
    padding: rem(8) rem(28);
    @include font-regular(14);

    li {
      list-style: disc;
      margin-top: rem(4);
    }
  }
}
</style>
