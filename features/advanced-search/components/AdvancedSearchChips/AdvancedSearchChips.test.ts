import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";
import AdvancedSearchChips from "./AdvancedSearchChips.vue";
import { AdvancedFiltersValues } from "../../types/filters";
import NovaChip from "@/ui-kit/NovaChip/NovaChip.vue";
import { format } from "date-fns";
import { DATE_FORMAT_SHORT } from "@/constants/date.constants";

const options = [
  { label: "Option 1", value: "option-1" },
  { label: "Option 2", value: "option-2" },
];

const props: { appliedFilters: AdvancedFiltersValues } = {
  appliedFilters: {
    filterKey: { type: "multiselect", value: options, isDefaultValue: false },
    dateRangeKey: { type: "date-range", value: { from: new Date(2023, 3, 1), to: new Date(2023, 3, 15) } },
  },
};

describe("AdvancedSearchChips", () => {
  test("it shows a chip for each selected option of an applied filter", () => {
    const wrapper = mount(AdvancedSearchChips, { props });

    const chips = wrapper.findAllComponents(NovaChip);
    expect(chips.length).toBe(3);
  });

  test.each([
    [
      "multiselect",
      `[data-filter-key="filterKey"][data-filter-option="${options[0].value}"]`,
      { label: options[0].label, source: { type: "multiselect", filterKey: "filterKey", option: options[0] } },
    ],
    [
      "date-range",
      `[data-filter-key="dateRangeKey"]`,
      { label: "01/04/23 - 15/04/23", source: { type: "date-range", filterKey: "dateRangeKey" } },
    ],
  ])(
    "it should correctly emit the on:removeChip event when the close button of a chip representing a %s filter is clicked",
    (_, chipSelector, expectedEventPayload) => {
      const wrapper = mount(AdvancedSearchChips, { props });

      const chip = wrapper.findComponent(chipSelector);
      chip.find(".NovaChip__button").trigger("click");
      expect(wrapper.emitted()["on:removeChip"][0]).toEqual([expectedEventPayload]);
    }
  );

  describe("it should show the correct date range chip", () => {
    test("if both from and to are applied", () => {
      const dates = props.appliedFilters.dateRangeKey.value;
      const wrapper = mount(AdvancedSearchChips, { props });

      const formattedDateRange = `${format(dates.from, DATE_FORMAT_SHORT)} - ${format(dates.to, DATE_FORMAT_SHORT)}`;

      expect(wrapper.text()).toContain(formattedDateRange);
    });

    test("if only from is applied", () => {
      const date = new Date(2023, 3, 1);
      const wrapper = mount(AdvancedSearchChips, {
        props: {
          ...props,
          appliedFilters: {
            dateRangeKey: { type: "date-range", value: { from: date } },
          },
        },
      });

      const formattedDateRange = `${format(date, DATE_FORMAT_SHORT)}`;

      expect(wrapper.text()).toContain(formattedDateRange);
    });

    test("if only to is applied", () => {
      const date = new Date(2023, 3, 15);
      const wrapper = mount(AdvancedSearchChips, {
        props: {
          ...props,
          appliedFilters: {
            dateRangeKey: { type: "date-range", value: { to: date } },
          },
        },
      });

      const formattedDateRange = `${format(date, DATE_FORMAT_SHORT)}`;

      expect(wrapper.text()).toContain(formattedDateRange);
    });
  });
});
