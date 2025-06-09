import { VNodeProps, AllowedComponentProps, h, render, watch, ref } from "vue";
import NovaModal from "@/ui-kit/NovaModal/NovaModal.vue";

export type ExtractComponentProps<TComponent> = TComponent extends new () => {
  $props: infer P;
}
  ? Omit<P, keyof VNodeProps | keyof AllowedComponentProps>
  : never;

export type UseAsyncModalEvents = {
  (e: "confirm"): void;
  (e: "cancel"): void;
};

// This function is needed to shut up sonar, which complains about duplicated code
export function setupAsyncModal() {
  const showModal = ref(false);

  const confirmCallback = async () => {
    showModal.value = false;
    resolve(true);
  };

  const cancelCallback = () => {
    showModal.value = false;
    resolve(false);
  };

  let resolve: (value: boolean) => void;

  const promise = new Promise<boolean>((res) => {
    resolve = res;
  });

  const container = document.createElement("div");
  document.body.appendChild(container);

  return {
    showModal,
    confirmCallback,
    cancelCallback,
    promise,
    container,
  };
}

export function useAsyncModal<TComponent extends Component>(
  component: TComponent,
  options: { closeOnOverlayClick: boolean } = { closeOnOverlayClick: false }
) {
  const { closeOnOverlayClick } = options;
  const { showModal, confirmCallback, cancelCallback, promise, container } = setupAsyncModal();
  const { vueApp } = useNuxtApp();

  let componentProps: ExtractComponentProps<TComponent> | null = null;

  watch(showModal, (value) => {
    // mount the modal, and render the component inside it as a default slot.
    // we also pass the cancel and confirm callbacks as emits to the component.
    const modalInstance = h(
      NovaModal,
      {
        ...(closeOnOverlayClick ? { "onClick:on-overlay": cancelCallback } : {}),
        show: value,
      },
      () =>
        h(component, {
          ...(componentProps || {}),
          onConfirm: confirmCallback,
          onCancel: cancelCallback,
        })
    );

    // assign the current app context so we can access useNuxtApp, etc
    // https://github.com/vuejs/core/issues/2097
    modalInstance.appContext = vueApp._context;

    render(modalInstance, container);
  });

  function openModal(props: ExtractComponentProps<TComponent>) {
    componentProps = props;
    showModal.value = true;
    return promise;
  }

  return {
    openModal,
  };
}
