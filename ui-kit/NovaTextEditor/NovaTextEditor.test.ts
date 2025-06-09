import { config, mount } from "@vue/test-utils";
import { test, expect, describe, vi } from "vitest";
import NovaTextEditor, { NovaTextEditorProps } from "./NovaTextEditor.vue";
import { testId } from "@/utils/test.utils";

config.global.mocks = {
  $t: (text: string) => text,
};

vi.stubGlobal("useNuxtApp", () => ({
  $t: (s: string) => s,
}));

const props = {
  modelValue: "Lorem ipsum",
  maxLength: 250,
} satisfies NovaTextEditorProps;

const selectors = {
  novaEditor: "[data-testid='nova-text-editor']",
  tipTapEditor: ".ProseMirror, .NovaTextEditor__content",
  buttons: "[data-testid='nova-text-editor-buttons']",
  buttonBold: "[data-testid='nova-text-editor-buttons-bold']",
  buttonItalic: "[data-testid='nova-text-editor-buttons-italic']",
  buttonUnderline: "[data-testid='nova-text-editor-buttons-underline']",
  buttonOrderedList: "[data-testid='nova-text-editor-buttons-ordered-list']",
  buttonUnorderedList: "[data-testid='nova-text-editor-buttons-unordered-list']",
  charCount: "[data-testid='nova-text-editor-characters']",
} as const;

describe("NovaTextEditor", () => {
  test("it should mount and render correctly", async () => {
    expect(NovaTextEditor).toBeTruthy();

    const wrapper = mount(NovaTextEditor, { props });
    await vi.dynamicImportSettled();

    Object.keys(selectors).forEach((selector) => {
      // @ts-expect-error complains about indexing by string...
      const element = wrapper.find(selectors[selector]);
      expect(element.exists()).toBe(true);
    });

    expect(wrapper.html()).toContain("Lorem ipsum");
  });

  test("it should display the character count and word count correctly", async () => {
    const wrapper = mount(NovaTextEditor, { props });
    await vi.dynamicImportSettled();

    // 11 is the passed prop + the p tags,
    // 250 is the max length passed
    expect(wrapper.find(selectors.charCount).text()).toBe("Words: 2 Characters: 11/250");
  });

  test("it should be correctly disabled", () => {
    const wrapper = mount(NovaTextEditor, {
      props: {
        ...props,
        disabled: true,
      },
    });

    const novaEditor = wrapper.find(selectors.novaEditor);

    expect(novaEditor.attributes().disabled).toBe("true");
  });

  test("it should correctly error", () => {
    const wrapper = mount(NovaTextEditor, {
      props: {
        ...props,
        hasError: true,
      },
    });

    const novaEditor = wrapper.find(selectors.novaEditor);

    expect(novaEditor.attributes().theme).toBe("error");
  });

  test("it should show the loading state", () => {
    const wrapper = mount(NovaTextEditor, {
      props: {
        ...props,
        loading: true,
      },
    });

    const novaEditor = wrapper.find(selectors.novaEditor);

    expect(novaEditor.attributes().loading).toBe("true");
  });

  describe("when the editor value is updated", () => {
    test("it should emit an event", () => {
      const wrapper = mount(NovaTextEditor, { props });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (wrapper.vm as any).handleUpdate();

      const events = wrapper.emitted<Event[]>()["update:modelValue"];
      expect(events).toBeTruthy();
      expect(events[0][0]).toStrictEqual("<p>Lorem ipsum</p>");
    });
  });

  describe("if is readonly", () => {
    test("if the text length is < maxLengthReadonly it should show all the text", () => {
      const wrapper = mount(NovaTextEditor, { props: { ...props, readonly: true, maxLengthReadonly: 15 } });
      expect(wrapper.find(".NovaTextEditorReadonly").text()).toBe(props.modelValue);
    });

    test("if the text length is > maxLengthReadonly it should show text collapsed", async () => {
      const wrapper = mount(NovaTextEditor, { props: { ...props, readonly: true, maxLengthReadonly: 3 } });
      expect(wrapper.find(".NovaTextEditorReadonly").text()).include(`${props.modelValue.substring(0, 3)} ...`);

      // check if i click on the expand button i see all the text
      const button = wrapper.find(testId("nova-text-editor-readonly-collapse-button"));
      expect(button.text()).toBe("common.read-more");

      await button.trigger("click");
      expect(wrapper.find(".NovaTextEditorReadonly").text()).include(props.modelValue);
      expect(button.text()).toBe("common.read-less");
    });

    test("if the text is empty it should show the no content util component", () => {
      const wrapper = mount(NovaTextEditor, { props: { modelValue: "", readonly: true, maxLengthReadonly: 3 } });
      expect(wrapper.findComponent({ name: "NoContentUtil" }).isVisible()).toBeTruthy();
    });

    test("it should render the slot content", () => {
      const wrapper = mount(NovaTextEditor, {
        props: { ...props, readonly: true },
        slots: {
          default: "Main Content",
        },
      });
      expect(wrapper.find(".NovaTextEditorReadonly").text()).toContain("Main Content");
    });
  });
});
