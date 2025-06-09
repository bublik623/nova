<template>
  <div v-if="!readonly" class="NovaInputRadioGroup">
    <span v-if="label" class="NovaInputRadioGroup__label" :data-testid="`radio-group-${name}-label`">{{ label }}</span>
    <div class="NovaInputRadioGroup__wrapper" :layout="layout || 'horizontal'">
      <nova-input-radio
        v-for="(option, index) in options"
        :key="toKebabCase(option.label)"
        :option="option"
        :label="option.label"
        :name="name"
        :disabled="disabled"
        :style="{ gridColumn: `${index + 1} / ${index + 1}` }"
        :checked="modelValue === option.value"
        @input="$emit('update:modelValue', option.value)"
      >
        <slot :option="option" />
      </nova-input-radio>
    </div>
  </div>
  <div
    v-else
    class="NovaInputRadioGroupReadonly"
    :data-testid="`radio-group-${name}-readonly`"
    :empty="!modelValue || null"
  >
    {{ modelValue ? options.find((el) => el.value === modelValue)?.label : readonlyPlaceholder }}
  </div>
</template>

<script lang="ts" setup>
import { toKebabCase } from "@/utils/to-kebab-case";
import NovaInputRadio, { RadioOption } from "@/ui-kit/NovaInputRadio/NovaInputRadio.vue";

export interface Props {
  modelValue?: RadioOption["value"];
  options: RadioOption[];
  name: string;
  label?: string;
  disabled?: boolean;
  layout?: "vertical" | "horizontal";
  readonly?: boolean;
  readonlyPlaceholder?: string;
}

interface Events {
  (e: "update:modelValue", value: unknown): void;
}

defineProps<Props>();
defineEmits<Events>();
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.NovaInputRadioGroup {
  &__label {
    font-size: rem(10);
    color: var(--color-text-90);
  }

  &__wrapper {
    display: flex;
    gap: rem(10);

    &[layout="vertical"] {
      flex-direction: column;
    }
  }
}

.NovaInputRadioGroupReadonly {
  color: var(--color-text-100);
  @include font-regular(14);

  &[empty] {
    font-style: italic;
    color: var(--color-text-70);
  }
}
</style>
