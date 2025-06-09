import { watch, render, Component } from "vue";
import NovaModalConfirm, { NovaModalConfirmProps } from "@/ui-kit/NovaModalConfirm/NovaModalConfirm.vue";
import { setupAsyncModal } from "./useAsyncModal";

export function useAsyncConfirmModal(
  props: Omit<NovaModalConfirmProps, "confirmCallback" | "cancelCallback" | "showModal">
) {
  const { showModal, confirmCallback, cancelCallback, promise, container } = setupAsyncModal();

  watch(showModal, (value) => {
    const modalInstance = h<Component<NovaModalConfirmProps>>(NovaModalConfirm, {
      ...props,
      cancelCallback,
      confirmCallback,
      showModal: value,
    });

    render(modalInstance, container);
  });

  const openModal = () => {
    showModal.value = true;
    return promise;
  };

  return {
    openModal,
  };
}
