import { mount, config } from "@vue/test-utils";
import { test, expect, describe, vi, beforeEach, afterEach } from "vitest";
import NovaToast, { NovaToastProps, NovaToastEvents } from "./NovaToast.vue";

config.global.mocks = {
  $t: (text: string) => text,
};

const props: NovaToastProps = {
  id: 12345,
  type: "toast",
  theme: "success",
  timeout: 4500,
  title: "Lorem ipsum",
  message: "test message",
};

const selectors = {
  toast: "[data-testid='nova-toast']",
  close: "[data-testid='nova-toast-close']",
  statusIcon: "[data-testid='nova-status-icon']",
};

describe("NovaToast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("it should mount and render correctly", () => {
    expect(NovaToast).toBeTruthy();
    const wrapper = mount(NovaToast, { props });
    const element = wrapper.find(selectors.toast);
    const statusIcon = wrapper.find(selectors.statusIcon);

    expect(element.html()).toContain("Lorem ipsum");
    expect(statusIcon.attributes().theme).toBe("success");
  });

  test("the visibility timeout order should be correct", async () => {
    const wrapper = mount(NovaToast, { props });

    expect(wrapper.emitted<NovaToastEvents>()["notification:visible"]).toBeFalsy();

    // The documentation says this method is synchronous,
    // but you actually have to await it.
    await vi.advanceTimersByTime(5000);

    expect(wrapper.emitted<NovaToastEvents>()["notification:visible"][0].toString()).toBe("12345,true");

    expect(wrapper.emitted<NovaToastEvents>()["notification:visible"][1].toString()).toBe("12345,false");

    expect(wrapper.emitted<NovaToastEvents>()["notification:delete"][0].toString()).toBe("12345");
  });

  test("it should emit a notification close event with the notification id", async () => {
    const wrapper = mount(NovaToast, { props });
    await vi.advanceTimersByTime(15000);

    expect(wrapper.emitted()["notification:delete"].toString()).toContain("12345");
  });

  test("it should emit the correct events on clicking close", async () => {
    const wrapper = mount(NovaToast, { props });
    const close = wrapper.find(selectors.close);

    await vi.advanceTimersByTime(200);

    expect(wrapper.emitted<NovaToastEvents>()["notification:visible"][0].toString()).toBe("12345,true");

    await vi.advanceTimersByTime(200);

    await close.trigger("click");

    expect(wrapper.emitted<NovaToastEvents>()["notification:visible"][1].toString()).toBe("12345,false");

    await vi.advanceTimersByTime(500);

    expect(wrapper.emitted()["notification:delete"].toString()).toContain("12345");
  });
});
