import { mount } from "@vue/test-utils";
import { test, expect, describe } from "vitest";
import SimpleTable from "./SimpleTable.vue";

describe("SimpleTable", () => {
  test("it should mount and render correctly", () => {
    const wrapper = mount(SimpleTable, {
      slots: {
        header: "Hello",
        body: "World!",
      },
      props: { caption: "random-caption" },
    });

    expect(wrapper).toBeTruthy();
    expect(wrapper.text()).toContain("Hello");
    expect(wrapper.text()).toContain("World!");
  });
});
