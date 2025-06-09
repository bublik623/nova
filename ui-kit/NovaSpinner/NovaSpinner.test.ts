import { mount } from "@vue/test-utils";
import { test, expect, describe } from "vitest";
import NovaSpinner from "./NovaSpinner.vue";

describe("NovaSpinner", () => {
  test("it should mount and render correctly", () => {
    expect(NovaSpinner).toBeTruthy();

    const wrapper = mount(NovaSpinner, {
      props: {
        size: 50,
      },
    });

    const element = wrapper.find("svg[data-testid='nova-spinner']");

    expect(element.attributes().style).toContain("50px");
  });
});
