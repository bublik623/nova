import { config, mount } from "@vue/test-utils";
import { test, describe, expect } from "vitest";
import CreatePremadeItemList from "../CreatePremadeItemList.vue";

config.global.stubs = {
  NovaButton: true,
  NovaButtonIcon: true,
};

config.global.mocks = {
  $t: (key: string) => key,
};

const selectors = {
  addButton: '[data-testid="add-item-button"]',
  inputField: (index: number) => `#premade-item-input-${index}`,
  deleteField: (index: number) => `[data-testid="premade-item-delete-${index}"]`,
  allInputFields: '[id^="premade-item-input-"]',
};

describe("CreatePremadeItemList", () => {
  test("adds an item when the add button is clicked", async () => {
    const wrapper = mount(CreatePremadeItemList, { props: { modelValue: [] } });

    await wrapper.find(selectors.inputField(0)).setValue("hey!");
    await wrapper.find(selectors.addButton).trigger("click");

    await wrapper.find(selectors.inputField(0)).setValue("oh!");
    await wrapper.find(selectors.addButton).trigger("click");

    expect(wrapper.findAll(selectors.allInputFields).length).toBe(3);
  });

  test("deletes an item when the delete button is clicked", async () => {
    const wrapper = mount(CreatePremadeItemList, { props: { modelValue: [] } });

    await wrapper.find(selectors.inputField(0)).setValue("hey!");
    await wrapper.find(selectors.addButton).trigger("click");

    expect(wrapper.findAll(selectors.allInputFields).length).toBe(2);

    const deleteButton = wrapper.find(selectors.deleteField(0));

    await deleteButton.trigger("click");
    expect(wrapper.findAll(selectors.allInputFields).length).toBe(1);
  });

  test("it emits the correct true validation", async () => {
    const wrapper = mount(CreatePremadeItemList, { props: { modelValue: [] } });

    await wrapper.find(selectors.inputField(0)).setValue("hey!");

    const [lastItem] = wrapper.emitted("update:validation")?.slice(-1)?.flat() || [];

    expect(lastItem).toBe(true);
  });

  test("it emits the correct false validation", async () => {
    const wrapper = mount(CreatePremadeItemList, { props: { modelValue: [] } });

    await wrapper.find(selectors.inputField(0)).setValue("hey!");
    // once you add another item, the validation is false because it's empty
    await wrapper.find(selectors.addButton).trigger("click");

    const [lastItem] = wrapper.emitted("update:validation")?.slice(-1)?.flat() || [];

    expect(lastItem).toBe(false);
  });
});
