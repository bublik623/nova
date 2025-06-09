import { mount, shallowMount } from "@vue/test-utils";
import AdvancedSearchQuery from "@/features/advanced-search/components/AdvancedSearchQuery/AdvancedSearchQuery.vue";
import { describe, test, expect, vi, afterEach } from "vitest";
import { testId } from "@/utils/test.utils";
import { ExtractComponentProps } from "@/features/core-shared/composables/useAsyncModal";
import NovaButtonToggle from "@/ui-kit/NovaButtonToggle/NovaButtonToggle.vue";

const translationFunction = vi.fn((s: string) => s);

vi.mock("#app", () => ({
  useNuxtApp: () => ({
    $t: translationFunction,
  }),
}));

const props: ExtractComponentProps<typeof AdvancedSearchQuery> = {
  query: "",
  canSearch: true,
  canExport: true,
  isSearching: false,
  isExporting: false,
  isSelected: false,
  experiencesCount: 0,
  showExportButton: true,
  canUserToggleView: true,
  onClearQuery: vi.fn(),
  onSearch: vi.fn(),
};

describe("AdvancedSearchQuery", () => {
  afterEach(async () => {
    vi.clearAllMocks();
  });

  test("renders the input and button correctly", () => {
    const wrapper = mount(AdvancedSearchQuery, { props });

    const input = wrapper.find("#advanced-search-query-input");
    const buttons = wrapper.findAllComponents({ name: "NovaButton" });

    expect(input.exists()).toBe(true);
    expect(buttons.length).toBe(2);
    //@ts-expect-error ...
    expect(input.element.value).toBe("");
    expect(buttons.some((button) => button.text() == "common.search")).toBe(true);
    expect(buttons.some((button) => button.text() == "common.export")).toBe(true);
  });

  test('it should display toggle view button if "canUserToggleView" prop is true', () => {
    const wrapper = shallowMount(AdvancedSearchQuery, { props });

    const toggleViewButton = wrapper.findComponent(NovaButtonToggle);

    expect(toggleViewButton.exists()).toBe(true);
  });

  test('it should not display toggle view button if "canUserToggleView" prop is false', () => {
    const wrapper = shallowMount(AdvancedSearchQuery, { props: { ...props, canUserToggleView: false } });

    const toggleViewButton = wrapper.findComponent(NovaButtonToggle);

    expect(toggleViewButton.exists()).toBe(false);
  });

  test("it should render the export button if showExportButton prop is true", () => {
    const wrapper = mount(AdvancedSearchQuery, { props: { ...props, showExportButton: true } });

    const buttons = wrapper.findAllComponents({ name: "NovaButton" });
    const exportButton = buttons.find((button) => button.attributes("data-testid") === "advanced-search-export-button");
    expect(exportButton?.exists()).toBe(true);
  });

  test("it should not render the export button if showExportButton prop is false", () => {
    const wrapper = mount(AdvancedSearchQuery, { props: { ...props, showExportButton: false } });

    const buttons = wrapper.findAllComponents({ name: "NovaButton" });
    const exportButton = buttons.find((button) => button.attributes("data-testid") === "advanced-search-export-button");
    expect(exportButton).toBeUndefined();
  });

  test.each([
    { experiencesCount: 0, expectedTranslationOptions: { num: 0, placeholders: { count: 0 } } },
    { experiencesCount: 1, expectedTranslationOptions: { num: 1, placeholders: { count: 1 } } },
    { experiencesCount: 2, expectedTranslationOptions: { num: 2, placeholders: { count: 2 } } },
    { experiencesCount: 5, expectedTranslationOptions: { num: 2, placeholders: { count: 5 } } },
  ])("shows the count of experiences", async ({ experiencesCount, expectedTranslationOptions }) => {
    const wrapper = mount(AdvancedSearchQuery, {
      props: { ...props, experiencesCount },
    });

    const experienceCountDiv = wrapper.find(".experiences-count");

    expect(experienceCountDiv.exists()).toBe(true);
    expect(experienceCountDiv.text()).toBe("advancedSearch.query.experiencesCount");
    expect(
      translationFunction.mock.calls.filter((call) => call[0] === "advancedSearch.query.experiencesCount").length
    ).toBe(1);
    expect(translationFunction).toHaveBeenCalledWith(
      "advancedSearch.query.experiencesCount",
      expectedTranslationOptions
    );
  });

  test("updates the count of experiences when the prop changes", async () => {
    const wrapper = mount(AdvancedSearchQuery, { props });

    await wrapper.setProps({ experiencesCount: 5 });

    const experiencesCountDiv = wrapper.find(".experiences-count");

    expect(experiencesCountDiv.exists()).toBe(true);
    expect(
      translationFunction.mock.calls.filter((call) => call[0] === "advancedSearch.query.experiencesCount").length
    ).toBe(2);
    expect(translationFunction).toHaveBeenCalledWith("advancedSearch.query.experiencesCount", {
      num: 0,
      placeholders: { count: 0 },
    });
    expect(translationFunction).toHaveBeenCalledWith("advancedSearch.query.experiencesCount", {
      num: 2,
      placeholders: { count: 5 },
    });
  });

  describe("search button", () => {
    test("emits the search event when the search button is clicked", async () => {
      const wrapper = mount(AdvancedSearchQuery, { props });

      const searchButton = wrapper.findComponent("[data-testid='advanced-search-query-button']");

      await searchButton.trigger("click");

      expect(wrapper.emitted("search")?.length).toBe(1);
    });

    test("enables the search button when the canSearch prop is true", async () => {
      const wrapper = mount(AdvancedSearchQuery, {
        props: { ...props, canSearch: true },
      });

      const searchButton = wrapper.find("[data-testid='advanced-search-query-button']");

      expect(searchButton.attributes().disabled).toBeUndefined();
    });

    test("disable the search button when canSearch prop is false", async () => {
      const wrapper = mount(AdvancedSearchQuery, {
        props: { ...props, canSearch: false },
      });

      const searchButton = wrapper.find("[data-testid='advanced-search-query-button']");

      expect(searchButton.attributes().disabled).not.toBeNull();
    });
  });

  describe("export button", () => {
    test("enable the export button when the canExport prop is true", async () => {
      const wrapper = mount(AdvancedSearchQuery, {
        props: { ...props, canExport: true },
      });

      const exportButton = wrapper.findComponent("[data-testid='advanced-search-export-button']");

      expect(exportButton.attributes().disabled).toBeUndefined();
    });

    test("disable the export button when the canExport prop is false", async () => {
      const wrapper = mount(AdvancedSearchQuery, {
        props: { ...props, canExport: false },
      });

      const exportButton = wrapper.findComponent("[data-testid='advanced-search-export-button']");

      expect(exportButton.attributes().disabled).not.toBeNull();
    });

    test("emits the export event when the export button is clicked", async () => {
      const wrapper = mount(AdvancedSearchQuery, { props });

      const exportButton = wrapper.findComponent("[data-testid='advanced-search-export-button']");
      await exportButton.trigger("click");

      expect(wrapper.emitted("export")?.length).toBe(1);
    });
  });

  describe("query input", () => {
    test("it should emit the clearQuery event when the clear button is clicked", async () => {
      const wrapper = mount(AdvancedSearchQuery, { props: { ...props, query: "a query" } });

      const clearButton = wrapper.find(testId("advanced-search-query-input-input-text-clear-btn"));

      await clearButton.trigger("click");

      expect(wrapper.emitted("clearQuery")?.length).toBe(1);
    });

    test("it should emit the search event when the user press enter if the canSearch prop is true", async () => {
      const wrapper = mount(AdvancedSearchQuery, {
        props: { ...props, canSearch: true },
      });

      const input = wrapper.find("#advanced-search-query-input");

      await input.trigger("keyup.enter");

      expect(wrapper.emitted("search")?.length).toBe(1);
    });

    test("it should emit the on:updateQuery event when the input value change", async () => {
      const wrapper = mount(AdvancedSearchQuery, {
        props: { ...props, canSearch: true },
      });

      const input = wrapper.find("#advanced-search-query-input");

      await input.setValue("a query");

      expect(wrapper.emitted("on:updateQuery")?.length).toBe(1);
      expect(wrapper.emitted("on:updateQuery")?.[0]?.[0]).toBe("a query");
    });
  });
});
