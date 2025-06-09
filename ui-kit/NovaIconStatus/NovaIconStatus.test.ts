import { mount, VueWrapper } from "@vue/test-utils";
import { test, expect, describe, vi } from "vitest";
import { ComponentPublicInstance } from "vue";
import NovaIconStatus from "./NovaIconStatus.vue";

const selectors = {
  element: "[data-testid='nova-status-icon']",
  icon: "[data-testid='icon-check']",
};

describe("NovaIconStatus", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wrapper: VueWrapper<ComponentPublicInstance<any, any>> = mount(NovaIconStatus, {
    props: {
      size: 50,
      theme: "success",
    },
  });

  test("it should mount and render correctly", async () => {
    await vi.dynamicImportSettled();
    const element = wrapper.find(selectors.element);

    expect(NovaIconStatus).toBeTruthy();

    expect(element.attributes().theme).toContain("success");
  });

  test("it renders the right icon", async () => {
    await vi.dynamicImportSettled();
    const element = wrapper.find(selectors.element);
    const icon = wrapper.find(selectors.icon);

    expect(element.html()).toContain("icon-check");
    expect(icon.attributes().style).toContain("50px");
    expect(wrapper.vm.getIcon).toBe("check");
  });
});
