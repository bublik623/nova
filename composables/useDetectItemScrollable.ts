import { ref } from "vue";
import { useResizeObserver } from "@vueuse/core";
import { debounce } from "lodash";

/**
 * Used to detect if an element is horizontally or vertically scrollable
 * @param element Reference to the HTML element
 */
export function useDetectItemScrollable(element: Ref<HTMLElement | null>) {
  const isHorizontallyScrollable = ref(false);
  const isVerticallyScrollable = ref(false);
  const config = useRuntimeConfig();
  const { RESIZE_OBSERVER_DEBOUNCE } = config.public;

  const checkScroll = debounce(([entry]) => {
    const el = entry.target;
    if (el) {
      isHorizontallyScrollable.value = el.scrollWidth > el.clientWidth;
      isVerticallyScrollable.value = el.scrollHeight > el.clientHeight;
    }
  }, +RESIZE_OBSERVER_DEBOUNCE);

  useResizeObserver(element, checkScroll);

  return {
    isHorizontallyScrollable,
    isVerticallyScrollable,
  };
}
