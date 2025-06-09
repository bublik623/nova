import { AdvancedFilterDateRangeConfig, AdvancedFilterDateRangeValue } from "@/features/advanced-search/types/filters";
import { config, shallowMount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";
import AdvancedSearchFilterDateRange from "../AdvancedSearchFilterDateRange.vue";

config.global.mocks = {
  $t: (key: string) => key,
};

const filter: AdvancedFilterDateRangeConfig = {
  key: "date-range-1",
  label: "Date Range 1",
  type: "date-range",
};

const modelValue: AdvancedFilterDateRangeValue = {
  type: "date-range",
  value: {
    from: new Date(),
    to: new Date(),
  },
};

describe("AdvancedSearchFilterDateRange", () => {
  test("it renders correctly", async () => {
    const wrapper = shallowMount(AdvancedSearchFilterDateRange, {
      props: {
        config: filter,
        modelValue,
      },
    });

    expect(wrapper.find(".AdvancedSearchFilterDateRange").exists()).toBe(true);
    expect(wrapper.findComponent({ name: "NovaInputDate" }).exists()).toBe(true);
  });

  test("it emits the filter with the correct time bounds", async () => {
    const wrapper = shallowMount(AdvancedSearchFilterDateRange, {
      props: { config: filter, modelValue },
    });

    const dateTo = new Date("2024-02-23T09:42:36.768Z");
    const dateFrom = new Date("2024-02-23T09:42:36.768Z");
    const dateToUpperBound = new Date("2024-02-23T23:59:59.999Z");
    const dateRange = {
      from: dateFrom,
      to: dateTo,
    };

    const dateRangeInput = wrapper.findComponent({ name: "NovaInputDate" });

    await dateRangeInput.vm.$emit("update:modelValue", dateRange);

    expect(wrapper.emitted("update:modelValue")).toHaveLength(1);
    expect(wrapper.emitted("update:modelValue")![0][0]).toEqual({
      type: "date-range",
      value: {
        from: dateFrom,
        // The to date should be 23.59.59.999,
        // regardless of the time the user selected
        to: dateToUpperBound,
      },
    });
  });
});
