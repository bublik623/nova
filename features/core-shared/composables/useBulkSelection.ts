import { ref } from "vue";
import { NovaCheckBoxStatus } from "@/ui-kit/NovaCheckbox/NovaCheckbox.vue";
export function useBulkSelection(items: ComputedRef<unknown[]> | unknown[]) {
  const reactiveItems = isRef(items) ? items : ref(items);
  const selectedItems = ref<Set<unknown>>(new Set());

  const isSelected = (item: unknown) => selectedItems.value.has(item);

  const toggleSelection = (item: unknown) => {
    isSelected(item) ? selectedItems.value.delete(item) : selectedItems.value.add(item);
  };

  const selectAll = () => {
    reactiveItems.value.forEach((el) => selectedItems.value.add(el));
  };

  const clearSelection = () => {
    selectedItems.value.clear();
  };

  const areAllSelected = () => {
    return reactiveItems.value.every((item) => isSelected(item));
  };

  const mainStatus = computed<NovaCheckBoxStatus>(() => {
    if (areAllSelected() && reactiveItems.value.length > 0) {
      return "checked";
    } else if (selectedItems.value.size > 0) {
      return "indeterminate";
    } else {
      return "unchecked";
    }
  });

  const toggleMultipleSelection = () => {
    mainStatus.value === "checked" || mainStatus.value === "indeterminate" ? clearSelection() : selectAll();
  };

  return {
    selectedItems,
    isSelected,
    toggleSelection,
    selectAll,
    clearSelection,
    areAllSelected,
    toggleMultipleSelection,
    mainStatus,
  };
}
