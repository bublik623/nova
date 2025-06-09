import { mount } from "@vue/test-utils";
import { describe, test, expect, vi } from "vitest";
import CreateCategoryDialog from "../CreateCategoryDialog.vue";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import StepDialog from "../StepDialog.vue";

const handlerMock = vi.fn();

describe("CreateCategoryDialog", () => {
  test("renders correctly", () => {
    const wrapper = getMount();
    expect(wrapper.exists()).toBe(true);
  });

  test("updates category title when input changes", async () => {
    const wrapper = getMount();
    const input = wrapper.find("#create-category-title-input");
    await input.setValue("New Category");
    // @ts-expect-error ...
    expect(wrapper.vm.categoryTitle).toBe("New Category");
  });

  test("enables save button when canSave is true", async () => {
    const wrapper = getMount();
    await wrapper.setValue({ canSave: true });
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

    // @ts-expect-error ...
    await wrapper.vm.handleSave();
    expect(handlerMock).toHaveBeenCalled();
    expect(wrapper.emitted("confirm")).toBeTruthy();
  });

  test("handleSave handles error correctly when handler prop throws", async () => {
    handlerMock.mockImplementationOnce(() => {
      throw new Error("Test error");
    });

    const wrapper = getMount();
    // @ts-expect-error ...
    await expect(wrapper.vm.handleSave).rejects.toThrow("Test error");
    expect(wrapper.emitted("cancel")).toBeTruthy();
  });
});

function getMount() {
  return mount(CreateCategoryDialog, {
    global: {
      stubs: {
        CreatePremadeItemList: true,
      },
      mocks: {
        $t: (msg: string) => msg,
      },
    },
    props: {
      handler: handlerMock,
    },
  });
}
