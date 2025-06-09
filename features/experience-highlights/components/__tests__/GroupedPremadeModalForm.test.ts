import NovaCheckbox from "@/ui-kit/NovaCheckbox/NovaCheckbox.vue";
import { config, mount } from "@vue/test-utils";
import { describe, test, expect } from "vitest";
import GroupedPremadeModalForm from "../GroupedPremadeModalForm.vue";

config.global.mocks = {
  $t: (key: string) => key,
};

config.global.stubs = {
  NovaCheckbox: true,
};

describe("GroupedPremadeModalForm.vue", () => {
  const name = "Test Name";
  const options = [
    { id: "1", name: "Option 1" },
    { id: "2", name: "Option 2" },
    { id: "3", name: "Option 3" },
  ];
  const modelValue = new Map([
    ["1", options[0]],
    ["2", options[1]],
  ]);

  test("renders the component with the correct props", () => {
    //@ts-expect-error ...
    const wrapper = mount(GroupedPremadeModalForm, {
      props: { name, options, modelValue },
    });

    expect(wrapper.props("name")).toStrictEqual(name);
    expect(wrapper.props("options")).toStrictEqual(options);
    expect(wrapper.props("modelValue")).toStrictEqual(modelValue);

    // List items + the "Select all" checkbox
    expect(wrapper.findAllComponents(NovaCheckbox)).toHaveLength(options.length + 1);
    expect(wrapper.findAllComponents(NovaCheckbox).filter((c) => c.props("status") === "checked")).toHaveLength(2);
  });

  test("toggles all items when the group checkbox is clicked", async () => {
    //@ts-expect-error ...
    const wrapper = mount(GroupedPremadeModalForm, {
      props: { name, options, modelValue },
    });

    wrapper.findAllComponents(NovaCheckbox).at(0)?.vm.$emit("update:status", "checked");

    expect(wrapper.props("modelValue")).toStrictEqual(
      new Map([
        ["1", options[0]],
        ["2", options[1]],
        ["3", options[2]],
      ])
    );

    wrapper.findAllComponents(NovaCheckbox).at(0)?.vm.$emit("update:status", "unchecked");

    expect(wrapper.props("modelValue")).toStrictEqual(new Map());
  });

  test("clears all selected items when the clear button is clicked", async () => {
    //@ts-expect-error ...
    const wrapper = mount(GroupedPremadeModalForm, {
      props: { name, options, modelValue },
    });

    const clearButton = wrapper.find('[data-testid="highlight-manager-premade-clear-group"]');
    await clearButton.trigger("click");

    expect(wrapper.props("modelValue").size).toBe(0);
  });

  test("it renders the filtered options correctly", () => {
    const filteredOptions = [{ id: "1", name: "Option 1" }];
    //@ts-expect-error ...
    const wrapper = mount(GroupedPremadeModalForm, {
      props: { name, options, modelValue, filteredOptions },
    });

    // Filtered options + select all checkbox
    expect(wrapper.findAllComponents(NovaCheckbox)).toHaveLength(filteredOptions.length + 1);
  });
});
