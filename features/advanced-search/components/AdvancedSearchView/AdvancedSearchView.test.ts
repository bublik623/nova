import { mount, config, shallowMount } from "@vue/test-utils";
import AdvancedSearchView from "@/features/advanced-search/components/AdvancedSearchView/AdvancedSearchView.vue";
import { describe, expect, test, vi } from "vitest";
import NovaChip from "@/ui-kit/NovaChip/NovaChip.vue";
import AdvancedSearchChips from "../AdvancedSearchChips/AdvancedSearchChips.vue";
import AdvancedSearchQuery from "@/features/advanced-search/components/AdvancedSearchQuery/AdvancedSearchQuery.vue";
import AdvancedSearchFilters from "../AdvancedSearchFilters/AdvancedSearchFilters.vue";
import { ExtractComponentProps } from "@/features/core-shared/composables/useAsyncModal";

vi.mock("#app", () => ({
  useNuxtApp: () => ({
    $t: vi.fn((s: string) => s),
  }),
}));

config.global.mocks = {
  $t: (s: string) => s,
};

const options = [
  { label: "Option 1", value: "option-1" },
  { label: "Option 2", value: "option-2" },
];

const props: ExtractComponentProps<typeof AdvancedSearchView> = {
  isSearching: false,
  isExporting: false,
  query: "",
  canSearch: true,
  canExport: true,
  isSelected: true,
  experiencesCount: 10,
  filtersConfig: {
    mostUsedFiltersConfig: [{ key: "filterKey", type: "date-range", label: "a filter" }],
    moreFiltersConfig: [],
  },
  filtersValues: { filterKey: { type: "multiselect", isDefaultValue: false, value: options } },
  appliedFiltersValues: { filterKey: { type: "multiselect", isDefaultValue: false, value: options } },
  canApplyFilters: true,
  canClearFilters: true,
  showExportButton: true,
  canUserToggleView: true,
};

// Fixed in https://jira.tuigroup.com/browse/OFF-2480
describe("AdvancedSearchView", () => {
  test("renders the component correctly", () => {
    const wrapper = mount(AdvancedSearchView, { props });

    expect(wrapper.exists()).toBe(true);
  });

  test("emits the search event when AdvancedSearchQuery emit search event", async () => {
    const wrapper = mount(AdvancedSearchView, { props });

    wrapper.findComponent(AdvancedSearchQuery).vm.$emit("search");

    expect(wrapper.emitted("search")?.length).toBe(1);
  });

  test("emits the on:clearQuery event when AdvancedSearchQuery emit clearQuery event", async () => {
    const wrapper = mount(AdvancedSearchView, { props });

    wrapper.findComponent(AdvancedSearchQuery).vm.$emit("clearQuery");

    expect(wrapper.emitted("on:clearQuery")?.length).toBe(1);
  });

  test("emits the on:updateQuery event when AdvancedSearchQuery emit updateQuery event", async () => {
    const wrapper = mount(AdvancedSearchView, { props });

    wrapper.findComponent(AdvancedSearchQuery).vm.$emit("on:updateQuery", "new query value");

    expect(wrapper.emitted("on:updateQuery")?.length).toBe(1);
    expect(wrapper.emitted("on:updateQuery")?.[0]?.[0]).toBe("new query value");
  });

  test("emits the on:applyFilters event when AdvancedSearchFilters emits on:apply-filters event", async () => {
    const wrapper = mount(AdvancedSearchView, { props });

    await wrapper.findComponent({ name: "AdvancedSearchFilters" }).vm.$emit("on:apply-filters");

    expect(wrapper.emitted("on:applyFilters")).toBeTruthy();
  });

  test("emits the on:clearAllFilters event when AdvancedSearchFilters emits on:clearAllFilters event", async () => {
    const wrapper = mount(AdvancedSearchView, { props });

    const filtersPanelComponentWrapper = await wrapper.findComponent({ name: "AdvancedSearchFilters" });
    filtersPanelComponentWrapper.vm.emits("on:clearAllFilters");

    expect(wrapper.emitted("on:clearAllFilters")).toHaveLength(1);
  });

  test("emits the export event when export button is clicked", async () => {
    const wrapper = mount(AdvancedSearchView, { props });

    const exportButton = wrapper.findComponent("[data-testid='advanced-search-export-button']");
    exportButton.trigger("click");

    expect(wrapper.emitted("export")).toBeTruthy();
  });

  test("disable the export button when is exporting", async () => {
    const wrapper = mount(AdvancedSearchView, { props: { ...props, isExporting: true } });

    const exportButton = wrapper.findComponent("[data-testid='advanced-search-export-button']");

    expect(exportButton.attributes().disabled).not.toBeNull();
  });

  test("disable the export button when there are no results", async () => {
    const wrapper = mount(AdvancedSearchView, { props: { ...props, experiencesCount: 0 } });

    const exportButton = wrapper.findComponent("[data-testid='advanced-search-export-button']");

    expect(exportButton.attributes().disabled).not.toBeNull();
  });

  test("emits the on:removeAppliedFilter when a filter chip is removed", async () => {
    const wrapper = mount(AdvancedSearchView, { props });

    const chipsComponent = wrapper.findComponent(AdvancedSearchChips);
    const chip = chipsComponent.findComponent(NovaChip);
    await chip.find(".NovaChip__button").trigger("click");

    expect(wrapper.emitted("on:removeAppliedFilter")![0]).toEqual([
      { type: "multiselect", filterKey: "filterKey", option: options[0] },
    ]);
  });

  test("should propagate canApplyFilters prop to AvancedSearchFilters component", async () => {
    const wrapper = shallowMount(AdvancedSearchView, { props: { ...props, canApplyFilters: true } });

    expect(wrapper.findComponent(AdvancedSearchFilters).props("canApply")).toBeTruthy();

    await wrapper.setProps({ canApplyFilters: false });

    expect(wrapper.findComponent(AdvancedSearchFilters).props("canApply")).toBeFalsy();
  });

  test("should propagate canClearFilters prop to AdvancedSearchFilters component", async () => {
    const wrapper = shallowMount(AdvancedSearchView, { props: { ...props, canClearFilters: true } });

    expect(wrapper.findComponent(AdvancedSearchFilters).props("canClear")).toBeTruthy();

    await wrapper.setProps({ canClearFilters: false });

    expect(wrapper.findComponent(AdvancedSearchFilters).props("canClear")).toBeFalsy();
  });

  test("should propagate appliedFiltersValues to AdvancedSearchChips component", async () => {
    const wrapper = mount(AdvancedSearchView, { props });

    expect(wrapper.findComponent(AdvancedSearchChips).props("appliedFilters")).toStrictEqual(
      props.appliedFiltersValues
    );
  });

  test("should propagate filterValues to AdvancedSearchFilters component", async () => {
    const wrapper = shallowMount(AdvancedSearchView, { props });

    expect(wrapper.findComponent(AdvancedSearchFilters).props("filtersValues")).toStrictEqual(props.filtersValues);
  });

  test.each([true, false])(
    "should propagate showExportButton prop to AdvancedSearchQuery component",
    async (showExportButton: boolean) => {
      const wrapper = shallowMount(AdvancedSearchView, { props: { ...props, showExportButton } });

      expect(wrapper.findComponent(AdvancedSearchQuery).props("showExportButton")).toStrictEqual(showExportButton);
    }
  );

  test("it should pass the correct props to AdvancedSearchQuery", async () => {
    const wrapper = shallowMount(AdvancedSearchView, { props });

    expect(wrapper.findComponent(AdvancedSearchQuery).props()).toStrictEqual({
      query: "",
      canSearch: true,
      canExport: true,
      isSearching: false,
      showExportButton: true,
      canUserToggleView: true,
      experiencesCount: 10,
      isExporting: false,
      isSelected: true,
    });
  });
});
