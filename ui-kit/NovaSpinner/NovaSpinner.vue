<template>
  <svg
    class="NovaSpinner"
    viewBox="0 0 50 50"
    :style="{
      width: `${size ?? 20}px`,
      height: `${size ?? 20}px`,
    }"
    data-testid="nova-spinner"
  >
    <circle class="NovaSpinner__path" cx="25" cy="25" r="20" fill="none" stroke-width="8"></circle>
  </svg>
</template>
<script lang="ts" setup>
export interface NovaSpinnerProps {
  size?: number | string;
}

defineProps<NovaSpinnerProps>();
</script>

<style lang="scss" scoped>
.NovaSpinner {
  animation: rotate 2s linear infinite;
  z-index: 2;

  &__path {
    stroke: currentcolor;
    stroke-linecap: round;
    animation: dash 1.5s ease-in-out infinite;
  }
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }

  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }

  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}
</style>
