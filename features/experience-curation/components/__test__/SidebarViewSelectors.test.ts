import { config, shallowMount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SidebarViewSelectors from "../SidebarViewSelectors.vue";
import { VIEW_TYPE_COMMERCIAL, VIEW_TYPE_ALL } from "../../lib/viewTypeUtils";

config.global.mocks = {
  $t: (text: string) => text,
};

describe("SidebarViewSelectors", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders view label", () => {
    const wrapper = shallowMount(SidebarViewSelectors);
    const viewLabel = wrapper.get('[data-testid="document-sidebar-view-label"]');
    expect(viewLabel.text()).toBe("common.view");
  });

  it("renders view select component", () => {
    const wrapper = shallowMount(SidebarViewSelectors);
    const viewSelect = wrapper.get('[data-testid="document-sidebar-view-select"]');
    expect(viewSelect).toBeTruthy();
  });

  it("renders raw fields label", () => {
    const wrapper = shallowMount(SidebarViewSelectors);
    const rawFieldsLabel = wrapper.get('[data-testid="document-sidebar-raw-fields-label"]');
    expect(rawFieldsLabel.text()).toBe("action.bar.raw.content.title");
  });

  it("renders raw fields toggle component", () => {
    const wrapper = shallowMount(SidebarViewSelectors);
    const rawFieldsToggle = wrapper.get('[data-testid="document-sidebar-raw-fields-toggle"]');
    expect(rawFieldsToggle).toBeTruthy();
  });

  it('updates the selectedView ref when the view select component emits "update:selected"', async () => {
    const wrapper = shallowMount(SidebarViewSelectors);
    const viewSelect = wrapper.findComponent('[data-testid="document-sidebar-view-select"]');
    await viewSelect.setValue(VIEW_TYPE_COMMERCIAL);

    expect(wrapper.emitted("update:selectedView")).toEqual([[VIEW_TYPE_COMMERCIAL]]);

    await viewSelect.setValue(VIEW_TYPE_ALL);

    expect(wrapper.emitted("update:selectedView")).toEqual([[VIEW_TYPE_COMMERCIAL], [VIEW_TYPE_ALL]]);
  });

  it('updates the showRawFields ref when the raw fields toggle component emits "update:modelValue"', async () => {
    const wrapper = shallowMount(SidebarViewSelectors);
    const rawFieldsToggle = wrapper.findComponent('[data-testid="document-sidebar-raw-fields-toggle"]');
    await rawFieldsToggle.setValue(false);

    expect(wrapper.emitted("update:showRawFields")).toEqual([[false]]);
  });
});
