import { config, mount } from "@vue/test-utils";
import { describe, test, expect, vi } from "vitest";
import EventFieldModal from "../EventFieldModal.vue";

const $tMock = vi.fn((s: string) => s);
vi.stubGlobal("useNuxtApp", () => ({
  $t: $tMock,
}));
config.global.mocks = {
  $t: $tMock,
};

describe("EventFieldModal", () => {
  test("renders the modal with correct content", () => {
    const wrapper = mount(EventFieldModal, {
      props: { handleConfirm: vi.fn(), action: "edit" },
    });

    expect(wrapper.find('[data-testid="event-field-modal"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("event-field.modal.edit.title");
    expect(wrapper.text()).toContain("event-field.modal.edit.description");
    expect(wrapper.text()).toContain("event-field.modal.edit.prompt");
  });

  test("calls handleConfirm and emits confirm event on confirm button click", async () => {
    const handleConfirm = vi.fn();
    const wrapper = mount(EventFieldModal, {
      props: { handleConfirm, action: "edit" },
    });

    await wrapper.find('[data-testid="modal-action-confirm"]').trigger("click");

    expect(handleConfirm).toHaveBeenCalledOnce();

    expect(wrapper.emitted().confirm).toBeTruthy();
  });

  test("emits cancel event on cancel button click", async () => {
    const wrapper = mount(EventFieldModal, {
      props: { handleConfirm: vi.fn(), action: "edit" },
    });

    await wrapper.find('[data-testid="modal-action-cancel"]').trigger("click");

    expect(wrapper.emitted().cancel).toBeTruthy();
  });

  test("renders the modal with correct content for edit action", () => {
    const wrapper = mount(EventFieldModal, {
      props: { handleConfirm: vi.fn(), action: "edit" },
    });

    expect(wrapper.find('[data-testid="event-field-modal"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("event-field.modal.edit.title");
    expect(wrapper.text()).toContain("event-field.modal.edit.description");
    expect(wrapper.text()).toContain("event-field.modal.edit.prompt");
  });

  test("renders the modal with correct content for remove action", () => {
    const wrapper = mount(EventFieldModal, {
      props: { handleConfirm: vi.fn(), action: "remove" },
    });

    expect(wrapper.find('[data-testid="event-field-modal"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("event-field.modal.remove.title");
    expect(wrapper.text()).toContain("event-field.modal.remove.description");
    expect(wrapper.text()).toContain("event-field.modal.remove.prompt");
  });
});
