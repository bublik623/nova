import { ref, onMounted, onUnmounted } from "vue";

export function useMediaQuery() {
  const bigDesktopMQ = window.matchMedia("(min-width: 1920px)");
  const isBigDesktop = ref(bigDesktopMQ.matches);

  const eventListener = (e: MediaQueryListEvent) => {
    isBigDesktop.value = e.matches;
  };

  onMounted(() => {
    bigDesktopMQ.addEventListener("change", eventListener);
  });

  onUnmounted(() => {
    bigDesktopMQ.removeEventListener("change", eventListener);
  });

  return {
    isBigDesktop,
  };
}
