import { config, mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";
import CollapsableCheckList from "@/features/experience-shared/components/CollapsableCheckList.vue";
import { testId } from "@/utils/test.utils";
import { Option } from "@/types/Option";

config.global.mocks = {
  $t: (text: string) => text,
};

const options = [
  { label: "option 1", value: "opt1" },
  { label: "option 2", value: "opt2" },
  { label: "option 3", value: "opt3" },
  { label: "option 4", value: "opt4" },
  { label: "option 4", value: "opt5" },
  { label: "option 5", value: "opt6" },
  { label: "option 6", value: "opt7" },
  { label: "option 7", value: "opt8" },
  { label: "option 8", value: "opt9" },
  { label: "option 10", value: "opt10" },
];

const props = reactive({
  open: false,
  modelValue: [],
  title: "title",
  showCheckbox: true,
  options: options,
  columns: 2,
  description: undefined,
  isDisabled: false,
  readonly: false,
});

const items = testId("collapsable-check-list-item");
const panel = testId("collapsable-check-list-panel");

describe("CollapsableCheckList", () => {
  test("it should render correctly", () => {
    const wrapper = mount(CollapsableCheckList, { props });

    expect(wrapper.exists()).toBeTruthy();
    expect(wrapper.text()).toContain(props.title);
  });

  test("it should open and close correctly", async () => {
    const wrapper = mount(CollapsableCheckList, { props });
    // open
    const events = () => wrapper.emitted<Record<string, boolean[][]>>();

    await wrapper.find(testId("collapsable-list-header")).trigger("click");
    expect(wrapper.text()).include(props.options[0].label);
    expect(events()["update:open"][0][0]).toBe(true);
    expect(wrapper.find(panel).exists()).toBe(true);
    expect(wrapper.findAll(items).length).toBe(props.options.length);
    // it should not have a description
    expect(wrapper.text()).not.toContain(props.description);
    //close
    await wrapper.find(testId("collapsable-list-header")).trigger("click");
    expect(wrapper.find(panel).exists()).toBe(false);
    expect(wrapper.findAll(items).length).toBe(0);
  });

  test("it should show the description correctly", async () => {
    const description = "This is the description";
    const wrapper = mount(CollapsableCheckList, {
      props: { ...props, description },
    });

    await wrapper.find(testId("collapsable-list-header")).trigger("click");
    expect(wrapper.text()).toContain(description);
  });

  test("should select an option when clicked", async () => {
    props.open = true;
    const wrapper = mount(CollapsableCheckList, { props });

    const count = wrapper.find(testId("collapsable-check-list-count"));

    const events = () => wrapper.emitted<Record<string, Option[][]>>();
    expect(count.text()).toContain("0");

    await wrapper.find("#checkbox-opt1").trigger("click");
    const expectedValue = [
      {
        label: "option 1",
        value: "opt1",
      },
    ];
    expect(count.text()).toBe("1 common.dropdown.header.selected");

    expect(wrapper.find(testId("collapsable-check-list-clear-btn")).attributes("disabled")).toBe(undefined);
    expect(events()["update:modelValue"][0][0]).toStrictEqual(expectedValue);

    // check the select all checkbox
    await wrapper.find("#checkbox-title").trigger("click");
    expect(count.text()).toBe("0 common.dropdown.header.selected");
    expect(events()["update:modelValue"][1][0]).toStrictEqual([]);

    await wrapper.find("#checkbox-title").trigger("click");
    expect(count.text()).toBe("10 common.dropdown.header.selected");
    expect(events()["update:modelValue"][2][0]).toStrictEqual(props.options);
  });

  test("it should show the description", async () => {
    const wrapper = mount(CollapsableCheckList, {
      props: { ...props, open: true, description: "this is the description" },
    });

    expect(wrapper.text().includes("this is the description"));
  });

  test("clear button", async () => {
    props.modelValue = [];
    props.open = true;
    const wrapper = mount(CollapsableCheckList, { props });

    const events = () => wrapper.emitted<Record<string, Option[][]>>();
    const clearBtn = wrapper.find(testId("collapsable-check-list-clear-btn"));

    // check if is disabled
    expect(clearBtn.attributes("disabled")).toBe("");

    await wrapper.find("#checkbox-opt1").trigger("click");

    expect(clearBtn.attributes("disabled")).toBe(undefined);

    await clearBtn.trigger("click");

    expect(events()["update:modelValue"][1][0]).toStrictEqual([]);
  });

  describe("if the readonly prop is true", () => {
    test("it should not show the clear button", async () => {
      props.open = true;
      props.readonly = true;
      const wrapper = mount(CollapsableCheckList, { props });

      expect(wrapper.find(testId("collapsable-check-list-clear-btn")).exists()).toBe(false);
    });

    test("it should show the readonly list", async () => {
      props.open = true;
      props.readonly = true;
      const wrapper = mount(CollapsableCheckList, { props });

      expect(wrapper.find(testId("collapsable-check-list-readonly")).exists()).toBe(true);
    });
  });
});
