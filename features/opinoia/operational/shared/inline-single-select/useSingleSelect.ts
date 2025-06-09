import { BaseOption } from "@/types/Option";

export function useSingleSelect<TValue>(
  options: Readonly<Ref<readonly BaseOption<TValue>[]>>,
  filter: Readonly<Ref<string>>,
  selectedOptionValue: Ref<TValue | undefined>
) {
  const matchingOptions = computed(() => {
    const filterRegexp = new RegExp(filter.value, "i");

    return options.value.filter((option) => filterRegexp.test(option.label));
  });

  function isOptionSelected(option: BaseOption<TValue>) {
    return selectedOptionValue.value === option.value;
  }

  function selectOption(option: BaseOption<TValue>) {
    selectedOptionValue.value = option.value;
  }

  return {
    matchingOptions,
    isOptionSelected,
    selectOption,
  };
}
