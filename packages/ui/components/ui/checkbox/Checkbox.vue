<script setup lang="ts">
import type { CheckboxRootEmits, CheckboxRootProps } from "reka-ui";
import { cn } from "@/packages/ui/lib/utils";
import { CheckboxIndicator, CheckboxRoot, useForwardPropsEmits } from "reka-ui";
import { computed, type HTMLAttributes } from "vue";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";

const props = defineProps<CheckboxRootProps & { class?: HTMLAttributes["class"] }>();
const emits = defineEmits<CheckboxRootEmits>();

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;

  return delegated;
});

const forwarded = useForwardPropsEmits(delegatedProps, emits);
const isIndeterminate = computed(() => props.modelValue === "indeterminate");
</script>

<template>
  <CheckboxRoot
    data-slot="checkbox"
    v-bind="forwarded"
    :class="
      cn(
        'peer',
        'flex items-center justify-center h-4 w-4 shrink-0 cursor-pointer rounded-[4px]',
        'text-white border border-neutral-60',
        'hover:border-text-80',
        'data-[state=unchecked]:bg-white [&[data-state=unchecked][data-disabled]]:bg-neutral-10',
        'data-[state=checked]:border-primary-100 data-[state=checked]:bg-primary-100 [&[data-state=checked][data-disabled]]:bg-neutral-60',
        'data-[state=indeterminate]:border-primary-100 data-[state=indeterminate]:bg-primary-100 [&[data-state=indeterminate][data-disabled]]:bg-neutral-60',
        'focus:ring-2 focus:outline-none focus:ring-secondary-30',
        'data-[disabled]:cursor-not-allowed data-[disabled]:!border-neutral-60',
        props.class
      )
    "
  >
    <CheckboxIndicator data-slot="checkbox-indicator" class="grid place-content-center">
      <slot>
        <NovaIcon v-if="isIndeterminate" name="minus" :size="14" />
        <NovaIcon v-else name="check" :size="12" />
      </slot>
    </CheckboxIndicator>
  </CheckboxRoot>
</template>
