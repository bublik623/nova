import { describe, test, expect } from "vitest";
import { mount } from "@vue/test-utils";
import NovaSortableList, { Props } from "./NovaSortableList.vue";

const props: Props = {
  modelValue: [
    { id: "item-1", visualization_order: 1, name: "item-1" },
    { id: "item-2", visualization_order: 2, name: "item-2" },
    { id: "item-3", visualization_order: 3, name: "item-3" },
    { id: "item-4", visualization_order: 4, name: "item-4" },
  ],
  layout: "list",
};

const selectors = {
  list: "[data-testid='nova-sortable-list']",
  listItem: "[data-testid='nova-sortable-list-item']",
  dragHandle: "[data-testid='nova-sortable-list-drag-handle']",
};

describe("NovaSortableList", () => {
  test("it should render correctly", () => {
    const wrapper = mount(NovaSortableList, { props });

    expect(wrapper).toBeTruthy();
    expect(wrapper.findAll(selectors.listItem).length).toBe(props.modelValue.length);
  });

  describe("when the layout is set to grid", () => {
    test("it should set the grid style", () => {
      const wrapper = mount(NovaSortableList, {
        props: { ...props, layout: "grid" },
      });

      expect(wrapper.find(selectors.list).classes()).toContain("NovaSortableList--grid");
    });
  });

  describe("when the layout is set to list", () => {
    test("it should set the list style", () => {
      const wrapper = mount(NovaSortableList, {
        props: { ...props, layout: "list" },
      });

      expect(wrapper.find(selectors.list).classes()).toContain("NovaSortableList--list");
    });
  });

  describe("when the component is disabled", () => {
    test("the drag handle should not appear", () => {
      const wrapper = mount(NovaSortableList, {
        props: { ...props, layout: "list", disabled: true },
      });

      expect(wrapper.findAll(selectors.dragHandle).length).toBe(0);
    });
  });

  describe("when the sorting changes", () => {
    test("it should emit en event with the updated list", () => {
      const wrapper = mount(NovaSortableList, { props });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (wrapper.vm as any).updateListSorting(0, 2);

      const events = wrapper.emitted<Event[]>()["update:modelValue"];
      expect(events[0][0]).toStrictEqual([
        { ...props.modelValue[1], visualization_order: 1 },
        { ...props.modelValue[2], visualization_order: 2 },
        { ...props.modelValue[0], visualization_order: 3 },
        { ...props.modelValue[3], visualization_order: 4 },
      ]);
    });
  });
});
