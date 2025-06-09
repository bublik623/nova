import { defineComponent } from "vue";
import { mount } from "@vue/test-utils";
import { test, expect, describe, vi, afterEach } from "vitest";
import NovaInputTextSearch, { Props } from "./NovaInputTextSearch.vue";

vi.mock("lodash.debounce", () => ({
  default: (callback: () => void) => callback,
}));

const searchResults = ["result-1", "result-2", "result-3"];
const searchMock = vi.fn(() => Promise.resolve(searchResults));

const props: Props = {
  id: "test-id",
  modelValue: "",
  onSearchUpdate: searchMock,
};

const selectors = {
  textInput: "[data-testid='test-id-input-text']",
  dropdownList: "[data-testid='options-list-list']",
  dropdownItem: "[data-testid^='options-list-list-item-']",
  errorMessage: "span[data-testid='test-id-input-text-error']",
  spinner: "[data-testid='nova-spinner']",
};

describe("NovaInputTextSearch", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("it should mount and render correctly", () => {
    const wrapper = mount(NovaInputTextSearch, { props });

    expect(wrapper).toBeTruthy();
    expect(wrapper.find(selectors.textInput).exists()).toBe(true);
    expect((wrapper.find(selectors.textInput).element as HTMLInputElement).value).toBe(props.modelValue);
    expect(wrapper.find(selectors.dropdownList).exists()).toBe(false);
  });

  describe("when the user inputs some text", () => {
    test("it should open the dropdown", async () => {
      const wrapper = mount(NovaInputTextSearch, { props });

      const input = wrapper.find(selectors.textInput);
      input.setValue("newValue");
      await wrapper.vm.$nextTick();

      expect(wrapper.find(selectors.spinner).isVisible()).toBe(true);
    });

    test("it should call the 'onSearchUpdate' callback", () => {
      const wrapper = mount(NovaInputTextSearch, { props });

      const input = wrapper.find(selectors.textInput);
      input.setValue("newValue");

      expect(searchMock).toHaveBeenCalledWith("newValue");
    });

    describe("if the updated value is an empty string", () => {
      test("it should not open the dropdown", async () => {
        const wrapper = mount(NovaInputTextSearch, { props });

        const input = wrapper.find(selectors.textInput);
        input.setValue("");
        await wrapper.vm.$nextTick();

        expect(wrapper.find(selectors.spinner).exists()).toBe(false);
        expect(wrapper.find(selectors.dropdownList).exists()).toBe(false);
      });
    });

    describe("when there are no search results", () => {
      test("it should close the dropdown", async () => {
        searchMock.mockResolvedValueOnce([]);
        const wrapper = mount(NovaInputTextSearch, { props });

        const input = wrapper.find(selectors.textInput);
        input.setValue("newValue");
        await wrapper.vm.$nextTick();

        expect(wrapper.find(selectors.spinner).isVisible()).toBe(true);

        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();
        expect(wrapper.find(selectors.spinner).exists()).toBe(false);
        expect(wrapper.find(selectors.dropdownList).exists()).toBe(false);
      });
    });
  });

  describe("when the user clicks outside the component", () => {
    test("it should close the dropdown", async () => {
      const App = defineComponent({
        components: { NovaInputTextSearch },
        setup() {
          return {
            props,
          };
        },
        template: `
          <div>
            <div id="outside">SomeOtherDiv</div>
            <NovaInputTextSearch v-bind="props" />
          </div>
        `,
      });

      const wrapper = mount(App, { attachTo: document.body });

      const input = wrapper.find(selectors.textInput);
      input.setValue("newValue");
      await wrapper.vm.$nextTick();

      expect(wrapper.find(selectors.spinner).isVisible()).toBe(true);

      await wrapper.find("#outside").trigger("click");

      expect(wrapper.find(selectors.spinner).exists()).toBe(false);
      expect(wrapper.find(selectors.dropdownList).exists()).toBe(false);
    });
  });

  describe("when the user selects an option", () => {
    test("it should emit an event and close the dropdown", async () => {
      const wrapper = mount(NovaInputTextSearch, { props });

      const input = wrapper.find(selectors.textInput);
      input.setValue("newValue");
      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();

      expect(wrapper.find(selectors.dropdownList).exists()).toBe(true);
      await wrapper.findAll(selectors.dropdownItem)[2].trigger("click");

      const events = wrapper.emitted<Event[]>()["update:modelValue"];
      expect(events[0][0]).toBe(searchResults[2]);

      expect(wrapper.find(selectors.dropdownList).exists()).toBe(false);
    });
  });

  describe("when the placeholder is passed as prop", () => {
    test("it should display it in the input", () => {
      const wrapper = mount(NovaInputTextSearch, {
        props: {
          ...props,
          inputValue: undefined,
          placeholder: "test placeholder",
        },
      });

      expect(wrapper.find(selectors.textInput).attributes().placeholder).toBe("test placeholder");
    });
  });

  describe("when the disabled prop is set to true", () => {
    test("it should disable the input", () => {
      const wrapper = mount(NovaInputTextSearch, {
        props: {
          ...props,
          disabled: true,
        },
      });

      const input = wrapper.find(selectors.textInput);
      input.setValue("newValue");

      expect(wrapper.emitted<Event[]>()["update:inputValue"]).toBeFalsy();
      expect(wrapper.find(selectors.textInput).attributes().disabled).toBe("");
    });
  });

  describe("when an error is passed as prop", () => {
    test("it should render the error message", () => {
      const wrapper = mount(NovaInputTextSearch, {
        props: {
          ...props,
          error: "test error",
        },
      });

      expect(wrapper.find(selectors.errorMessage).exists()).toBe(true);
      expect(wrapper.find(selectors.errorMessage).text()).toBe("test error");
    });
  });
});
