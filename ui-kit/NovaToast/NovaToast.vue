<template>
  <div class="NovaToast" :theme="theme || null" :visible="visible || null" data-testid="nova-toast">
    <div class="NovaToast__body">
      <div class="NovaToast__FancyBorder"></div>
      <div class="NovaToast__icon">
        <NovaIconStatus :theme="theme" :size="23" />
      </div>
      <div>
        <h3 class="NovaToast__title">{{ $t(title) }}</h3>
        <p v-if="message" class="NovaToast__message">
          {{ $t(message) }}
        </p>
      </div>
      <div class="NovaToast__close" data-testid="nova-toast-close" @click="handleClose(id)">
        <NovaIcon name="close" :size="12" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import NovaIcon, { Icon } from "../NovaIcon/NovaIcon.vue";
import NovaIconStatus from "../NovaIconStatus/NovaIconStatus.vue";
import { Notification } from "@/stores/notifications";

// We have to redeclare Notification here,
// as vue 3 will error if you extend an interface.
export interface NovaToastProps {
  id: number;
  type: "toast";
  theme: "success" | "warning" | "error" | "info";
  timeout: number;
  title: string;
  icon?: Icon;
  message: string;
  visible?: boolean;
}

export interface NovaToastEvents {
  (e: "notification:delete", id: Notification["id"]): void;
  (e: "notification:visible", id: Notification["id"], value: boolean): void;
}

const DELETE_OFFSET = 200;

const props = defineProps<NovaToastProps>();
const emits = defineEmits<NovaToastEvents>();

setTimeout(() => {
  emits("notification:visible", props.id, true);
}, 200);

setTimeout(() => {
  emits("notification:visible", props.id, false);
}, props.timeout);

setTimeout(() => {
  emits("notification:delete", props.id);
}, props.timeout + DELETE_OFFSET);

function handleClose(id: Notification["id"]) {
  emits("notification:visible", id, false);
  setTimeout(() => {
    emits("notification:delete", id);
  }, DELETE_OFFSET);
}
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.NovaToast {
  --background-color: var(--color-primary-10);
  --border-color: var(--color-primary-100);

  width: 320px;
  background-color: white;
  margin-top: rem(16);
  transition: all ease-in-out 120ms;
  position: relative;
  border-radius: var(--border-radius-default);

  &__body {
    border: 0.5px solid var(--border-color);
    border-radius: var(--border-radius-default);
    height: 100%;
    display: flex;
    align-items: center;
    overflow: hidden;
    background-color: var(--background-color);
    padding: rem(12.5px);

    &::after {
      content: "";
      position: absolute;
      width: 6px;
      height: 44px;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      border-radius: 0 8px 8px 0;
      background-color: var(--border-color);
    }
  }

  &__title {
    @include font-semibold(14);

    padding-bottom: 2px;
  }

  &__message {
    color: var(--color-text-90);
    line-height: rem(18px);
    @include font-regular(12);
  }

  &__icon {
    margin: 0 rem(12);
  }

  &__close {
    width: 40px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: auto;
    cursor: pointer;
  }

  &[theme="success"] {
    --background-color: var(--color-success-10);
    --border-color: var(--color-success-100);
  }

  &[theme="warning"] {
    --background-color: var(--color-warning-10);
    --border-color: var(--color-warning-100);
  }

  &[theme="error"] {
    --background-color: #fdeded;
    --border-color: var(--color-error-100);
  }
}
</style>
