import { config, mount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import NovaSortButton from "@/ui-kit/NovaSortButton/NovaSortButton.vue";
import { nextTick } from "vue";
import TableSortButton from "../TableSortButton.vue";

vi.stubGlobal("useNuxtApp", () => ({
  $t: (text: string) => text,
}));

config.global.mocks = {
  $t: (text: string) => text,
};

describe("TableSortButton.vue", () => {
  it("renders NovaSortButton with correct sorting prop", () => {
    const wrapper = mount(TableSortButton, {
      props: {
        activeSortDirection: "asc",
        activeSortKey: "title",
        ownSortKey: "title",
      },
    });

    const sortButton = wrapper.findComponent(NovaSortButton);
    expect(sortButton.props("sorting")).toBe("asc");
  });

  it("renders NovaSortButton with undefined sorting prop when ownSortKey does not match the activeSortKey", () => {
    const wrapper = mount(TableSortButton, {
      global: {
        components: {
          NovaSortButton,
        },
      },
      props: {
        activeSortDirection: "asc",
        activeSortKey: "id",
        ownSortKey: "title",
      },
    });

    const sortButton = wrapper.findComponent(NovaSortButton);
    expect(sortButton.props("sorting")).toBeUndefined();
  });

  it("emits update:activeSortKey event correctly", async () => {
    const wrapper = mount(TableSortButton, {
      global: {
        components: {
          NovaSortButton,
        },
      },
      props: {
        activeSortDirection: "asc",
        activeSortKey: "id",
        ownSortKey: "title",
      },
    });

    const sortButton = wrapper.findComponent(NovaSortButton);
    await sortButton.trigger("click");
    await nextTick();

    expect(wrapper.emitted("update:activeSortKey")).toBeTruthy();
    expect(wrapper.emitted("update:activeSortKey")?.[0]).toEqual(["title"]);
  });
});
