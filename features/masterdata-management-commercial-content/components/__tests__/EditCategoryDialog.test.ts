import { mount } from "@vue/test-utils";
import { describe, test, expect, vi } from "vitest";
import EditCategoryDialog from "../EditCategoryDialog.vue";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import StepDialog from "../StepDialog.vue";
import NovaInputText from "@/ui-kit/NovaInputText/NovaInputText.vue";

const createCategory = (name) => ({
  id: "category-id",
  name,
  code: "category-code",
  hierarchical_group_code: "category-hg-code",
});
const handlerMock = vi.fn();

describe("EditCategoryDialog", () => {
  test("renders correctly", () => {
    const wrapper = getMount();
    expect(wrapper.exists()).toBe(true);
  });

  test("updates category name when input changes", async () => {
    const wrapper = getMount();
    const input = wrapper.find("#update-category-name-input");
    await input.setValue("New Category Name");
    expect(wrapper.vm.newCategoryName).toBe("New Category Name");
  });

  test("enables save button when newCategoryName is valid", async () => {
    const wrapper = getMount();
    const input = wrapper.findComponent(NovaInputText);
    await input.setValue("Valid Name");
    await wrapper.vm.$nextTick();
    const button = wrapper.findComponent(NovaButton);
    expect(button.attributes("disabled")).toBeFalsy();
  });

  test("closes when StepDialog emits close", async () => {
    const wrapper = getMount();
    const stepDialog = wrapper.findComponent(StepDialog);
    await stepDialog.vm.$emit("close");
    expect(wrapper.emitted("confirm")).toBeTruthy();
  });

  test("handleSave invokes handler prop and emits correct event", async () => {
    const wrapper = getMount();
    await wrapper.vm.handleSave();
    expect(handlerMock).toHaveBeenCalledWith(wrapper.props().category, wrapper.vm.newCategoryName);
    expect(wrapper.emitted("confirm")).toBeTruthy();
  });

  test("handleSave handles error correctly when handler prop throws", async () => {
    handlerMock.mockImplementationOnce(() => {
      throw new Error("Test error");
    });
    const wrapper = getMount();
    await expect(wrapper.vm.handleSave).rejects.toThrow("Test error");
    expect(wrapper.emitted("cancel")).toBeTruthy();
  });
});

function getMount() {
  return mount(EditCategoryDialog, {
    global: {
      mocks: {
        $t: (msg) => msg,
      },
    },
    props: {
      handler: handlerMock,
      category: createCategory("Old Category Name"),
    },
  });
}
