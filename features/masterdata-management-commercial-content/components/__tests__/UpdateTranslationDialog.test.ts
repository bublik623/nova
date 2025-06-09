import { config, mount } from "@vue/test-utils";
import { describe, test, expect, vi } from "vitest";
import UpdateTranslationDialog from "../UpdateTranslationDialog.vue";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import StepDialog from "../StepDialog.vue";

const createItem = (languageCode: string) => ({
  id: "item-id",
  code: "item-code",
  name: "item-name",
  description: "item-description",
  language_code: languageCode,
  hierarchical_group_code: "item-hg-code",
});
const handlerMock = vi.fn();
config.global.mocks = {
  $t: (s: string) => s,
};

vi.stubGlobal("useNuxtApp", () => ({
  $t: (s: string) => s,
}));

describe("UpdateTranslationDialog", () => {
  test("renders correctly", () => {
    const wrapper = getMount();
    expect(wrapper.exists()).toBe(true);
  });

  test("updates category title when input changes", async () => {
    const wrapper = getMount();
    const input = wrapper.find("#update-translation-input");
    await input.setValue("New Value");
    expect(wrapper.vm.newTranslation).toBe("New Value");
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

    await wrapper.vm.handleSave();
    expect(handlerMock).toHaveBeenCalled();
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
  return mount(UpdateTranslationDialog, {
    global: {
      mocks: {
        $t: (msg: string) => msg,
      },
    },
    props: {
      action: "update",
      handler: handlerMock,
      mainTranslation: createItem("en"),
      translationToUpdate: createItem("it"),
    },
  });
}
