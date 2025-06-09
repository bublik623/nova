import { describe, test, expect } from "vitest";
import { mount, config } from "@vue/test-utils";
import ViewSelect, { Props } from "../ViewSelect.vue";
import { startsWithTestId } from "@/utils/test.utils";

config.global.mocks = {
  $t: (text: string) => text,
};

const props: Props = {
  modelValue: "all",
};

const selectors = {
  toggle: '[data-testid="view-select-button"]',
  dropdown: '[data-testid="options-list-list"]',
  option: startsWithTestId("options-list-list-item"),
};

describe("ViewSelect", () => {
  test("it should render correctly", () => {
    const wrapper = mount(ViewSelect, { props });

    expect(wrapper).toBeTruthy();
    expect(wrapper.find(selectors.dropdown).exists()).toBe(false);
    expect(wrapper.find(selectors.toggle).text()).toBe("experience.curation.view-type.all");
  });

  describe("when the user selects a view type", () => {
    test("it should emit an event", async () => {
      const wrapper = mount(ViewSelect, { props });

      await wrapper.find(selectors.toggle).trigger("click");
      expect(wrapper.find(selectors.dropdown).isVisible()).toBe(true);

      const options = wrapper.findAll(selectors.option);
      expect(options.length).toBe(2);

      await options[1].trigger("click");

      const events = wrapper.emitted<Event[]>()["update:modelValue"];
      expect(events).toBeTruthy();
      expect(events[0][0]).toBe("commercial");
    });
  });

  describe("when the user clicks outside the component", () => {
    test("it should close the dropdown", async () => {
      const App = defineComponent({
        components: { ViewSelect },
        setup() {
          return {
            props,
          };
        },
        template: `
          <div>
            <div id="outside">SomeOtherDiv</div>
            <ViewSelect v-bind="props" />
          </div>
        `,
      });

      const wrapper = mount(App, { attachTo: document.body });

      await wrapper.find(selectors.toggle).trigger("click");
      expect(wrapper.find(selectors.dropdown).isVisible()).toBe(true);

      await wrapper.find("#outside").trigger("click");
      expect(wrapper.find(selectors.dropdown).exists()).toBe(false);
    });
  });
});
