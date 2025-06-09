import { describe, it, expect, vi } from "vitest";
import { config, mount } from "@vue/test-utils";
import NovaMultiSelect, { Props } from "@/ui-kit/NovaMultiSelect/NovaMultiSelect.vue";
import { testId, startsWithTestId } from "@/utils/test.utils";

const props: Props = {
  options: [
    { label: "Option 1", value: "1" },
    { label: "Option 2", value: "2" },
  ],
  modelValue: [],
  name: "Dropdown Test",
  isOpen: false,
  searchQuery: "",
  showSearchbar: true,
};

config.global.mocks = {
  $t: (s: string) => s,
  useDetectClickOutside: vi.fn(),
};

describe("NovaMultiSelect", () => {
  it("renders correctly ", async () => {
    const wrapper = mount(NovaMultiSelect, { props });

    expect(wrapper.text()).toContain("Dropdown Test");
  });

  it("opens and displays options when toggle button is clicked", async () => {
    const wrapper = mount(NovaMultiSelect, { props });

    await wrapper.find(testId("multiselect-toggle-button")).trigger("click");
    expect(wrapper.findAll(startsWithTestId("options-list-list-item")).length).toBe(props.options.length);
  });

  it("should emit the update:modelValue event when an option is selected", async () => {
    const wrapper = mount(NovaMultiSelect, { props: { ...props, isOpen: true } });

    await wrapper.findAll(startsWithTestId("options-list-list-item"))[0].trigger("click");

    const eventPayload = wrapper.emitted<Event[]>()["update:modelValue"][0];
    expect(eventPayload[0]).toEqual([props.options[0]]);
  });

  it("should emit the update:modelValue event when an option is deselected", async () => {
    const wrapper = mount(NovaMultiSelect, {
      props: { ...props, isOpen: true, modelValue: [props.options[0]] },
    });

    await wrapper.findAll(startsWithTestId("options-list-list-item"))[0].trigger("click");

    const eventPayload = wrapper.emitted<Event[]>()["update:modelValue"][0];
    expect(eventPayload[0]).toEqual([]);
  });

  it("should emit the update:modelValue with an empty array event when the clear button is clicked", async () => {
    const wrapper = mount(NovaMultiSelect, {
      props: { ...props, isOpen: true, modelValue: props.options },
    });

    await wrapper.find(testId("options-list-clear-button")).trigger("click");

    const eventPayload = wrapper.emitted<Event[]>()["update:modelValue"][0];
    expect(eventPayload[0]).toEqual([]);
  });

  it("when searching, it should show the options whose label match the search term", async () => {
    const wrapper = mount(NovaMultiSelect, {
      props: { ...props, isOpen: true },
    });

    expect(wrapper.findAll(startsWithTestId("options-list-list-item")).length).toBe(props.options.length);
    await wrapper.find(testId("dropdown-searchbar-input-text")).setValue("1");
    expect(wrapper.findAll(startsWithTestId("options-list-list-item")).length).toBe(1);
    expect(wrapper.find(startsWithTestId("options-list-list-item")).text()).toBe("Option 1");

    await wrapper.find(testId("dropdown-searchbar-input-text")).setValue("");
    expect(wrapper.findAll(startsWithTestId("options-list-list-item")).length).toBe(props.options.length);
  });

  it("should show a message if there are no options", async () => {
    const wrapper = mount(NovaMultiSelect, {
      props: { ...props, isOpen: true },
    });

    expect(wrapper.findAll(startsWithTestId("options-list-list-item")).length).toBe(props.options.length);
    await wrapper.find(testId("dropdown-searchbar-input-text")).setValue("no-options");
    expect(wrapper.findAll(startsWithTestId("options-list-list-item")).length).toBe(0);
    expect(wrapper.text()).include("multiselect.no-results");
  });

  it("should show a chip with the current number of options selected", async () => {
    const wrapper = mount(NovaMultiSelect, {
      props: { ...props, isOpen: true, modelValue: props.options },
    });

    expect(wrapper.find(".Multiselect__chip").isVisible()).toBeTruthy();
    expect(wrapper.find(".Multiselect__chip").text()).include("2");
  });

  it("should not show the chip if there are no options selected", async () => {
    const wrapper = mount(NovaMultiSelect, {
      props,
    });

    expect(wrapper.find(".Multiselect__chip").isVisible()).toBeFalsy();
  });
});
