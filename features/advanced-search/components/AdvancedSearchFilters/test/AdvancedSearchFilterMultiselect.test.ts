import { config, shallowMount, mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";
import {
  type AdvancedFilterMultiselectConfig,
  type AdvancedFilterMultiselectValue,
} from "@/features/advanced-search/types/filters";
import AdvancedSearchFilterMultiselect from "../AdvancedSearchFilterMultiselect.vue";

config.global.mocks = {
  $t: (key: string) => key,
};

const options = [
  { value: "option-1", label: "Option 1" },
  { value: "option-2", label: "Option 2" },
  { value: "option-3", label: "Option 3" },
];

const filterConfig: AdvancedFilterMultiselectConfig = {
  type: "multiselect",
  key: "my-multiselect-filter",
  label: "My multiselect filter",
  options,
};

const modelValueWithNoOptionSelected: AdvancedFilterMultiselectValue = {
  type: "multiselect",
  value: [],
  isDefaultValue: false,
};

describe("AdvancedSearchFilterMultiselect", () => {
  test("it renders correctly", async () => {
    const wrapper = shallowMount(AdvancedSearchFilterMultiselect, {
      props: {
        config: filterConfig,
        modelValue: modelValueWithNoOptionSelected,
      },
    });

    expect(wrapper.findComponent({ name: "NovaMultiSelect" }).exists()).toBe(true);
  });

  test("when the selection changes, it emits the update:modelValue with the selected options values", async () => {
    const wrapper = mount(AdvancedSearchFilterMultiselect, {
      props: {
        config: filterConfig,
        modelValue: modelValueWithNoOptionSelected,
      },
    });

    const innerNovaSelectSearch = wrapper.findComponent({ name: "NovaMultiSelect" });

    await innerNovaSelectSearch.vm.$emit("update:modelValue", [options[0]]);
    expect(wrapper.emitted("update:modelValue")).toHaveLength(1);
    expect(wrapper.emitted("update:modelValue")?.[0][0]).toEqual({
      type: "multiselect",
      value: [options[0]],
      isDefaultValue: false,
    });

    await innerNovaSelectSearch.vm.$emit("update:modelValue", [options[0], options[2]]);
    expect(wrapper.emitted("update:modelValue")).toHaveLength(2);
    expect(wrapper.emitted("update:modelValue")?.[1][0]).toEqual({
      type: "multiselect",
      value: [options[0], options[2]],
      isDefaultValue: false,
    });
  });
});
