import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";
import NovaPercentage, { Props } from "./NovaPercentage.vue";

const props: Props = {
  percentage: 15,
  color: "red",
};

describe("NovaPercentage", () => {
  test("it should render correctly", () => {
    const wrapper = mount(NovaPercentage, { props });
    const progressBar = wrapper.find(".Percentage__progress-bar");

    // check the props
    expect(progressBar.attributes("style")).includes("width: 15%; background: red");
  });

  test("default slot", () => {
    const wrapper = mount(NovaPercentage, {
      props,
      slots: { default: "default slot" },
    });

    expect(wrapper.text()).includes("default slot");
  });

  test("change props", () => {
    const wrapper = mount(NovaPercentage, {
      props: {
        percentage: 85,
        color: "green",
      },
    });

    const progressBar = wrapper.find(".Percentage__progress-bar");

    // check the props
    expect(progressBar.attributes("style")).includes("width: 85%; background: green");
  });
});
