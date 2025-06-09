import { mount } from "@vue/test-utils";
import { test, expect, describe } from "vitest";
import NovaCollapse from "./NovaCollapse.vue";

const selectors = {
  title: "[data-testid='nova-collapse-title']",
  header: "[data-testid='nova-collapse-header']",
  content: "[data-testid='nova-collapse-content']",
  actions: "[data-testid='nova-collapse-actions']",
};

describe("Nova Collapse", () => {
  test("it should mount and work correctly", async () => {
    const wrapper = mount(NovaCollapse, {
      props: {
        title: "My Title!",
      },
      slots: {
        default: "Hello world!",
        actions: "My actions!",
      },
    });
    const events = () => wrapper.emitted<Record<string, boolean[][]>>();

    expect(wrapper.find(selectors.title).text()).toBe("My Title!");
    expect(wrapper.find(selectors.actions).text()).toBe("My actions!");
    expect(wrapper.find(selectors.content).isVisible()).toBe(false);

    await wrapper.find(selectors.header).trigger("click");

    expect(wrapper.find(selectors.content).isVisible()).toBe(true);
    expect(wrapper.find(selectors.content).text()).toBe("Hello world!");

    expect(events()["update:modelValue"][0][0]).toBe(true);
  });

  test("if i pass the title slot it should show it", async () => {
    const wrapper = mount(NovaCollapse, {
      slots: {
        default: "Hello world!",
        actions: "My actions!",
        title: "My title!",
      },
    });

    expect(wrapper.find(selectors.header).text()).include("My title!");
    expect(wrapper.find(selectors.actions).text()).toBe("My actions!");
    expect(wrapper.find(selectors.content).text()).toBe("Hello world!");
  });

  test("it opens and closes with an external toggle", async () => {
    const wrapper = mount(NovaCollapse, {
      props: {
        title: "My Title!",
        modelValue: true,
      },
      slots: {
        default: "Hello world!",
        actions: "My actions!",
      },
    });

    const events = () => wrapper.emitted<Record<string, boolean[][]>>();

    expect(wrapper.find(selectors.content).isVisible()).toBe(true);
    expect(events()["update:modelValue"]?.[0]?.[0]).toBeFalsy();

    await wrapper.setProps({
      modelValue: false,
    });

    expect(wrapper.find(selectors.content).isVisible()).toBe(false);
  });
});
