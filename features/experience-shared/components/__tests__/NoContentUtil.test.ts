import { shallowMount } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";

import NoContentUtil from "../NoContentUtil.vue";

vi.stubGlobal("useNuxtApp", () => ({
  $t: (s: string) => s,
}));

describe("NoContentUtil", () => {
  test("should return correct message when no content is available", () => {
    const wrapper = shallowMount(NoContentUtil);
    expect(wrapper.text()).toBe("common.no-content");
  });

  test("It should return the placeholder if passed", () => {
    const wrapper = shallowMount(NoContentUtil, {
      props: {
        placeholder: "No content available",
      },
    });
    expect(wrapper.text()).toBe("No content available");
  });
});
