import { mount } from "@vue/test-utils";
import { test, expect, describe, vi } from "vitest";
import NovaModalConfirm, { NovaModalConfirmProps } from "./NovaModalConfirm.vue";

const props: NovaModalConfirmProps = {
  showModal: true,
  title: "test modal",
  description: "test description",
  ctaCancelText: "no",
  ctaConfirmText: "yes",
  confirmCallback: vi.fn(),
  cancelCallback: vi.fn(),
};

const selectors = {
  overlay: "[data-testid='modal-overlay']",
  modal: "[data-testid='modal']",
  buttonLeave: "[data-testid='modal-leave-btn']",
  buttonSave: "[data-testid='modal-save-btn']",
};

describe("NovaModalConfirm", () => {
  test("it should mount and render correctly", () => {
    const wrapper = mount(NovaModalConfirm, { props });

    expect(wrapper).toBeTruthy();
    expect(wrapper.find(selectors.overlay).exists()).toBe(true);
    expect(wrapper.find(selectors.modal).exists()).toBe(true);
    expect(wrapper.find(selectors.modal).findAll("p")[0].text()).toBe(props.title);
    expect(wrapper.find(selectors.modal).findAll("p")[1].text()).toBe(props.description);
    expect(wrapper.find(selectors.buttonLeave).text()).toBe(props.ctaCancelText);
    expect(wrapper.find(selectors.buttonSave).text()).toBe(props.ctaConfirmText);
  });

  describe("when the user clicks on the cancel button", () => {
    test("it should invoke the cancel callback", async () => {
      const wrapper = mount(NovaModalConfirm, { props });

      await wrapper.find(selectors.buttonLeave).trigger("click");

      expect(props.cancelCallback).toHaveBeenCalled();
    });
  });

  describe("when the user clicks on the confirm button", () => {
    test("it should invoke the confirm callback", async () => {
      const wrapper = mount(NovaModalConfirm, { props });

      await wrapper.find(selectors.buttonSave).trigger("click");

      expect(props.confirmCallback).toHaveBeenCalled();
    });
  });
});
