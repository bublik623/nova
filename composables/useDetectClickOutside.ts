import { Ref, unref, onMounted, onUnmounted } from "vue";

export function useDetectClickOutside(element: Ref<Element | null>, callback: (event: MouseEvent) => void) {
  const listener = (event: MouseEvent) => {
    const el = unref(element);

    if (!el || event.target === el || event.composedPath().includes(el)) {
      return;
    }

    callback(event);
  };

  onMounted(() => {
    window.addEventListener("click", listener, {
      passive: true,
    });
  });

  onUnmounted(() => {
    window.removeEventListener("click", listener);
  });
}
