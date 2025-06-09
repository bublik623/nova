import { describe, test, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import NovaInputTime, { Props } from "./NovaInputTime.vue";

const props: Props = {
  id: "test-input",
  modelValue: "12:30:00",
};

const selectors = {
  hoursInput: "[data-testid='test-input-hours-input']",
  minutesInput: "[data-testid='test-input-minutes-input']",
  dropdownItem: "[data-testid^='options-list-list-item-']",
  hoursItem: (num: string) => `#test-input-hours-dropdown-item-${num}`,
  minutesItem: (num: string) => `#test-input-minutes-dropdown-item-${num}`,
};

const elementMock = {
  scrollIntoView: vi.fn(),
};

const getElementSpy = vi.spyOn(document, "getElementById").mockReturnValue(elementMock as any);

describe("NovaInputTime", () => {
  test("it renders correctly", async () => {
    const wrapper = mount(NovaInputTime, { props });

    expect(wrapper).toBeTruthy();
    expect(wrapper.find(selectors.hoursInput).exists()).toBe(true);
    expect((wrapper.find(selectors.hoursInput).element as HTMLInputElement).value).toBe("12");
    expect(wrapper.find(selectors.minutesInput).exists()).toBe(true);
    expect((wrapper.find(selectors.minutesInput).element as HTMLInputElement).value).toBe("30");

    await wrapper.find(selectors.hoursInput).trigger("click");
    expect(wrapper.findAll(selectors.dropdownItem).length).toBe(24);
    await wrapper.find(selectors.hoursInput).trigger("click");

    await wrapper.find(selectors.minutesInput).trigger("click");
    expect(wrapper.findAll(selectors.dropdownItem).length).toBe(60);
  });

  describe("when the user selects a new hour", () => {
    test("it should emit an event", async () => {
      const wrapper = mount(NovaInputTime, { props });

      await wrapper.find(selectors.hoursInput).trigger("click");
      await wrapper.find(selectors.hoursItem("09")).trigger("click");

      const events = wrapper.emitted<Event[]>()["update:modelValue"];
      expect(events[0][0]).toBe("09:30:00");
    });
  });

  describe("when the user selects the minutes", () => {
    test("it should emit an event", async () => {
      const wrapper = mount(NovaInputTime, { props });

      await wrapper.find(selectors.minutesInput).trigger("click");
      await wrapper.find(selectors.minutesItem("50")).trigger("click");

      const events = wrapper.emitted<Event[]>()["update:modelValue"];
      expect(events[0][0]).toBe("12:50:00");
    });
  });

  describe("when the user inputs something", () => {
    test("it should scroll to the closest element", async () => {
      const wrapper = mount(NovaInputTime, { props });

      await wrapper.find(selectors.hoursInput).trigger("click");
      await wrapper.find(selectors.minutesInput).setValue("22");

      expect(getElementSpy).toHaveBeenNthCalledWith(1, "test-input-minutes-dropdown-item-22");
      expect(elementMock.scrollIntoView).toHaveBeenCalledTimes(1);

      await wrapper.find(selectors.minutesInput).setValue("xx");

      expect(getElementSpy).toHaveBeenCalledTimes(1);
      expect(elementMock.scrollIntoView).toHaveBeenCalledTimes(1);
    });
  });

  describe("when the user clicks outside the component", () => {
    test("it should close any open dropdown", async () => {
      const App = defineComponent({
        components: { NovaInputTime },
        setup() {
          return {
            props,
          };
        },
        template: `
          <div>
            <div id="outside">SomeOtherDiv</div>
            <NovaInputTime v-bind="props" />
          </div>
        `,
      });

      const wrapper = mount(App, { attachTo: document.body });

      await wrapper.find(selectors.hoursInput).trigger("click");
      expect(wrapper.find(selectors.hoursItem("00")).isVisible()).toBe(true);
      await wrapper.find("#outside").trigger("click");
      expect(wrapper.find(selectors.hoursItem("00")).exists()).toBe(false);

      await wrapper.find(selectors.minutesInput).trigger("click");
      expect(wrapper.find(selectors.minutesItem("00")).isVisible()).toBe(true);
      await wrapper.find("#outside").trigger("click");
      expect(wrapper.find(selectors.minutesItem("00")).exists()).toBe(false);
    });
  });
});
