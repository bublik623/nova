<template>
  <div class="Dropdown">
    <slot name="toggle" />
    <div v-if="show" :class="{ Dropdown__list: true, 'Dropdown__list--scrollbar-hidden': hideScrollbar }">
      <div v-if="loading" class="Dropdown__spinner">
        <NovaSpinner />
      </div>
      <NovaOptionsList
        v-else
        :options="options"
        :multi="multi"
        :selected="selected"
        @click:clear="$emit('click:clear')"
        @keydown:esc="$emit('keydown:esc')"
        @select:option="(opt) => $emit('select:option', opt)"
      >
        <template #before-items>
          <div v-if="showSearchbar" ref="searchInputRef" class="Dropdown__searchbar">
            <NovaInputText
              id="dropdown-searchbar"
              :model-value="searchQuery"
              left-icon="search"
              :placeholder="$t('common.search')"
              @update:model-value="(value) => $emit('update:searchQuery', value)"
            />
          </div>
        </template>
        <template #default="{ option }">
          <slot :option="option" />
        </template>
      </NovaOptionsList>
      <div v-if="!options.length">
        <slot name="empty"></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup generic="T extends ListOption">
import { computed } from "vue";
import NovaSpinner from "../NovaSpinner/NovaSpinner.vue";
import NovaOptionsList from "../NovaOptionsList/NovaOptionsList.vue";
import NovaInputText from "../NovaInputText/NovaInputText.vue";
import { ListOption } from "@/types/Option";

export interface Props<T> {
  options: T[];
  selected?: T[];
  show?: boolean;
  maxHeight?: number;
  multi?: boolean;
  loading?: boolean;
  hideScrollbar?: boolean;
  showSearchbar?: boolean;
  searchQuery?: string;
}

export interface NovaDropdownMethods {
  focusSearchInput: () => void;
}

interface Events<T> {
  (e: "select:option", option: T): void;
  (e: "click:clear"): void;
  (e: "keydown:esc"): void;
  (e: "update:searchQuery", value: string): void;
}

const props = defineProps<Props<T>>();
defineEmits<Events<T>>();
const searchInputRef = ref<HTMLElement>();

function focusSearchInput() {
  if (!searchInputRef.value) {
    return;
  }

  const searchBar: HTMLInputElement | null = searchInputRef.value!.querySelector("#dropdown-searchbar");
  searchBar?.focus();
}

defineExpose({
  focusSearchInput,
});

const dropdownHeight = computed(() => `${props.maxHeight ?? 100}px`);
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.Dropdown {
  position: relative;

  &__spinner {
    height: v-bind(dropdownHeight);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  &__list {
    width: 100%;
    max-height: v-bind(dropdownHeight);
    overflow-x: hidden;
    position: absolute;
    top: calc(100% + 4px);
    border: var(--border-default);
    border-radius: var(--border-radius-default);
    box-shadow: var(--box-shadow-popover);
    background-color: var(--color-white);
    z-index: var(--z-index-dropdown);

    &--scrollbar-hidden {
      /* Hide scrollbar for IE, Edge and Firefox */
      -ms-overflow-style: none; /* IE and Edge */
      scrollbar-width: none; /* Firefox */

      /* Hide scrollbar for Chrome, Safari and Opera */
      &::-webkit-scrollbar {
        display: none;
      }
    }
  }

  &__searchbar {
    margin: rem(8);

    :deep(.InputText) {
      background-color: var(--color-neutral-30);
      border: none;
    }
  }
}
</style>
