import { config, mount } from "@vue/test-utils";
import { describe, it, beforeEach, vi, expect, Mock } from "vitest";
import DocumentTabs from "./DocumentTabs.vue";
import { useDocumentTabs } from "@/stores/document-tabs";
import { useRouter } from "vue-router";

config.global.mocks = {
  $t: (text: string) => text,
};

vi.mock("@/stores/document-tabs");
vi.mock("vue-router");

describe("DocumentTabs.vue", () => {
  let mockDocumentTabsStore: any;
  let mockRouter: any;

  const tabs = [
    { id: "tab1", label: "Tab 1", path: "/tab1" },
    { id: "tab2", label: "Tab 2", path: "/tab2" },
  ];

  beforeEach(() => {
    mockDocumentTabsStore = {
      tabs,
      getActiveTab: vi.fn(() => tabs[0]),
      closeTabAndGetNextRoutePath: vi.fn(() => "/tab2"),
    };

    (useDocumentTabs as unknown as Mock).mockReturnValue(mockDocumentTabsStore);

    mockRouter = { push: vi.fn() };
    (useRouter as Mock).mockReturnValue(mockRouter);
  });

  it("it renders the tab navigation component correctly", () => {
    const wrapper = mount(DocumentTabs);

    const navigation = wrapper.find("[data-testid='document-tab-navigation']");
    const tabs = wrapper.findAll("[data-testid='document-tab-navigation-link']");

    expect(navigation.exists()).toBe(true);
    expect(tabs).toHaveLength(mockDocumentTabsStore.tabs.length);
    expect(tabs[0].text()).toBe("Tab 1");
    expect(tabs[1].text()).toBe("Tab 2");
  });

  it("calls closeTab and navigates to the next route when a tab is closed", async () => {
    const wrapper = mount(DocumentTabs);

    await wrapper.find("[data-testid='document-tab-navigation-close']").trigger("click");

    expect(mockDocumentTabsStore.closeTabAndGetNextRoutePath).toHaveBeenCalledWith(mockDocumentTabsStore.tabs[0]);
    expect(mockRouter.push).toHaveBeenCalledWith(tabs[1].path);
  });

  it("sets the active tab correctly", () => {
    const wrapper = mount(DocumentTabs);

    const activeTab = wrapper.find("[selected='true']");
    expect(activeTab.text()).toBe("Tab 1");
  });
});
