import { defineStore } from "pinia";
import { Icon } from "@/ui-kit/NovaIcon/NovaIcon.vue";
type NotificationTheme = "success" | "warning" | "error" | "info";

export interface Notification {
  id: number;
  type: "toast";
  theme: NotificationTheme;
  timeout: number;
  title: string;
  icon?: Icon;
  message: string;
  visible?: boolean;
}

export const useNotifications = defineStore("useNotifications", () => {
  const notifications = ref<Notification[]>([]);

  function addNotification(notification: Partial<Notification> & Pick<Notification, "message">) {
    const config = useRuntimeConfig();

    const id = Math.floor(Math.random() * 1000);
    const timeout = +config.public.NOTIFICATION_TIMEOUT;
    const theme = notification.theme || "info";
    const icon: Icon = "bell";

    notifications.value.push({
      id,
      type: "toast",
      theme,
      timeout,
      icon,
      title: `notifications.generic.${theme}.title`,
      ...notification,
    });
  }
  function deleteNotification(id: Notification["id"]) {
    notifications.value = notifications.value.filter((notification) => notification.id !== id);
  }

  function toggleNotification(id: Notification["id"], value: boolean) {
    const item = notifications.value.find((notification) => notification.id === id);

    if (item) {
      item.visible = value;
    }
  }

  const getToastNotifications = computed<Notification[]>(() => {
    return notifications.value.filter(({ type }) => type === "toast");
  });

  return { addNotification, deleteNotification, toggleNotification, getToastNotifications, notifications };
});
