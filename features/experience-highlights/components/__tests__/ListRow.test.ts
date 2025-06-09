import { GenericHighlight } from "@/types/Highlights";
import { config, mount } from "@vue/test-utils";
import { describe, test, expect } from "vitest";
import ListRow, { Props } from "../ListRow.vue";

config.global.mocks = {
  $t: (text: string) => text,
};

const mockHighlight: GenericHighlight = {
  name: "My custom highlight!",
  id: "7103",
  action: "NOOP",
  visualization_order: 0,
  language_code: "en",
  code: "CODE 1",
};

const selectors = {
  index: ".HighlightManagerRow__index",
  text: ".HighlightManagerRow__text",
  delete: ".HighlightManagerRow__delete",
  edit: ".HighlightManagerRow__edit",
  save: ".HighlightManagerRow__save",
  gripHandle: '[data-testid="nova-sortable-list-drag-handle"]',
  textarea: '[data-testid="newValue-input-text"]',
};

const props: Props = {
  highlight: mockHighlight,
  index: 15,
  theme: "primary",
};

describe("ListRow should render correctly", () => {
  test("it renders an highlight correctly", () => {
    // @ts-expect-error ...
    const wrapper = mount(ListRow, { props });

    expect(wrapper.find(selectors.index).text()).toBe("15.");
    expect(wrapper.find(selectors.text).text()).toBe(mockHighlight.name);
    expect(wrapper.find(selectors.gripHandle).isVisible()).toBe(true);
    expect(wrapper.find(selectors.delete).isVisible()).toBe(true);
  });

  test("if disabled, it renders correctly", () => {
    // @ts-expect-error ...
    const wrapper = mount(ListRow, { props: { ...props, disabled: true } });

    expect(wrapper.find(selectors.index).text()).toBe("15.");
    expect(wrapper.find(selectors.text).text()).toBe(mockHighlight.name);
    expect(wrapper.find(selectors.gripHandle).exists()).toBe(false);
    expect(wrapper.find(selectors.delete).exists()).toBe(false);
  });

  test("if editable, it renders correctly", () => {
    // @ts-expect-error ...
    const wrapper = mount(ListRow, { props: { ...props, editable: true } });

    expect(wrapper.find(selectors.index).text()).toBe("15.");
    expect(wrapper.find(selectors.text).text()).toBe(mockHighlight.name);
    expect(wrapper.find(selectors.gripHandle).isVisible()).toBe(true);
    expect(wrapper.find(selectors.delete).isVisible()).toBe(true);
    expect(wrapper.find(selectors.edit).isVisible()).toBe(true);
  });
});

describe("ListRow behaves correctly", () => {
  test("it can be edited", async () => {
    // @ts-expect-error ...
    const wrapper = mount(ListRow, { props: { ...props, editable: true } });

    const textarea = () => wrapper.find<HTMLTextAreaElement>(selectors.textarea);

    expect(textarea().exists()).toBe(false);
    await wrapper.find(selectors.edit).trigger("click");

    expect(textarea().isVisible()).toBe(true);
    expect(wrapper.emitted()["row:is-editing"]).toBeTruthy();

    await textarea().setValue("My updated name!");
    await wrapper.find(selectors.save).trigger("click");
    //@ts-expect-error ...
    expect(wrapper.emitted()["row:update"][0][0]).toBe("My updated name!");
  });

  test("it can be deleted", async () => {
    // @ts-expect-error ...
    const wrapper = mount(ListRow, { props: { ...props, editable: true } });

    await wrapper.find(selectors.delete).trigger("click");
    expect(wrapper.emitted()["row:delete"]).toBeTruthy();
  });
});

describe("ListRow diffing behavior", () => {
  test("it adds 'added' class when added items are present", () => {
    const wrapper = mount(ListRow, { props: { ...props, addedItems: [mockHighlight] } });

    expect(wrapper.find(selectors.text).classes()).toContain("added");
  });

  test("it adds 'removed' class when removed items are present", () => {
    const wrapper = mount(ListRow, { props: { ...props, removedItems: [mockHighlight] } });

    expect(wrapper.find(selectors.text).classes()).toContain("removed");
  });
});
