import { mount } from "@vue/test-utils";
import { test, expect } from "vitest";
import HighlightsWrapper from "../HighlightsWrapper.vue";

test("HighlightsWrapper renders correctly", () => {
  const wrapper = mount(HighlightsWrapper, {
    slots: {
      default: "Hello world!",
    },
  });

  expect(wrapper).toBeTruthy();
  expect(wrapper.text()).toContain("Hello world!");
});
