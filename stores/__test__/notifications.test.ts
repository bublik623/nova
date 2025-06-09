import { createPinia, _ActionsTree, _GettersTree } from "pinia";
import { describe, test, expect, vi } from "vitest";
import { Notification, useNotifications } from "../notifications";
import { mockUseRuntimeConfig } from "@/__mocks__/useRuntimeConfig";

describe("App notifications Store", () => {
  const mockNotifications: Notification[] = [
    {
      id: 1111,
      theme: "success",
      timeout: 4500,
      title: "Hello world!",
      type: "toast",
      message: "Lorem ipsum dolor sit amet...",
    },
    {
      id: 2222,
      theme: "success",
      timeout: 4500,
      title: "My second notification!",
      type: "toast",
      message: "Lorem ipsum dolor sit amet...",
    },
  ];

  vi.stubGlobal("useRuntimeConfig", mockUseRuntimeConfig);

  describe("getters", () => {
    test("gets the correct notifications types", () => {
      const pinia = createPinia();
      const store = useNotifications(pinia);

      store.addNotification(mockNotifications[0]);
      store.addNotification(mockNotifications[1]);

      expect(store.getToastNotifications.length).toBe(2);
      expect(store.getToastNotifications[0].title).toBe("Hello world!");
      expect(store.getToastNotifications[0].type).toBe("toast");
    });
  });
  describe("actions", () => {
    test("it correctly adds and remove a notification", () => {
      const pinia = createPinia();
      const store = useNotifications(pinia);

      store.addNotification(mockNotifications[0]);
      store.addNotification(mockNotifications[1]);
      store.addNotification({
        id: 3333,
        title: "My notification!",
        message: "asd",
      });

      expect(store.getToastNotifications.length).toBe(3);
      expect(store.getToastNotifications[2].id).toBe(3333);
      expect(store.getToastNotifications[2].title).toBe("My notification!");

      // removing notification
      store.deleteNotification(1111);

      expect(store.getToastNotifications.length).toBe(2);
      expect(store.getToastNotifications[0].title).toBe("My second notification!");
    });
  });
});
