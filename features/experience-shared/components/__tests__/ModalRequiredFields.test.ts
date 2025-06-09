import { describe, test, expect } from "vitest";
import { config, mount, MountingOptions, VueWrapper } from "@vue/test-utils";
import ModalRequiredFields, { ModalRequiredFieldsProps } from "../ModalRequiredFields.vue";
import { testId } from "@/utils/test.utils";

config.global.mocks = {
  $t: (text: string) => text,
};

describe("ModalRequiredFields", () => {
  let wrapper: VueWrapper<InstanceType<typeof ModalRequiredFields>>;

  const render = (options: MountingOptions<ModalRequiredFieldsProps> = {}) => {
    wrapper = mount(ModalRequiredFields, {
      props: { modelValue: true },
      ...options,
    });
  };

  const findModal = () => wrapper.find(testId("modal-required-fields"));
  const findConfirmButton = () => wrapper.find(testId("modal-action-ok"));

  test("renders the modal", async () => {
    render();

    // it should load the data
    expect(findModal().exists()).toBe(true);
  });

  test("does not render the modal when modelValue is false", () => {
    render({ props: { modelValue: false } });

    expect(findModal().exists()).toBe(false);
  });

  test("closes the modal when the confirm button is clicked", async () => {
    render();

    await findConfirmButton().trigger("click");

    expect(wrapper.emitted("update:modelValue")).toBeTruthy();
    expect(findModal().exists()).toBeFalsy();
  });
});
