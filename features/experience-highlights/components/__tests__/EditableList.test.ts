import { describe, test, expect } from "vitest";
import { mount, config } from "@vue/test-utils";
import EditableList, { Props } from "../EditableList.vue";
import { GenericHighlight } from "@/types/Highlights";
import ListRow from "../ListRow.vue";
import NovaSortableList from "@/ui-kit/NovaSortableList/NovaSortableList.vue";

config.global.mocks = {
  $t: (s: string) => s,
};

const mockHighlights: GenericHighlight[] = [
  {
    name: "My custom highlight!",
    id: "7103",
    action: "NOOP",
    visualization_order: 0,
    language_code: "en",
    code: "CODE 1",
  },
  {
    name: "Coffee & Pastries",
    id: "3403",
    action: "NOOP",
    visualization_order: 1,
    language_code: "en",
    code: "CODE 2",
  },
];

const props: Props = {
  modelValue: mockHighlights,
  theme: "primary",
  disabled: false,
  editable: false,
};

describe("EditableList", () => {
  test("it renders correctly", () => {
    const wrapper = mount(EditableList, {
      props,
    });

    expect(wrapper).toBeTruthy();
    expect(wrapper.find('[data-testid="highlights-wrapper-custom-list"]').exists()).toBe(true);
    expect(wrapper.findAll('[data-testid="highlights-wrapper-list-row"]').length).toBe(mockHighlights.length);
  });

  test("it renders the rows correctly", () => {
    const wrapper = mount(EditableList, {
      props: {
        ...props,
        modelValue: [
          ...mockHighlights,
          {
            name: "Coffee & Pastries",
            id: "3403",
            action: "REMOVE",
            visualization_order: 2,
            language_code: "en",
            code: "CODE 2",
          },
          {
            name: "Coffee & Pastries",
            id: "3403",
            action: "DELETE",
            visualization_order: 3,
            language_code: "en",
            code: "CODE 2",
          },
        ],
      },
    });

    // it should not render the highlights with REMOVE and DELETE actions
    expect(wrapper.findAll('[data-testid="highlights-wrapper-list-row"]').length).toBe(mockHighlights.length);

    wrapper.findAll('[data-testid="highlights-wrapper-list-row"]').forEach((row, index) => {
      const highlight = mockHighlights[index];
      expect(row.text()).toContain(highlight.visualization_order + 1 + ".");
      expect(row.text()).toContain(highlight.name);
      expect(row.attributes()["data-draggable"]).toBeFalsy();
    });
  });

  test("if reordered it emits correctly", () => {
    const wrapper = mount(EditableList, {
      props,
    });

    wrapper.findComponent(NovaSortableList).vm.$emit("update:modelValue", mockHighlights.reverse());

    // @ts-expect-error ...
    expect(wrapper.emitted()["update:modelValue"][0][0]).toMatchObject([
      {
        name: "Coffee & Pastries",
        id: "3403",
        action: "EDIT",
        visualization_order: 1,
        language_code: "en",
        code: "CODE 2",
      },
      {
        name: "My custom highlight!",
        id: "7103",
        action: "EDIT",
        visualization_order: 2,
        language_code: "en",
        code: "CODE 1",
      },
    ]);
  });

  test("if edited it updates a row correctly", async () => {
    const wrapper = mount(EditableList, {
      props: {
        ...props,
        editable: true,
      },
    });

    wrapper.findComponent(ListRow).vm.$emit("row:update", "new val");
    await nextTick();

    // @ts-expect-error ...
    expect(wrapper.emitted()["update:modelValue"][0][0][0].name).toBe("new val");
  });

  // we have 3 "deletion" cases
  // if the item was only created locally (CREATE)
  // if the item is to be deleted in the BE (DELETE)
  // it the item is to be removed (REMOVE)

  test("if created and then deleted, it shouldn't emit anything", async () => {
    const wrapper = mount(EditableList, {
      props: {
        ...props,
        modelValue: [
          {
            name: "Coffee & Pastries",
            id: "3403",
            action: "CREATE",
            visualization_order: 0,
            language_code: "en",
            code: "CODE 2",
          },
        ],
      },
    });

    wrapper.findComponent(ListRow).vm.$emit("row:delete");
    await nextTick();

    // @ts-expect-error ...
    expect(wrapper.emitted()["update:modelValue"][0][0].length).toBe(0);
  });

  test("it should delete correctly", async () => {
    const wrapper = mount(EditableList, {
      props: {
        ...props,
        modelValue: [
          {
            name: "Coffee & Pastries",
            id: "3403",
            action: "NOOP",
            visualization_order: 0,
            language_code: "en",
            code: "CODE 2",
          },
        ],
      },
    });

    wrapper.findComponent(ListRow).vm.$emit("row:delete");
    await nextTick();

    // @ts-expect-error ...
    expect(wrapper.emitted()["update:modelValue"][0][0][0].action).toBe("DELETE");
  });

  test("it should remove correctly", async () => {
    // @ts-expect-error id should not be undefined
    const wrapper = mount(EditableList, {
      props: {
        ...props,
        modelValue: [
          {
            name: "Coffee & Pastries",
            id: undefined,
            action: "NOOP",
            visualization_order: 0,
            language_code: "en",
            code: "CODE 2",
          },
        ],
      },
    });

    wrapper.findComponent(ListRow).vm.$emit("row:delete");
    await nextTick();

    // @ts-expect-error ...
    expect(wrapper.emitted()["update:modelValue"][0][0][0].action).toBe("REMOVE");
  });
});
