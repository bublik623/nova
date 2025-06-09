import { Middleware, Placement, UseFloatingReturn, autoUpdate, size, useFloating } from "@floating-ui/vue";
import { MultiSelectOption } from "./multi-select.types";
import { whenever } from "@vueuse/core";

interface MultiSelectContext<T> {
  selectedValuesMap: Ref<Map<T, MultiSelectOption<T>>>;
  toggleValue: (value: MultiSelectOption<T>) => void;
  toggleAll: (options: MultiSelectOption<T>[]) => void;
  triggerRef: Ref<HTMLElement | null>;
  floatingRef: Ref<HTMLElement | null>;
  floatingMatchTriggerWidth: Ref<boolean>;
  isDropdownOpen: Ref<boolean>;
  floatingStyles: UseFloatingReturn["floatingStyles"];
  selectedItemsCount: Ref<number>;
  selectAll: (options: MultiSelectOption<T>[]) => void;
  setSelectedValues: (newSelectedValues: MultiSelectOption<T>[]) => void;
  floatingPlacement: Ref<Placement>;
}
const symbol = "multiSelectContext";

export const useMultiSelect = <T>(): MultiSelectContext<T> => {
  const triggerRef = ref<HTMLElement | null>(null);
  const floatingRef = ref<HTMLElement | null>(null);
  const selectedValuesMap = ref(new Map()) as Ref<Map<T, MultiSelectOption<T>>>;
  const selectedItemsCount = computed(() => selectedValuesMap.value.size);
  const floatingPlacement = ref<Placement>("bottom-start");
  const floatingMatchTriggerWidth = ref(false);
  const isDropdownOpen = ref(false);
  const floatingMiddlewareMap = ref(new Map<string, Middleware>());

  const toggleValue = (option: MultiSelectOption<T>) => {
    if (selectedValuesMap.value.has(option.val)) {
      selectedValuesMap.value.delete(option.val);
    } else {
      selectedValuesMap.value.set(option.val, option);
    }
  };

  function selectAll(options: MultiSelectOption<T>[]) {
    selectedValuesMap.value = new Map(options.map((option) => [option.val, option]));
  }

  function toggleAll(options: MultiSelectOption<T>[]) {
    if (selectedValuesMap.value.size === options.length) {
      selectedValuesMap.value.clear();
    } else {
      selectAll(options);
    }
  }

  function setSelectedValues(newSelectedValues: MultiSelectOption<T>[]) {
    selectedValuesMap.value = new Map(newSelectedValues.map((option) => [option.val, option]));
  }

  whenever(floatingMatchTriggerWidth, registerSizeMiddleware);
  function registerSizeMiddleware() {
    if (floatingMiddlewareMap.value.has("size")) {
      return;
    }

    floatingMiddlewareMap.value.set(
      "size",
      size({
        apply({ rects, elements }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
          });
        },
      })
    );
  }

  const { floatingStyles } = useFloating(triggerRef, floatingRef, {
    placement: floatingPlacement,
    open: isDropdownOpen,
    whileElementsMounted: autoUpdate,
    middleware: computed(() => Array.from(floatingMiddlewareMap.value.values())),
  });

  return {
    selectedValuesMap,
    selectedItemsCount,
    toggleValue,
    selectAll,
    setSelectedValues,
    toggleAll,
    isDropdownOpen,
    floatingStyles,
    triggerRef,
    floatingRef,
    floatingPlacement,
    floatingMatchTriggerWidth,
  };
};

export function provideMultiSelectContext<T>(contextData: MultiSelectContext<T>) {
  provide(symbol, contextData);
}

export const useMultiSelectContext = <T = string>(): MultiSelectContext<T> => {
  const context = inject<MultiSelectContext<T>>(symbol);
  if (!context) {
    throw new Error("useMultiSelectContext must be used within a MultiSelect");
  }
  return context;
};
