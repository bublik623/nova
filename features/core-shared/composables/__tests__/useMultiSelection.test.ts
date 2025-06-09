import { describe, expect, test } from "vitest";
import { useMultiSelection } from "../useMultiSelection";

describe("useMultiSelection", () => {
  describe("isItemSelected", () => {
    test("it should return true when all items are considered selected", () => {
      const { toggleAllSelection, isItemSelected } = useMultiSelection<string>();

      toggleAllSelection();

      const result = isItemSelected("a random item");

      expect(result).toBe(true);
    });

    test("it should return true if the individual item is selected", () => {
      const item = "an item";
      const { selectedItems, isItemSelected } = useMultiSelection<string>();

      selectedItems.value = [item];

      const result = isItemSelected(item);

      expect(result).toBe(true);
    });

    test("it should return false if the individual item is not selected", () => {
      const { isItemSelected } = useMultiSelection<string>();

      const result = isItemSelected("an item");

      expect(result).toBe(false);
    });
  });

  describe("toggleItemSelection", () => {
    describe("when not all items are considered selected", () => {
      test("it should select the given individual item if it's not selected", () => {
        const item = "an item";
        const { selectedItems, isItemSelected, toggleItemSelection } = useMultiSelection<string>();

        toggleItemSelection(item);

        expect(selectedItems.value).toContain(item);
        expect(isItemSelected(item)).toBe(true);
      });

      test("it should de-select the given individual item if it's selected", () => {
        const item = "an item";
        const { selectedItems, isItemSelected, toggleItemSelection } = useMultiSelection<string>();

        selectedItems.value = [item];

        toggleItemSelection(item);

        expect(selectedItems.value).not.toContain(item);
        expect(isItemSelected(item)).toBe(false);
      });
    });

    describe("when all items are considered selected", () => {
      test("it should not process the action and throw an error", () => {
        const { toggleAllSelection, selectedItems, toggleItemSelection } = useMultiSelection<string>();
        toggleAllSelection();

        expect(() => toggleItemSelection("an item")).toThrowError(
          "you can't deselect single items while all items are selected"
        );

        expect(selectedItems.value.length).toBe(0);
      });
    });
  });

  describe("selectAll", () => {
    test("it should clear individually selected items", () => {
      const { selectedItems, selectAll } = useMultiSelection<string>();
      selectedItems.value = ["an item", "another item"];

      selectAll();

      expect(selectedItems.value.length).toBe(0);
    });

    test("it should consider all items selected", () => {
      const { isItemSelected, selectAll } = useMultiSelection<string>();

      selectAll();

      expect(isItemSelected("a random item")).toBe(true);
    });
  });

  describe("clearSelection", () => {
    describe("when not all items are considered selected", () => {
      test("it should de-select all individually selected items", () => {
        const { selectedItems, clearSelection } = useMultiSelection<string>();
        selectedItems.value = ["an item", "another item"];

        clearSelection();

        expect(selectedItems.value.length).toBe(0);
      });
    });

    describe("when all items are considered selected", () => {
      test("it should consider all items as not selected", () => {
        const { areAllSelected, clearSelection } = useMultiSelection<string>();
        areAllSelected.value = true;

        clearSelection();

        expect(areAllSelected.value).toBe(false);
      });
    });
  });

  describe("toggleAllSelection", () => {
    describe("when all items are considered selected", () => {
      test("it shouldn't consider all items selected any more", () => {
        const { areAllSelected, toggleAllSelection } = useMultiSelection<string>();
        areAllSelected.value = true;

        toggleAllSelection();

        expect(areAllSelected.value).toBe(false);
      });
    });

    describe("when all items are not considered selected", () => {
      describe("when any individual item is selected", () => {
        test("it should de-select all individually selected items", () => {
          const { selectedItems, toggleAllSelection } = useMultiSelection<string>();
          selectedItems.value = ["an item"];

          toggleAllSelection();

          expect(selectedItems.value.length).toBe(0);
        });
      });

      describe("when no individual item is selected", () => {
        test("it should consider all items selected ", () => {
          const { areAllSelected, toggleAllSelection } = useMultiSelection<string>();

          toggleAllSelection();

          expect(areAllSelected.value).toBe(true);
        });
      });
    });
  });
});
