import { mount } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";
import AdvancedSearchPagination from "../AdvancedSearchPagination.vue";

const props = { itemsCount: 250, itemsPerPage: 50, modelValue: 3 };

vi.stubGlobal("useNuxtApp", () => ({
  $t: (s: string) => s,
}));

describe("AdvancedSearchPagination", () => {
  test("it should mount correctly", () => {
    const wrapper = mount(AdvancedSearchPagination, { props });

    expect(wrapper.exists()).toBeTruthy();
  });

  test.each([
    {
      props: { modelValue: 2, itemsCount: 500, itemsPerPage: 20 },
      expectedString: "common.showing 21 common.to 40 common.of 500 common.entries",
    },
    {
      props: { modelValue: 2, itemsCount: 18, itemsPerPage: 10 },
      expectedString: "common.showing 11 common.to 18 common.of 18 common.entries",
    },
    {
      props: { modelValue: 2, itemsCount: 20, itemsPerPage: 10 },
      expectedString: "common.showing 11 common.to 20 common.of 20 common.entries",
    },
    {
      props: { itemsCount: 250, itemsPerPage: 50, modelValue: 3 },
      expectedString: "common.showing 101 common.to 150 common.of 250 common.entries",
    },
  ])("the text should reflect the data", ({ props, expectedString }) => {
    const wrapper = mount(AdvancedSearchPagination, { props });
    expect(wrapper.text().includes(expectedString)).toBeTruthy();
  });
});
