import { ref } from "vue";
import { isEqual } from "lodash";

export function useMultiSelection<TItem>() {
  const selectedItems = ref(new Array<TItem>()) as Ref<Array<TItem>>;
  const areAllSelected = ref(false);
  const areSomeSelected = computed(() => areAllSelected.value || selectedItems.value.length > 0);

  const isItemSelected = (item: TItem) =>
    areAllSelected.value || !!selectedItems.value.find((selectedItem) => isEqual(selectedItem, item));

  const toggleItemSelection = (item: TItem) => {
    if (areAllSelected.value) {
      throw new Error("you can't deselect single items while all items are selected");
    }

    selectedItems.value = isItemSelected(item)
      ? selectedItems.value.filter((selectedItem) => !isEqual(selectedItem, item))
      : [...selectedItems.value, item];
  };

  const selectAll = () => {
    selectedItems.value = [];
    areAllSelected.value = true;
  };

  const clearSelection = () => {
    selectedItems.value = [];
    areAllSelected.value = false;
  };

  const toggleAllSelection = () => {
    areSomeSelected.value ? clearSelection() : selectAll();
  };

  return {
    selectedItems,
    areAllSelected,
    areSomeSelected,
    isItemSelected,
    toggleItemSelection,
    selectAll,
    clearSelection,
    toggleAllSelection,
  };
}
