<template>
  <div
    data-testid="nova-alert"
    class="NovaAlert"
    :status="status || null"
    :variant="variant || null"
    :size="size || null"
  >
    <NovaIcon class="AlertIcon" :name="icon" :size="size === 'lg' ? 24 : 20" />
    <p class="NovaAlert__content"><slot /></p>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import NovaIcon, { Icon } from "@/ui-kit/NovaIcon/NovaIcon.vue";

export interface NovaAlertProps {
  status: "success" | "warning" | "error" | "info";
  size?: "sm" | "md" | "lg";
  variant?: "left-accent" | "solid";
}

const props = withDefaults(defineProps<NovaAlertProps>(), {
  size: "sm",
  variant: "solid",
});

const icon = computed(() => {
  const statusIcon: Record<NovaAlertProps["status"], Icon> = {
    success: "success-solid",
    warning: "warning-solid",
    error: "error-solid",
    info: "info-solid",
  };
  return statusIcon[props.status];
});
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.NovaAlert {
  --background-color: ;
  --border-color: ;
  --left-accent-color: ;

  background-color: var(--background-color);
  border: var(--border-default);
  border-radius: var(--border-radius-default);
  border-color: var(--border-color);
  padding: rem(3) rem(8);
  display: flex;
  align-items: center;
  @include font-regular(12);

  &__content {
    margin-left: rem(8);
  }

  &[status="success"] {
    --background-color: var(--color-success-10);
    --border-color: var(--color-success-100);
    --left-accent-color: var(--color-success-110);
  }

  &[status="info"] {
    --background-color: var(--color-secondary-10);
    --border-color: var(--color-secondary-110);
    --left-accent-color: var(--color-secondary-110);
  }

  &[status="warning"] {
    --background-color: var(--color-warning-10);
    --border-color: var(--color-warning-100);
    --left-accent-color: var(--color-warning-110);
  }

  &[status="error"] {
    --background-color: #fdeded;
    --border-color: var(--color-error-100);
    --left-accent-color: var(--color-error-110);
  }

  &[size="md"],
  &[size="lg"] {
    padding: rem(12);
    font-size: rem(14);
  }

  &[variant="left-accent"] {
    position: relative;
    padding-left: rem(20);

    &::before {
      content: "";
      left: 0;
      width: 5px;
      height: 63%;
      background: var(--left-accent-color);
      position: absolute;
      border-radius: 0 34px 34px 0;
    }

    .NovaAlert__content {
      margin-left: rem(14);
    }
  }
}
</style>
