<script setup lang="ts">
import { cn } from "@/packages/ui/lib/utils";
import { Label, type LabelProps } from "reka-ui";
import { computed, type HTMLAttributes } from "vue";

const props = defineProps<LabelProps & { class?: HTMLAttributes["class"] }>();

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;

  return delegated;
});
</script>

<template>
  <Label
    v-bind="delegatedProps"
    data-slot="label"
    :class="
      cn(
        'cursor-pointer flex items-center gap-2 text-sm leading-none font-normal select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:text-text-90 peer-disabled:cursor-not-allowed peer-disabled:text-text-90',
        props.class
      )
    "
  >
    <slot />
  </Label>
</template>
