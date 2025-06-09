<template>
  <div
    class="CollapsableList"
    :open="open || null"
    :selected="status !== 'unchecked' || null"
    :disabled="isDisabled || null"
    :readonly="readonly || null"
  >
    <div class="CollapsableList__header" data-testid="collapsable-list-header" @click="open = !open">
      <div class="CollapsableList__title">
        <NovaCheckbox
          v-if="showCheckbox"
          :id="title"
          class="mr-2"
          :status="status"
          :value="title"
          :disabled="isDisabled"
          @update:status="handleMultipleSelection(status)"
        />
        <p>{{ title }}</p>
      </div>
      <div class="CollapsableList__icon">
        <NovaIcon name="chevron-down" :size="14"></NovaIcon>
      </div>
    </div>
    <div v-if="open" class="CollapsableList__panel" data-testid="collapsable-check-list-panel">
      <p v-if="description" class="CollapsableList__description">
        {{ description }}
      </p>
      <div class="CollapsableList__clear">
        <span data-testid="collapsable-check-list-count"
          >{{ modelValue.length || "0" }} {{ $t("common.dropdown.header.selected") }}</span
        >
        <NovaButton
          v-if="!readonly"
          variant="underlined"
          size="xs"
          data-testid="collapsable-check-list-clear-btn"
          :disabled="!modelValue.length || isDisabled"
          @click="modelValue = []"
        >
          {{ $t("common.dropdown.clear.button") }}</NovaButton
        >
      </div>
      <ul v-if="!readonly" class="List">
        <li v-for="option in options" :key="option.value" class="List__item">
          <NovaCheckbox
            :id="title"
            data-testid="collapsable-check-list-item"
            :label="option.label"
            :disabled="isDisabled"
            :value="option.value"
            :status="modelValue.some((item) => item.value === option.value) ? 'checked' : 'unchecked'"
            @update:status="() => handleSelection([option])"
          />
        </li>
      </ul>
      <ul v-else class="List__readonly" data-testid="collapsable-check-list-readonly">
        <li v-for="option in modelValue" :key="option.value" class="List__item">{{ option.label }}</li>
      </ul>
    </div>
  </div>
</template>
<script setup lang="ts">
import { Option } from "@/types/Option";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import NovaCheckbox, { NovaCheckBoxStatus } from "@/ui-kit/NovaCheckbox/NovaCheckbox.vue";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";
import { useVModels } from "@vueuse/core";

interface Props {
  open?: boolean;
  modelValue: Option[];
  title: string;
  showCheckbox?: boolean;
  options: Option[];
  columns?: number;
  description?: string;
  isDisabled?: boolean;
  readonly?: boolean;
}

interface Events {
  (e: "update:modelValue", value: Option[]): void;
  (e: "update:open", value: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Events>();

const { open, modelValue } = useVModels({ open: props.open, modelValue: props.modelValue }, emit, { passive: true });

const handleSelection = (options: Option[]) => {
  const newValues = [...modelValue.value];
  options.forEach((option) => {
    const index = newValues.findIndex((opt) => opt.value === option.value);

    if (index !== -1) {
      newValues.splice(index, 1);
    } else {
      newValues.push(option);
    }
  });
  // needed to emit the event in vitest
  modelValue.value = [...newValues];
};

const handleMultipleSelection = (checkboxStatus: NovaCheckBoxStatus) => {
  if (checkboxStatus === "unchecked") {
    handleSelection(props.options);
  } else {
    modelValue.value = [];
  }
};

const status: ComputedRef<NovaCheckBoxStatus> = computed(() => {
  switch (modelValue.value.length) {
    case 0:
      return "unchecked";
    case props.options.length:
      return "checked";

    default:
      return "indeterminate";
  }
});

const TEMPLATE_COLUMNS = `repeat(${props.columns || 1}, 1fr)`;
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.CollapsableList {
  border-radius: var(--border-radius-default);
  border: 1px solid var(--color-neutral-60);

  &__header {
    border-radius: var(--border-radius-default);
    background: var(--color-neutral-10);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 rem(16);
    height: rem(40);
    cursor: pointer;
  }

  &__icon {
    color: var(--color-text-100);
    display: flex;
    transition: transform ease 0.2s;
  }

  &__panel {
    padding: 0 rem(16);
    border-top: 1px solid var(--color-neutral-60);
  }

  &__title {
    color: var(--color-text-100);
    white-space: nowrap;
    display: flex;

    @include font-semibold(14);
  }

  &__description {
    padding: rem(8) 0;
    color: var(--color-text-90);

    @include font-regular(14);
  }

  &__clear {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--color-grey-90);
    color: var(--color-text-90);
    padding-top: rem(16);

    @include font-regular(12);
  }

  .CollapsableList[selected]:not([readonly]) .CollapsableList__panel {
    border-top: 1px solid var(--color-primary-100);
  }

  &:hover:not([selected]):not([disabled]) {
    border: 1px solid var(--color-text-80);

    .CollapsableList__panel {
      border-top: 1px solid var(--color-text-80);
    }
  }

  &[open] {
    .CollapsableList__header {
      border-radius: var(--border-radius-default) var(--border-radius-default) 0 0;
      border-bottom-color: var(--color-neutral-60);
    }

    .CollapsableList__icon {
      transform: rotateZ(180deg);
    }

    &:hover {
      .CollapsableList__header {
        border-bottom-color: var(--color-text-80);
      }
    }
  }

  &[selected]:not([readonly]) {
    border: 1px solid var(--color-primary-100);

    .CollapsableList__header {
      background: var(--color-primary-05);
    }
  }

  &[selected]:hover:not([readonly]) {
    .CollapsableList__header {
      background: var(--color-primary-10);
    }
  }

  &[disabled] {
    .CollapsableList__title {
      color: var(--color-neutral-60);
    }

    .CollapsableList__icon {
      color: var(--color-text-70);
    }
  }
}

.List {
  margin: rem(6) 0;
  display: grid;
  grid-template-columns: v-bind(TEMPLATE_COLUMNS);

  &__item {
    padding: rem(6) 0;
  }

  &__readonly {
    color: var(--color-text-100);
    padding: rem(8) rem(14);

    @include font-regular(14);

    li {
      list-style: disc;
      margin-top: rem(4);
    }
  }
}
</style>
