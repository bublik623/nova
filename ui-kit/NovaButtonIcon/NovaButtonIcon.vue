<template>
  <component
    :is="componentIs"
    class="IconButton"
    :class="{
      'IconButton--isNuxtLink': !!to,
    }"
    :disabled="disabled || loading"
    :loading="loading || null"
    :selected="selected || null"
    :theme="theme || null"
    :shape="shape || null"
    data-testid="nova-button-icon"
    :to="to || null"
  >
    <div v-if="loading" class="LoadingOverlay">
      <NovaSpinner :size="size" />
    </div>
    <span class="TextContainer" :class="loading ? 'TextContainer--hide-text' : null">
      <NovaIcon :name="name" :size="size" />
    </span>
  </component>
</template>
<script lang="ts" setup>
import { computed } from "vue";
import NovaSpinner from "../NovaSpinner/NovaSpinner.vue";
import NovaIcon, { Icon } from "../NovaIcon/NovaIcon.vue";

export interface Props {
  disabled?: boolean;
  loading?: boolean;
  theme?: "light" | "primary" | "dark";
  shape?: "square" | "circle";
  selected?: boolean;
  name: Icon;
  size?: number;
  to?: string;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  theme: "primary",
  shape: "circle",
  size: 20,
});

const getPXSize = computed(() => props.size + 12 + "px");

// https://github.com/nuxt/nuxt/issues/13483#issuecomment-1397304026
const componentIs = computed(() => (props.to ? resolveComponent("NuxtLink") : "button"));
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.IconButton {
  --icon-color: #fff;
  --icon-color-hover: #fff;
  --icon-color-selected: #fff;
  --icon-color-selected-hover: #fff;
  --icon-background-color: #000;
  --icon-background-color-hover: #000;
  --icon-background-color-selected: #000;
  --icon-background-color-selected-hover: #000;

  margin: 0;
  border: 2px solid transparent;
  width: v-bind(getPXSize);
  height: v-bind(getPXSize);
  display: inline-flex;
  justify-content: center;
  position: relative;
  overflow: hidden;
  align-items: center;
  cursor: pointer;
  color: var(--icon-color);
  background-color: var(--icon-background-color);

  &:focus-visible {
    outline: 2px solid var(--color-primary-50);
  }

  &:hover {
    color: var(--icon-color-hover);
    background-color: var(--icon-background-color-hover);
  }

  &:disabled {
    cursor: not-allowed;
  }

  &[selected],
  &:active:not([loading]) {
    color: var(--icon-color-selected);
    background-color: var(--icon-background-color-selected);
  }

  &[selected]:hover,
  &:active:not([loading])[selected] {
    color: var(--icon-color-selected-hover);
    background-color: var(--icon-background-color-selected-hover);
  }

  &:disabled:not([loading]) {
    color: var(--color-grey-100);

    &:hover {
      background-color: var(--color-grey-70);
      color: var(--color-grey-100);
    }

    &[selected] {
      background-color: var(--color-grey-70);
    }

    &:hover[selected] {
      background-color: var(--color-grey-80);
    }
  }

  &[theme="dark"] {
    --icon-color: var(--color-text-100);
    --icon-color-hover: var(--color-text-100);
    --icon-color-selected: var(--color-primary-100);
    --icon-color-selected-hover: var(--color-primary-100);
    --icon-background-color: transparent;
    --icon-background-color-hover: var(--color-primary-10);
    --icon-background-color-selected: var(--color-primary-20);
    --icon-background-color-selected-hover: var(--color-primary-40);
  }

  &[theme="primary"] {
    --icon-color: var(--color-primary-110);
    --icon-color-hover: var(--color-primary-110);
    --icon-color-selected: var(--color-primary-110);
    --icon-color-selected-hover: var(--color-primary-110);
    --icon-background-color: transparent;
    --icon-background-color-hover: var(--color-primary-10);
    --icon-background-color-selected: var(--color-primary-20);
    --icon-background-color-selected-hover: var(--color-primary-40);
  }

  &[theme="light"] {
    --icon-color: white;
    --icon-color-hover: white;
    --icon-color-selected: white;
    --icon-color-selected-hover: white;
    --icon-background-color: rgb(255 255 255 / 0%);
    --icon-background-color-hover: rgb(255 255 255 / 10%);
    --icon-background-color-selected: rgb(255 255 255 / 20%);
    --icon-background-color-selected-hover: rgb(255 255 255 / 40%);
  }

  &[shape="circle"] {
    border-radius: 50%;
  }

  &[shape="square"] {
    border-radius: var(--border-radius-xs);
  }

  .TextContainer {
    display: flex;
    justify-content: center;

    &--hide-text {
      opacity: 0;
    }
  }

  .LoadingOverlay {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
