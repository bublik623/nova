<template>
  <span :class="['label', selectedTheme]" :size="size" data-testid="nova-label">
    <slot></slot>
  </span>
</template>

<script setup lang="ts">
export type LabelTheme =
  | "primary"
  | "secondary"
  | "red"
  | "green"
  | "yellow"
  | "light-grey"
  | "dark-grey"
  | "solid-dark"
  | "solid-secondary"
  | "teal-green"
  | "middle-grey"
  | "solid-green";

export interface NovaLabelProps {
  theme?: LabelTheme;
  size?: "sm" | "md" | "lg";
}

const props = withDefaults(defineProps<NovaLabelProps>(), {
  theme: "primary",
  size: "md",
});

const twThemes: Record<LabelTheme, string> = {
  primary: "bg-primary-10 text-primary-110",
  secondary: "bg-secondary-10 text-secondary-110",
  red: "bg-error-10 text-error-110",
  green: "bg-success-10 text-success-110",
  yellow: "bg-warning-10 text-warning-110",
  "light-grey": "bg-neutral-40",
  "dark-grey": "bg-overlay text-text-100",
  "solid-dark": "bg-text-100 text-white",
  "solid-secondary": "bg-secondary-110 text-white",
  "teal-green": "bg-label-1 text-white",
  "middle-grey": "bg-text-80 text-white",
  "solid-green": "bg-success-110 text-success-110",
};

const selectedTheme = computed(() => twThemes[props.theme]);
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.label {
  height: rem(16);
  display: inline-flex;
  border-radius: 4px;
  padding: 0 rem(7);
  align-items: center;
  @include font-semibold(12);

  &[size="md"] {
    @include font-semibold(12);
  }

  &[size="lg"] {
    height: auto;
    padding: rem(4) rem(8);
    @include font-semibold(14);
  }
}
</style>
