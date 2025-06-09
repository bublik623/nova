import { mount, shallowMount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import NovaSortButton from "./NovaSortButton.vue";

describe("SortButton.vue", () => {
  it('emits "update:sort" event when clicked', async () => {
    const wrapper = mount(NovaSortButton, {});

    await wrapper.trigger("click");
    expect(wrapper.emitted("update:sort")).toBeTruthy();
  });

  it('applies correct styles for sorting prop "asc"', () => {
    const wrapper = shallowMount(NovaSortButton, {
      props: {
        sorting: "asc",
      },
    });

    const ascArrow = wrapper.find(".SortButton__arrow--asc");
    const descArrow = wrapper.find(".SortButton__arrow--desc");

    expect(ascArrow.attributes("style")).toContain("opacity: 1");
    expect(descArrow.attributes("style")).toContain("opacity: 0.3");
  });

  it('applies correct styles for sorting prop "desc"', () => {
    const wrapper = shallowMount(NovaSortButton, {
      props: {
        sorting: "desc",
      },
    });

    const ascArrow = wrapper.find(".SortButton__arrow--asc");
    const descArrow = wrapper.find(".SortButton__arrow--desc");

    expect(ascArrow.attributes("style")).toContain("opacity: 0.3");
    expect(descArrow.attributes("style")).toContain("opacity: 1");
  });
});
