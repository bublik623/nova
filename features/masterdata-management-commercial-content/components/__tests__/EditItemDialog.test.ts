import { mount } from "@vue/test-utils";
import { describe, test, expect, vi } from "vitest";
import { nextTick } from "vue";
import EditItemDialog from "../EditItemDialog.vue";

const createItem = (name: string) => ({
  id: "item-id",
  name,
  language_code: "it",
  code: "item-code",
  hierarchical_group_code: "cat1",
});

const categoryList = [
  { label: "Category One", value: "cat1" },
  { label: "Category Two", value: "cat2" },
];

const handlerMock = vi.fn();

function getMount() {
  return mount(EditItemDialog, {
    global: {
      mocks: {
        $t: (msg) => msg,
      },
    },
    props: {
      handler: handlerMock,
      itemToUpdate: createItem("Old Item Name"),
      categoryList,
    },
  });
}
describe("EditItemDialog with shallowMount", () => {
  test("updates newItemName when NovaInputText emits update:model-value", async () => {
    const wrapper = getMount();
    const inputStub = wrapper.findComponent({ name: "NovaInputText" });
    expect(inputStub.exists()).toBe(true);

    inputStub.vm.$emit("update:model-value", "New Item Name");
    await nextTick();

    expect(wrapper.vm.newItemName).toBe("New Item Name");
  });

  test("updates selectedCategory when NovaSelectSearch emits select:option", async () => {
    const wrapper = getMount();
    const selectStub = wrapper.findComponent({ name: "NovaSelectSearch" });
    expect(selectStub.exists()).toBe(true);

    selectStub.vm.$emit("select:option", { label: "Category Two", value: "cat2" });
    await nextTick();

    expect(wrapper.vm.selectedCategory).toEqual({ label: "Category Two", value: "cat2" });
  });

  test("emits confirm when StepDialog emits close", async () => {
    const wrapper = getMount();
    const stepDialogStub = wrapper.findComponent({ name: "StepDialog" });
    stepDialogStub.vm.$emit("close");
    await nextTick();
    expect(wrapper.emitted("confirm")).toBeTruthy();
  });

  test("handleSave invokes handler prop and emits confirm event", async () => {
    const wrapper = getMount();
    wrapper.vm.newItemName = "New Item Name";
    wrapper.vm.selectedCategory = { label: "Category Two", value: "cat2" };
    await wrapper.vm.handleSave();

    expect(handlerMock).toHaveBeenCalledWith(wrapper.props().itemToUpdate, "New Item Name", "cat2");
    expect(wrapper.emitted("confirm")).toBeTruthy();
    expect(wrapper.vm.loading).toBe(false);
  });

  test("handleSave handles error correctly when handler prop throws", async () => {
    handlerMock.mockImplementationOnce(() => {
      throw new Error("Test error");
    });
    const wrapper = getMount();
    await expect(wrapper.vm.handleSave()).rejects.toThrow("Test error");
    expect(wrapper.emitted("cancel")).toBeTruthy();
    expect(wrapper.vm.loading).toBe(false);
  });

  test("filters categories based on search query", async () => {
    const wrapper = getMount();
    wrapper.vm.searchQuery = "Two";
    await nextTick();
    expect(wrapper.vm.filteredCategories).toEqual([{ label: "Category Two", value: "cat2" }]);
  });

  test("uses fallback category if the item category code is not found", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const customItem = {
      id: "item-id",
      name: "Item Name",
      language_code: "it",
      code: "item-code",
      hierarchical_group_code: "non-existent-in-masterdata-store",
    };

    const wrapper = mount(EditItemDialog, {
      global: {
        mocks: {
          $t: (msg: string) => msg,
        },
      },
      props: {
        handler: handlerMock,
        itemToUpdate: customItem,
        categoryList,
      },
    });

    expect(wrapper.vm.selectedCategory).toEqual({ label: "unknown", value: "non-existent-in-masterdata-store" });
    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
  });
});
