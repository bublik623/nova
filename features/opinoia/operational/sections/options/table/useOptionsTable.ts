import { Option } from "../types";
import { cloneDeep } from "lodash";
import { uuid } from "@/utils/uuid";
import { useSortedOptions } from "./useSortedOptions";
import { DeepReadonly } from "vue";

export function useOptionsTable(options: Ref<Option[]>, lastSavedOptions: DeepReadonly<Ref<Option[]>>) {
  const { sortColumn, sortDirection, sortBy } = useSortedOptions(options);

  function addNewOption() {
    options.value.push({
      id: uuid(),
      title: "",
      code: "",
      duration: undefined,
      subchannels: "all",
      paxTypes: "all",
    });
  }

  function duplicateOption(optionToDuplicate: Option) {
    const indexOfOptionToDuplicate = options.value.findIndex(byId(optionToDuplicate.id));
    const duplicatedOption = { ...cloneDeep(optionToDuplicate), id: uuid() };
    options.value.splice(indexOfOptionToDuplicate + 1, 0, duplicatedOption);
  }

  function removeOption(optionToRemove: Option) {
    const indexOfOptionToRemove = options.value.findIndex(byId(optionToRemove.id));
    if (indexOfOptionToRemove < 0) return;
    options.value.splice(indexOfOptionToRemove, 1);
  }

  function canEditOptionsCode(option: Option) {
    const lastSavedVersion = lastSavedOptions.value.find((lastSavedOption) => lastSavedOption.id === option.id);
    const lastSavedCodeIsEmpty = !lastSavedVersion || lastSavedVersion.code === "";
    return option.id.startsWith("local-") || lastSavedCodeIsEmpty;
  }

  return {
    sortColumn,
    sortDirection,
    canEditOptionsCode,
    sortBy,
    addNewOption,
    duplicateOption,
    removeOption,
  };
}

function byId(id: string) {
  return (option: Option) => option.id === id;
}
