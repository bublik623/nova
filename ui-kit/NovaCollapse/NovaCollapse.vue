<template>
  <div class="NovaCollapse" :class="getClasses()" data-testid="nova-collapse">
    <div
      class="NovaCollapse__header"
      :open="open || null"
      data-testid="nova-collapse-header"
      @click="open = !open"
      @mouseenter="hover = true"
      @mouseleave="hover = false"
    >
      <div class="NovaCollapse__title-wrapper">
        <slot name="title">
          <div class="NovaCollapse__title" data-testid="nova-collapse-title">{{ title }}</div>
        </slot>
      </div>

      <div class="NovaCollapse__header-right">
        <div class="NovaCollapse__actions" data-testid="nova-collapse-actions" @click.stop>
          <slot name="actions"></slot>
        </div>

        <div class="NovaCollapse__icon">
          <NovaButtonIcon
            v-if="open"
            name="chevron-up"
            :size="12"
            shape="square"
            data-testid="collapsible-action-toggle"
            aria-expanded="true"
          />
          <NovaButtonIcon
            v-else
            name="chevron-down"
            :size="12"
            shape="square"
            data-testid="collapsible-action-toggle"
            aria-expanded="false"
          />
        </div>
      </div>
    </div>

    <div v-show="open" class="NovaCollapse__panel" data-testid="nova-collapse-content">
      <slot />
    </div>

    <div v-if="$slots.closedContent" v-show="!open" class="NovaCollapse__closed-content">
      <slot name="closedContent" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useVModel } from "@vueuse/core";
import NovaButtonIcon from "../NovaButtonIcon/NovaButtonIcon.vue";

interface Props {
  title?: string;
  size?: "md" | "lg" | "no-limit";
  modelValue?: boolean;
  active?: boolean;
}

interface Events {
  (e: "update:modelValue", value: boolean): void;
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  size: "lg",
  title: undefined,
});
const emits = defineEmits<Events>();
const hover = ref(false);

const open = useVModel(props, "modelValue", emits, {
  // if the modelValue prop is not passed, the component emits correctly,
  // but does not have an internal state to modify. setting passive to true
  // creates a local ref that the component can use instead of an external vModel
  passive: true,
});

// I had to use BEM modifiers, as the CSS variables don't play nice with SCSS functions
function getClasses() {
  return [
    `NovaCollapse--size-${props.size}`,
    props.active && "NovaCollapse--active",
    hover.value && "NovaCollapse--header-hover",
  ];
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.NovaCollapse {
  --background-color: var(--color-neutral-10);
  --border-color: var(--color-neutral-60);

  border: 1px solid;
  border-radius: var(--border-radius-default);
  border-color: var(--border-color);

  &__header::before {
    content: "";
    z-index: -1;
    position: absolute;
    background: var(--background-color);
    inset: 0;
  }

  &__header {
    position: relative;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
  }

  &__title-wrapper {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0; // This allows the flex item to shrink below its content size
  }

  &__header-right {
    display: flex;
    align-items: center;
    flex-shrink: 0; // Prevent this from shrinking
  }

  &__actions {
    margin-right: rem(10);
    display: flex;
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__panel {
    border-top: 1px solid var(--border-color);
  }

  &__closed-content {
    background: var(--color-grey-70);
    padding: rem(16);
    border-top: var(--border-default);
    border-bottom-left-radius: var(--border-radius-default);
    border-bottom-right-radius: var(--border-radius-default);
  }

  &--size-no-limit {
    .NovaCollapse__header {
      padding: 0 rem(16);
    }

    .NovaCollapse__title {
      @include font-semibold(16);
    }
  }

  &--size-lg {
    .NovaCollapse__header {
      padding: 0 rem(16);
      height: rem(48);
    }

    .NovaCollapse__title {
      @include font-semibold(16);
    }
  }

  &--size-md {
    .NovaCollapse__header {
      padding: 0 rem(16);
      height: rem(40);
    }

    .NovaCollapse__title {
      @include font-semibold(14);
    }
  }

  &--active {
    --background-color: var(--color-primary-05);
    --border-color: var(--color-primary-100);
  }

  &--active.NovaCollapse--header-hover {
    --background-color: var(--color-primary-10);
  }

  &--header-hover:not(.NovaCollapse--active) {
    --border-color: var(--color-text-80);
  }
}
</style>
