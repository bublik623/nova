import { config, mount } from "@vue/test-utils";
import { describe, test, expect } from "vitest";
import ProductHistory from "@/features/experience-shared/components/ProductHistory.vue";

config.global.mocks = {
  $t: (t: string) => t,
};

describe("ProductHistory", () => {
  test("it should mount correctly", () => {
    const wrapper = mount(ProductHistory);

    expect(wrapper.findAll(".ProductHistory").length).toBe(1);
    expect(wrapper.findAllComponents({ name: "NovaButtonToggle" }).length).toBe(1);
  });

  test("it should show activity log panel by default", () => {
    const wrapper = mount(ProductHistory, {
      slots: {
        activity_log: '<div class="activity-log">activity log content</div>',
        version_history: '<div class="version-history">version history content</div>',
      },
    });

    expect(wrapper.findAll(".activity-log").length).toBe(1);
    expect(wrapper.findAll(".version-history").length).toBe(0);
  });

  test("it should switch active panel when the toggle is clicked", async () => {
    const wrapper = mount(ProductHistory, {
      slots: {
        activity_log: '<div class="activity-log">activity log content</div>',
        version_history: '<div class="version-history">version history content</div>',
      },
    });

    expect(wrapper.findAll(".activity-log").length).toBe(1);
    expect(wrapper.findAll(".version-history").length).toBe(0);

    await wrapper.findComponent({ name: "NovaButtonToggle" }).trigger("click");

    expect(wrapper.findAll(".activity-log").length).toBe(0);
    expect(wrapper.findAll(".version-history").length).toBe(1);

    await wrapper.findComponent({ name: "NovaButtonToggle" }).trigger("click");

    expect(wrapper.findAll(".activity-log").length).toBe(1);
    expect(wrapper.findAll(".version-history").length).toBe(0);
  });
});
