import { ref } from "vue";
import { useResizeObserver } from "@vueuse/core";
import { debounce } from "lodash";

/**
 * Used to check if the element has more than one line
 * Make sure to set a fixed line-height to the element
 * @param element HTML element
 */
export function useDetectMultiLine(element: Ref<HTMLElement | null>) {
  const isMultiLine = ref(false);
  const config = useRuntimeConfig();
  const { RESIZE_OBSERVER_DEBOUNCE } = config.public;

  const checkLines = debounce(([entry]) => {
    const el = entry.target;
    if (el) {
      const lineHeight = window.getComputedStyle(el).getPropertyValue("line-height");

      if (lineHeight === "normal") {
        console.error("You must set a fixed height in order to calculate if the element is in more lines");
      }
      const lineHeightNum = parseFloat(lineHeight);

      isMultiLine.value = el.offsetHeight > lineHeightNum || el.scrollHeight > lineHeightNum;
    }
  }, +RESIZE_OBSERVER_DEBOUNCE);

  useResizeObserver(element, checkLines);

  return {
    isMultiLine,
  };
}
