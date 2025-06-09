import { describe, test, expect } from "vitest";
import { mount, config } from "@vue/test-utils";
import AvailabilityCopySettingsModal, { Props } from "../AvailabilityCopySettingsModal.vue";

config.global.mocks = {
  $t: (text: string) => text,
};

const props: Props = {
  show: true,
  disabledDays: [3, 4, 5],
};

const selectors = {
  dayCheckbox: "[data-testid='nova-checkbox-container']",
  selectBtn: "[data-testid='copy-settings-select-all-btn']",
  copyBtn: "[data-testid='copy-settings-copy-btn']",
};

describe("AvailabilityCopySettingsModal", () => {
  test("it should render correctly", () => {
    const wrapper = mount(AvailabilityCopySettingsModal, { props });
    const checkboxes = wrapper.findAll(selectors.dayCheckbox);

    expect(wrapper).toBeTruthy();
    expect(checkboxes.length).toBe(7);
    expect(checkboxes[0].find("input").attributes().disabled).toBe(undefined);
    expect(checkboxes[1].find("input").attributes().disabled).toBe(undefined);
    expect(checkboxes[2].find("input").attributes().disabled).toBe("");
    expect(checkboxes[3].find("input").attributes().disabled).toBe("");
    expect(checkboxes[4].find("input").attributes().disabled).toBe("");
    expect(checkboxes[5].find("input").attributes().disabled).toBe(undefined);
    expect(checkboxes[6].find("input").attributes().disabled).toBe(undefined);
  });

  describe("when the user clicks outside the component", () => {
    test("it should emit an event to close the modal", async () => {
      const App = defineComponent({
        components: { AvailabilityCopySettingsModal },
        setup() {
          return {
            props,
          };
        },
        template: `
          <div>
            <div id="outside">SomeOtherDiv</div>
            <AvailabilityCopySettingsModal v-bind="props" @close="$emit('close')" />
          </div>
        `,
      });

      const wrapper = mount(App, { attachTo: document.body });

      await wrapper.find("#outside").trigger("click");
      const events = wrapper.emitted<Event[]>()["close"];
      expect(events).toBeTruthy();
    });
  });

  describe("when the user selects some days and clicks on copy btn", () => {
    test("it should emit an event", async () => {
      const wrapper = mount(AvailabilityCopySettingsModal, { props });

      const checkboxes = wrapper.findAll(selectors.dayCheckbox);
      await checkboxes[0].find("input").trigger("click");
      await checkboxes[6].find("input").trigger("click");
      await wrapper.find(selectors.copyBtn).trigger("click");

      const events = wrapper.emitted<Event[]>()["click:copy"];
      expect(events).toBeTruthy();
      expect(events[0][0]).toStrictEqual([1, 7]);
    });
  });

  describe("when the clicks on 'select all' and then clicks on copy btn", () => {
    test("it should emit an event", async () => {
      const wrapper = mount(AvailabilityCopySettingsModal, { props });

      await wrapper.find(selectors.selectBtn).trigger("click");
      await wrapper.find(selectors.copyBtn).trigger("click");

      const events = wrapper.emitted<Event[]>()["click:copy"];
      expect(events).toBeTruthy();
      expect(events[0][0]).toStrictEqual([1, 2, 6, 7]);
    });
  });
});
