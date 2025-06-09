import { shallowMount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";
import NovaCheckboxGroup from "./NovaCheckboxGroup.vue";

const options = [
  { label: "Option 1", value: "option1" },
  { label: "Option 2", value: "option2" },
  { label: "Option 3", value: "option3" },
];

describe("NovaCheckboxGroup", () => {
  test("should render the component correctly", () => {
    const wrapper = shallowMount(NovaCheckboxGroup, {
      props: {
        options,
        modelValue: reactive([options[0].value]),
      },
    });

    const checkboxes = wrapper.findAllComponents({
      name: "NovaCheckbox",
    });

    expect(checkboxes.length).toBe(3);
    expect(checkboxes[0].attributes("status")).toEqual("checked");
    expect(checkboxes[1].attributes("status")).toEqual("unchecked");
    expect(checkboxes[2].attributes("status")).toEqual("unchecked");
  });

  test("it should update correctly on click", async () => {
    const wrapper = shallowMount(NovaCheckboxGroup, {
      props: {
        options,
        modelValue: reactive([options[0].value]),
      },
    });

    const checkboxes = wrapper.findAllComponents({
      name: "NovaCheckbox",
    });

    // check the second checkbox
    await checkboxes[1].vm.$emit("update:status", options[1].value);

    expect(checkboxes[0].attributes("status")).toEqual("checked");
    expect(checkboxes[1].attributes("status")).toEqual("checked");

    expect(wrapper.emitted("update:modelValue")?.[0][0]).toEqual(["option1", "option2"]);

    // uncheck/toggle the second checkbox
    await checkboxes[0].vm.$emit("update:status", options[0].value);

    expect(checkboxes[0].attributes("status")).toEqual("unchecked");
    expect(checkboxes[1].attributes("status")).toEqual("checked");

    expect(wrapper.emitted("update:modelValue")?.[1][0]).toEqual(["option2"]);
  });

  test("if disabled, the checkboxes should be disabled", async () => {
    const wrapper = shallowMount(NovaCheckboxGroup, {
      props: {
        options,
        modelValue: reactive([]),
        disabled: true,
      },
    });

    const checkboxes = wrapper.findAllComponents({
      name: "NovaCheckbox",
    });

    expect(checkboxes[0].attributes("disabled")).toBe("true");
  });
});
