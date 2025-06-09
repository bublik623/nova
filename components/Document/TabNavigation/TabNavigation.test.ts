import { mount, config, RouterLinkStub } from "@vue/test-utils";
import { test, expect, describe, vi, beforeEach } from "vitest";
import TabNavigation, { DocumentTabProps } from "./TabNavigation.vue";
import { DocumentTab } from "@/stores/document-tabs";

const tabs: DocumentTab[] = [
  {
    documentId: { experienceId: "test-path-1" },
    label: "Test Value",
    path: "/test-path-1",
  },
  {
    documentId: { experienceId: "test-path-2" },
    label: "Test Value",
    path: "/test-path-2",
  },
];

config.global.stubs = {
  NuxtLink: RouterLinkStub,
};

config.global.mocks = {
  $t: (text: string) => text,
};

const selectors = {
  tabNavigation: "[data-testid='document-tab-navigation']",
  tabButtons: "[data-testid='document-tab-navigation-link']",
  nuxtLinkButtons: "[data-testid='document-tab-navigation-nuxt-link']",
  closeButtons: "[data-testid='document-tab-navigation-close']",
};

const props: DocumentTabProps = { tabs };

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("Tab Navigation", () => {
  test("it should mount and render correctly", () => {
    const wrapper = mount(TabNavigation, {
      props,
    });

    const tabs = wrapper.find(selectors.tabNavigation);
    const buttons = wrapper.findAll(selectors.tabButtons);

    expect(wrapper).toBeTruthy();
    expect(tabs.exists()).toBe(true);
    expect(buttons.length).toBe(2);
    expect(buttons[0].attributes().selected).toBeTruthy();

    expect(wrapper.html()).toContain("Test Value");
    expect(wrapper.findComponent(RouterLinkStub).props().to).toContain("/test-path-1");
  });

  test("it should emit a tab-close event when close button is clicked", async () => {
    const wrapper = mount(TabNavigation, {
      props,
    });

    const closeButtons = wrapper.findAll(selectors.closeButtons);

    await closeButtons[0].trigger("click");

    expect(wrapper.emitted().tabClose.length).toBe(1);
    expect(wrapper.emitted().tabClose[0]).toStrictEqual([tabs[0]]);
  });
});
