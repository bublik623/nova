import { mount, config } from "@vue/test-utils";
import { test, expect, describe } from "vitest";
import NovaButton from "./NovaButton.vue";

const slots = {
  default: "Hello World!",
};

config.global.stubs = {
  NuxtLink: {
    template: "<a></a>",
  },
};
describe("NovaButton", () => {
  test("it should mount and render correctly", () => {
    const wrapper = mount(NovaButton, {
      props: {
        variant: "contained",
        size: "lg",
      },
      slots,
    });

    const button = wrapper.find("button.Button");

    expect(wrapper).toBeTruthy();
    expect(button.exists()).toBe(true);
    expect(button.text()).toContain(slots.default);
    expect(button.attributes().variant).toBe("contained");
    expect(button.attributes().size).toBe("lg");
  });

  test("it should be disabled", () => {
    const wrapper = mount(NovaButton, {
      props: {
        disabled: true,
      },
      slots,
    });

    const button = wrapper.find("button.Button");
    expect(button.attributes().disabled).toBe("");
  });

  test('when passed a "to" prop, it should render a nuxt-link', () => {
    const wrapper = mount(NovaButton, {
      props: {
        to: "/test",
      },
      slots,
    });

    expect(wrapper.find("a").exists()).toBe(true);
    expect(wrapper.classes()).toContain("Button--isNuxtLink");
    expect(wrapper.attributes().to).toBe("/test");
  });
});
