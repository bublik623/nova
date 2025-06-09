import { config, mount } from "@vue/test-utils";
import { test, expect } from "vitest";
import EmptyList from "../EmptyList.vue";

config.global.mocks = {
  $t: (text: string) => text,
};

test("EmptyList renders correctly", () => {
  const wrapper = mount(EmptyList);

  expect(wrapper).toBeTruthy();
  expect(wrapper.text()).toContain("experience.highlights.no_options_added");
});
