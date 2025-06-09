<template>
  <div class="AppNotifications">
    <div v-for="(toast, index) in notificationStore.getToastNotifications" :key="toast.id" class="ToastNotifications">
      <NovaToast
        class="ToastNotifications__notification"
        :class="{
          'ToastNotifications__notification--visible': toast.visible,
        }"
        v-bind="toast"
        :style="{
          top: `${index * 85}px`,
        }"
        @notification:visible="(id, value) => notificationStore.toggleNotification(id, value)"
        @notification:delete="(id) => notificationStore.deleteNotification(id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNotifications } from "@/stores/notifications";
import NovaToast from "@/ui-kit/NovaToast/NovaToast.vue";

const notificationStore = useNotifications();
</script>

<style scoped lang="scss">
.AppNotifications {
  position: fixed;
  top: 15px;
  width: 0;
  left: 0;
  height: 100%;
  z-index: var(--z-index-messages-toast);
}

.ToastNotifications {
  &__notification {
    position: fixed;
    right: 10px;
    transform: translateX(104%);

    &--visible {
      transform: translateX(0);
    }
  }
}
</style>
