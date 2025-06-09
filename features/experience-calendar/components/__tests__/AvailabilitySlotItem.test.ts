import { config, mount, shallowMount } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";
import AvailabilitySlotItem, { Props } from "../AvailabilitySlotItem.vue";
import { testId } from "@/utils/test.utils";

config.global.mocks = {
  $t: (text: string) => text,
};

vi.stubGlobal("useNuxtApp", () => ({
  $t: (text: string) => text,
}));

const masterDataMock = {
  availableLanguages: ["en"],
};

vi.mock("@/stores/master-data", () => ({
  useMasterData: () => masterDataMock,
}));

const props: Props = {
  id: "fake-id",
  pricingList: [],
  showTitles: true,
  disabled: false,
  modelValue: {
    time: undefined,
    pricings: [],
    languages: [],
    capacity: undefined,
  },
  optionData: {
    id: "id",
    experience: "experience",
    name: "Test option",
    capacity_type: "shared",
    multilanguage: true,
  },
  showTime: true,
  actions: {
    duplicate: { show: true },
    clear: { show: true },
    delete: { show: true, disabled: false },
  },
};
const selector = {
  timeslotHour: testId("fake-id-slot-item-time-hours-input"),
  timeslotMinutes: testId("fake-id-slot-item-time-minutes-input"),
  pricingDropdown: testId("pricing-dropdown-toggle"),
  languagesDropdown: testId("pricing-dropdown-toggle"),
  capacity: testId("fake-id-slot-item-capacity-input-number"),
  duplicateIcon: testId("slot-item-duplicate"),
  clearIcon: testId("slot-item-clear"),
  deleteIcon: testId("slot-item-delete"),
  duplicateButton: testId("slot-item-duplicate-button"),
};
describe("AvailabilitySlotItem", () => {
  test("it should render properly", () => {
    const wrapper = mount(AvailabilitySlotItem, { props });
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find(selector.timeslotHour).isVisible()).toBe(true);
    expect(wrapper.find(selector.timeslotMinutes).isVisible()).toBe(true);
    expect(wrapper.find(selector.pricingDropdown).isVisible()).toBe(true);
    expect(wrapper.find(selector.languagesDropdown).isVisible()).toBe(true);
    expect(wrapper.find(selector.capacity).isVisible()).toBe(true);

    expect(wrapper.find(selector.clearIcon).exists()).toBe(true);
    expect(wrapper.find(selector.duplicateIcon).exists()).toBe(true);
    expect(wrapper.find(selector.deleteIcon).exists()).toBe(true);
  });

  test("check all the fields props", async () => {
    const wrapper = shallowMount(AvailabilitySlotItem, {
      props,
    });

    await wrapper.setProps({
      ...props,
      optionData: {
        ...props.optionData,
        capacity_type: "pax",
      },
    });

    expect(wrapper.find(selector.timeslotHour).exists()).toBe(false);
    expect(wrapper.find(selector.timeslotMinutes).exists()).toBe(false);
    expect(wrapper.find("pricing-dropdown-stub").attributes().limitedcapacity).toBe("true");
    expect(wrapper.find("languages-dropdown-stub").attributes().limitedcapacity).toBe("false");
    expect(wrapper.find(selector.capacity).exists()).toBe(false);

    // if we the timeslot is not showed we should not have the duplicate btn
    expect(wrapper.find(selector.clearIcon).exists()).toBeTruthy();
    expect(wrapper.find(selector.deleteIcon).exists()).toBeTruthy();
    expect(wrapper.find(selector.duplicateIcon).exists()).toBeFalsy();

    await wrapper.setProps({
      ...props,
      optionData: {
        ...props.optionData,
        multilanguage: false,
        capacity_type: "unlimited",
      },
    });

    expect(wrapper.find(selector.languagesDropdown).exists()).toBe(false);

    expect(wrapper.find("pricing-dropdown-stub").attributes().limitedcapacity).toBe("false");
    expect(wrapper.find(selector.capacity).exists()).toBe(false);
  });

  test("check all the actions props", async () => {
    const wrapper = mount(AvailabilitySlotItem, { props });

    await wrapper.setProps({
      ...props,
      actions: {
        ...props.actions,
        duplicate: { disabled: true },
        clear: { show: false },
        delete: { show: true, disabled: true },
      },
    });

    expect(wrapper.find(selector.clearIcon).exists()).toBeFalsy();
    expect(wrapper.find(selector.duplicateIcon).exists()).toBe(true);
    expect(wrapper.find(selector.deleteIcon).exists()).toBe(true);

    expect(wrapper.find(selector.duplicateIcon).attributes().disabled).not.toBe(undefined);
    expect(wrapper.find(selector.deleteIcon).attributes().disabled).not.toBe(undefined);

    await wrapper.setProps({
      ...props,
      actions: {
        ...props.actions,
        duplicate: { disabled: true },
        clear: { show: false },
        delete: { show: false },
      },
    });

    expect(wrapper.find(selector.clearIcon).exists()).toBeFalsy();
    expect(wrapper.find(selector.deleteIcon).exists()).toBeFalsy();
  });

  describe("clear button", () => {
    test("is enabled only when one field is filled", async () => {
      const wrapper = mount(AvailabilitySlotItem, { props });
      expect(wrapper.find(selector.clearIcon).attributes().disabled).not.toBe(undefined);
      await wrapper.find(selector.timeslotHour).trigger("click");
      await wrapper.find("#fake-id-slot-item-time-hours-dropdown-item-09").trigger("click");
      expect(wrapper.find(selector.clearIcon).attributes().disabled).toBe(undefined);
    });
  });

  describe("duplicate button", () => {
    test("if the fields are empty it should not be enabled", () => {
      const wrapper = mount(AvailabilitySlotItem, { props });
      expect(wrapper.find(selector.duplicateIcon).attributes().disabled).not.toBe(undefined);
    });

    test("if you click on the button it should open the modal", async () => {
      const wrapper = mount(AvailabilitySlotItem, { props });
      await wrapper.setProps({
        ...props,
        modelValue: {
          time: "03:10:00",
          pricings: [{}],
          languages: [{ language: "en" }],
          capacity: 10,
        },
      });
      await wrapper.find(selector.duplicateIcon).trigger("click");
      expect(wrapper.find(testId("duplicate-modal-fake-id")).isVisible()).toBe(true);

      // if is possible to duplicate it should enable the duplicate button
      await wrapper
        .find(testId("duplicate-modal-fake-id"))
        .find(testId("fake-id-slot-item-duplicate-every-input-number"))
        .setValue(1);
      await wrapper
        .find(testId("duplicate-modal-fake-id"))
        .find(testId("fake-id-slot-item-duplicate-hour-input-number"))
        .setValue(3);
      await wrapper
        .find(testId("duplicate-modal-fake-id"))
        .find(testId("fake-id-slot-item-duplicate-minutes-input-number"))
        .setValue(11);

      expect(
        wrapper.find(testId("duplicate-modal-fake-id")).find(selector.duplicateButton).attributes().disabled
      ).not.toBe(undefined);

      await wrapper
        .find(testId("duplicate-modal-fake-id"))
        .find(testId("fake-id-slot-item-duplicate-hour-input-number"))
        .setValue(5);

      expect(wrapper.find(testId("duplicate-modal-fake-id")).find(selector.duplicateButton).attributes().disabled).toBe(
        undefined
      );

      await wrapper.find(testId("duplicate-modal-fake-id")).find(selector.duplicateButton).trigger("click");

      const events = wrapper.emitted<Event[]>()["click:duplicate"];
      expect(events).toBeTruthy();
      expect(events.length).toBe(1);
    });
  });

  test("if you click on delete button it should emit an event", async () => {
    const wrapper = mount(AvailabilitySlotItem, { props });

    await wrapper.find(selector.deleteIcon).trigger("click");

    const events = wrapper.emitted<Event[]>()["click:delete"];
    expect(events).toBeTruthy();
    expect(events.length).toBe(1);
  });

  describe("when it has some validation errors", () => {
    test("it should display them", () => {
      const wrapper = mount(AvailabilitySlotItem, {
        props: {
          ...props,
          validationErrors: {
            time: { _errors: ["custom error"] },
            pricings: { _errors: ["custom error"] },
            languages: { _errors: ["custom error"] },
            capacity: { _errors: ["custom error"] },
          },
        },
      });

      expect(wrapper.find(selector.pricingDropdown).attributes().invalid).toBe("true");
      expect(wrapper.find(selector.languagesDropdown).attributes().invalid).toBe("true");
      expect(wrapper.find(selector.capacity).attributes()["data-invalid"]).toBe("true");
    });
  });
});
