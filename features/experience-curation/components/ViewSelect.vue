<template>
  <NovaDropdown :show="showDropdown" :options="viewOptions" @select:option="$emit('update:modelValue', $event.value)">
    <template #toggle>
      <button
        ref="component"
        class="ViewSelect__toggle"
        aria-haspopup="listbox"
        aria-labelledby="dropdown-label"
        data-testid="view-select-button"
        @click="showDropdown = !showDropdown"
      >
        <span :class="`ViewSelect__option--${selectedOption?.value}`">{{ $t(selectedOption?.label ?? "") }}</span>
        <NovaIcon name="chevron-down" :open="showDropdown || null" :size="10" />
      </button>
    </template>

    <template #default="{ option }">
      <span class="ViewSelect__option">{{ $t(option.label) }}</span>
    </template>
  </NovaDropdown>
</template>

<script lang="ts" setup>
import { useDetectClickOutside } from "@/composables/useDetectClickOutside";
import NovaDropdown from "@/ui-kit/NovaDropdown/NovaDropdown.vue";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";

export type ViewType = "all" | "commercial";

export interface Props {
  modelValue: ViewType;
}

interface Events {
  (e: "update:modelValue", value: ViewType): void;
}

const props = defineProps<Props>();
defineEmits<Events>();

const component = ref<HTMLElement | null>(null);
const showDropdown = ref(false);
useDetectClickOutside(component, () => (showDropdown.value = false));

const viewOptions: { label: string; value: ViewType }[] = [
  { label: "experience.curation.view-type.all", value: "all" },
  { label: "experience.curation.view-type.commercial", value: "commercial" },
];

const selectedOption = computed(() => viewOptions.find((o) => o.value === props.modelValue));
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.ViewSelect {
  &__toggle {
    cursor: pointer;
    background: none;
    border: none;
    display: flex;
    align-items: center;
    white-space: nowrap;
    gap: 5px;

    .svg-icon {
      transition: transform 0.2s;

      &[open] {
        transform: rotate(180deg);
      }
    }
  }

  &__option {
    white-space: nowrap;
    margin: rem(-3) rem(-8);
  }

  &__option,
  &__toggle {
    @include font-regular(12);
  }
}
</style>
