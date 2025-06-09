import type { Ref } from "vue";
import { watch, onUnmounted } from "vue";

export function useBrowserExitMessage(isEnabled: Ref<boolean | undefined>) {
  const beforeUnloadListener = (event: BeforeUnloadEvent) => {
    event.preventDefault();
  };
  const addBrowserExitListener = () => {
    addEventListener("beforeunload", beforeUnloadListener);
  };

  const removeBrowserExitListener = () => {
    removeEventListener("beforeunload", beforeUnloadListener);
  };
  watch(isEnabled, () => {
    if (isEnabled.value) {
      addBrowserExitListener();
    } else {
      removeBrowserExitListener();
    }
  });

  onUnmounted(() => {
    removeBrowserExitListener();
  });
}
