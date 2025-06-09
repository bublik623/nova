import { BaseOption } from "@/types/Option";

export function useMultiSelect<TValue>(
  options: Readonly<Ref<readonly BaseOption<TValue>[]>>,
  filter: Readonly<Ref<string>>,
  selectedOptionsValues: Ref<TValue[] | "all">
) {
  const matchingOptions = computed(() => {
    const filterRegexp = new RegExp(filter.value, "i");

    return options.value.filter((option) => filterRegexp.test(option.label));
  });

  const activeMode = computed<"all" | "specific">(() => {
    return selectedOptionsValues.value === "all" ? "all" : "specific";
  });

  function setMode(mode: "all" | "specific") {
    if (mode === "all") selectedOptionsValues.value = "all";
    else selectedOptionsValues.value = [];
  }

  function isOptionSelected(option: BaseOption<TValue>) {
    return (
      selectedOptionsValues.value === "all" ||
      !!selectedOptionsValues.value.find((selectedOptionValue) => selectedOptionValue === option.value)
    );
  }

  function toggleOptionSelection(option: BaseOption<TValue>) {
    if (activeMode.value === "all") {
      selectedOptionsValues.value = [option.value];
    } else if (isOptionSelected(option)) {
      selectedOptionsValues.value = (selectedOptionsValues.value as TValue[]).filter((val) => val !== option.value);
    } else {
      selectedOptionsValues.value = [...(selectedOptionsValues.value as TValue[]), option.value];
    }
  }

  return {
    matchingOptions,
    activeMode,
    setMode,
    isOptionSelected,
    toggleOptionSelection,
  };
}
