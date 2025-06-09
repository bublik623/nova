import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";
import NovaIconFlag from "./NovaIconFlag.vue";

describe("NovaIconFlag", () => {
  test("it should be rendered correctly", () => {
    const wrapper = mount(NovaIconFlag, {
      props: {
        countryCode: "en",
      },
    });

    expect(wrapper.exists()).toBeTruthy();
    expect(wrapper.html()).not.include('shape="circle"');
  });
  test("it render as a circle", () => {
    const wrapper = mount(NovaIconFlag, {
      props: {
        countryCode: "en",
        shape: "circle",
      },
    });

    expect(wrapper.html()).include('shape="circle"');
  });
});
