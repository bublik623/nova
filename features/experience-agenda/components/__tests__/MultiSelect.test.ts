import { describe, test, expect } from "vitest";
import { mount, config, VueWrapper, MountingOptions } from "@vue/test-utils";
import MultiSelect, { MultiSelectProps, MultiSelectOption } from "../MultiSelect.vue";
import { testId } from "@/utils/test.utils";

config.global.mocks = {
  $t: (text: string) => text,
};

const optionsMock = [
  { label: "Option 1", value: "option-1" },
  { label: "Option 2", value: "option-2" },
  { label: "Option 3", value: "option-3" },
];

const defaultProps: MultiSelectProps = {
  placeholder: "Select option",
  options: optionsMock,
  modelValue: [],
};

describe("MultiSelect", () => {
  let wrapper: VueWrapper<InstanceType<typeof MultiSelect>>;

  const render = (options: MountingOptions<MultiSelectProps> = {}) => {
    wrapper = mount(MultiSelect, {
      props: defaultProps,
      ...options,
    });
  };

  const findTrigger = () => wrapper.find(testId("multi-select-trigger"));
  const findLabel = () => wrapper.find(testId("multi-select-label"));
  const findClear = () => wrapper.find(testId("multi-select-clear"));
  const findItem = (index: number) =>
    wrapper.findAll<HTMLInputElement>(testId("multi-select-item"))[index].find("input");

  test("renders placeholder when no option is selected", () => {
    render();

    expect(wrapper.html()).toContain("Select option");
  });

  test("selects and deselects options when clicked", async () => {
    render();

    // open
    await findTrigger().trigger("click");

    const option1Checkbox = findItem(0);
    const option3Checkbox = findItem(2);

    // Select Option 1
    await option1Checkbox.trigger("click");

    // emits
    const events = wrapper.emitted<MultiSelectOption[]>()["update:modelValue"];

    expect(events[0][0]).toEqual([{ label: "Option 1", value: "option-1" }]);

    // Select Option 3
    await option3Checkbox.trigger("click");

    expect(events[1][0]).toEqual([
      { label: "Option 1", value: "option-1" },
      { label: "Option 3", value: "option-3" },
    ]);

    // Deselect Option 1
    await option1Checkbox.trigger("click");

    expect(events[2][0]).toEqual([{ label: "Option 3", value: "option-3" }]);
  });

  test("renders selected options when options are selected", () => {
    render({
      props: {
        options: optionsMock,
        modelValue: [
          { label: "Option 1", value: "option-1" },
          { label: "Option 3", value: "option-3" },
        ],
      },
    });

    expect(findLabel().text()).toBe("Option 1, Option 3");
  });

  test("clears all selected options when Clear button is clicked", async () => {
    render();

    // open
    await findTrigger().trigger("click");

    // click clear
    await findClear().trigger("click");

    const events = wrapper.emitted<MultiSelectOption[]>()["update:modelValue"];

    // should be empty
    expect(events[0][0]).toEqual([]);
  });

  describe("Custom label", () => {
    test("returns the value of `props.label` when it is a string", () => {
      render({
        props: {
          ...defaultProps,
          label: "static label",
          modelValue: [{ label: "Option 1", value: "option-1" }],
        },
      });

      expect(wrapper.html()).toContain("static label");
    });

    test("calls `props.label` when it is a function", () => {
      render({
        props: {
          ...defaultProps,
          label: (defaultText: string) => "dynamic label " + defaultText,
          modelValue: [{ label: "Option 1", value: "option-1" }],
        },
      });

      expect(wrapper.html()).toContain("dynamic label Option 1");
    });

    test("renders default label when `props.label` is not defined", () => {
      render({
        props: {
          options: optionsMock,
          modelValue: [{ label: "Option 1", value: "option-1" }],
        },
      });

      expect(wrapper.html()).toContain("Option 1");
    });
  });
});
