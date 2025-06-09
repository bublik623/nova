<template>
  <div class="NovaIconStatus" :theme="theme || null" data-testid="nova-status-icon">
    <NovaIcon :name="getIcon" :size="getSize" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import NovaIcon, { Icon } from "@/ui-kit/NovaIcon/NovaIcon.vue";

export interface NovaIconStatusProps {
  theme: "success" | "info" | "error" | "warning";
  size?: number;
}

const props = withDefaults(defineProps<NovaIconStatusProps>(), {
  theme: "info",
  size: 20,
});

const getSize = computed(() => (props.size > 20 ? props.size : 20));
const getPxSize = getSize.value + "px";

const getIcon = computed<Icon>(() => {
  switch (props.theme) {
    case "success":
      return "check";
    case "error":
      return "close";
    case "warning":
      return "alert";

    default:
      return "circle-info";
  }
});
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.NovaIconStatus {
  --background-color: var(--color-primary-100);
  --color: white;

  width: v-bind(getPxSize);
  height: v-bind(getPxSize);
  line-height: 0;
  padding: rem(3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--background-color);
  color: var(--color);

  &[theme="success"] {
    --background-color: var(--color-success-100);
  }

  &[theme="warning"] {
    --background-color: var(--color-warning-100);
  }

  &[theme="error"] {
    --background-color: var(--color-error-100);
  }
}
</style>
