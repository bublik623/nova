import { describe, expect, test } from "vitest";
import { useBulkSelection } from "../useBulkSelection";

const mockList = ["element-1", "element-2", "element-3"];
describe("useBulkSelection", () => {
  test("it should work correctly", () => {
    const {
      areAllSelected,
      clearSelection,
      isSelected,
      mainStatus,
      selectAll,
      selectedItems,
      toggleMultipleSelection,
      toggleSelection,
    } = useBulkSelection(mockList);

    const emptySet = new Set();

    expect(areAllSelected()).toBeFalsy();
    expect(selectedItems.value).toEqual(emptySet);
    expect(mainStatus.value).toEqual("unchecked");

    toggleSelection("element-2");
    expect(selectedItems.value).toEqual(new Set(["element-2"]));
    expect(isSelected("element-2")).toBeTruthy();
    expect(mainStatus.value).toEqual("indeterminate");

    selectAll();
    expect(areAllSelected()).toBeTruthy();
    expect(selectedItems.value).toEqual(new Set(["element-1", "element-2", "element-3"]));

    toggleSelection("element-2");
    expect(selectedItems.value).toEqual(new Set(["element-1", "element-3"]));
    expect(isSelected("element-2")).toBeFalsy();

    toggleMultipleSelection();
    expect(selectedItems.value).toEqual(emptySet);

    toggleMultipleSelection();
    expect(selectedItems.value).toEqual(new Set(["element-1", "element-2", "element-3"]));
    expect(mainStatus.value).toEqual("checked");

    clearSelection();
    expect(selectedItems.value).toEqual(emptySet);
    expect(mainStatus.value).toEqual("unchecked");
  });
});
