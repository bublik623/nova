import { ref } from "vue";
import { config, shallowMount } from "@vue/test-utils";
import { test, expect, describe, vi, beforeEach, afterEach } from "vitest";
import ActionBar from "../ActionBar.vue";
import * as useMediaQueryComposable from "@/composables/useMediaQuery";

config.global.mocks = {
  $t: (text: string) => text,
};

const selectors = {
  sidebar: "[data-testid='document-action-bar']",
  closeBtn: "[data-testid='document-action-bar-close']",
  actionsBtn: "[data-testid='document-action-bar-actions-btn']",
  historyBtn: "[data-testid='document-action-bar-history-btn']",
  historySlot: "[data-testid='document-action-bar-history']",
  actions: "[data-testid='document-action-bar-actions']",
  content: "[data-testid='document-action-bar-content']",
};

const slots = {
  actions: "actionbar-cta",
  actions_footer: "<div id='footer'></div>",
  history: "<div id='history'></div>",
};

describe("DocumentActionBar", () => {
  beforeEach(() => {
    vi.spyOn(useMediaQueryComposable, "useMediaQuery").mockReturnValueOnce({
      isBigDesktop: ref(false),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("it should mount and render correctly", () => {
    const wrapper = shallowMount(ActionBar as never, {
      slots,
    });

    expect(wrapper).toBeTruthy();
    expect(wrapper.find(selectors.sidebar).exists()).toBe(true);
    expect(wrapper.find("#footer").exists()).toBe(true);
  });

  describe("when close button is clicked", () => {
    test("it should toggle the menu", async () => {
      const wrapper = shallowMount(ActionBar as never, {
        slots,
      });
      await wrapper.find(selectors.closeBtn).trigger("click");
      expect(wrapper.find(selectors.content).isVisible()).toBeFalsy();

      await wrapper.find(selectors.actionsBtn).trigger("click");
      expect(wrapper.find(selectors.content).isVisible()).toBeTruthy();
    });
  });

  describe("when the user click on the history button", () => {
    test("it should show the history section", async () => {
      const wrapper = shallowMount(ActionBar as never, {
        slots,
      });

      await wrapper.find(selectors.historyBtn).trigger("click");
      expect(wrapper.find(selectors.actions).isVisible()).toBe(false);
      expect(wrapper.find("#history").isVisible()).toBe(true);

      await wrapper.find(selectors.actionsBtn).trigger("click");
      expect(wrapper.find(selectors.actions).isVisible()).toBe(true);
      expect(wrapper.find("#history").isVisible()).toBe(false);
    });
  });

  describe("when the screen is bigger than 1920px", () => {
    test("the sidebar should be forced open", () => {
      vi.spyOn(useMediaQueryComposable, "useMediaQuery").mockReturnValueOnce({
        isBigDesktop: ref(true),
      });

      const wrapper = shallowMount(ActionBar as never, {
        slots,
      });

      expect(wrapper.find(selectors.closeBtn).exists()).toBe(false);
      expect(wrapper.find(selectors.content).exists()).toBe(true);
    });
  });

  describe("when given an initial action to display", () => {
    test("it should be opened by default", () => {
      const wrapper = shallowMount(ActionBar, {
        slots,
        props: {
          initialSection: "HISTORY",
        },
      });

      expect(wrapper.find(selectors.actionsBtn).isVisible()).toBe(true);
      expect(wrapper.find(selectors.historyBtn).isVisible()).toBe(true);

      expect(wrapper.find(selectors.actions).isVisible()).toBe(false);
      expect(wrapper.find(selectors.historySlot).isVisible()).toBe(true);
    });
  });
});
