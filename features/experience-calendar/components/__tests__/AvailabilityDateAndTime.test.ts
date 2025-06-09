import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { mount, config } from "@vue/test-utils";
import AvailabilityDateAndTime, { Props } from "../AvailabilityDateAndTime.vue";
import { mockUseRuntimeConfig } from "@/__mocks__/useRuntimeConfig";

vi.stubGlobal("useRoute", () => ({ params: { optionId: "option-id" } }));
vi.stubGlobal("useNuxtApp", () => ({
  $t: (text: string) => text,
}));
vi.stubGlobal("useRuntimeConfig", mockUseRuntimeConfig);
config.global.mocks = {
  $t: (text: string) => text,
};

const selectors = {
  title: '[data-testid="nova-collapse-title"]',
  nameInput: '[data-testid="availability_name-input-text"]',
  dateInput: '[data-testid="availability_dates-input-date-input"]',
  dateBtn: "[data-testid='date-card']",
  scheduleDay: '[data-testid="schedule-day"]',
  scheduleDayCard: '[data-testid="availability-day-card"]',
  scheduleDayTimeslot: '[data-testid="time-slot-item"]',
  addTimeslotBtn: '[data-testid="add-time-slot"]',
  pricingGroup: "[data-testid='pricing-group']",
  pricingDropdown: "[data-testid='pricing-dropdown-toggle']",
  deleteTimeslotBtn: '[data-testid="slot-item-delete"]',
  deleteAvailabilityBtn: '[data-testid="delete-availability"]',
  clearAvailabilityBtn: '[data-testid="clear-availability"]',
  modalConfirmBtn: '[data-testid="modal-save-btn"]',
  copySettingsBtn: '[data-testid="copy-settings-btn"]',
  copySettingsSelectBtn: "[data-testid='copy-settings-select-all-btn']",
  copySettingsCopyBtn: "[data-testid='copy-settings-copy-btn']",
};

const props: Props = {
  isOpen: true,
  availability: {
    id: "2abcdc49-7513-41ce-88b9-cd004822b495",
    option: "82386bf9-5260-47cc-b3ab-25c7b573dcf0",
    name: "Test availability",
    pricing_type_allowed: "person",
    date_range: { from: "2050-01-25", to: "2050-01-29" },
    days: {},
  },
  pricingData: [
    {
      id: "919e66f1-96ff-4778-a3e4-682a53dff3fd",
      name: "Expensive summer",
      holder: "Adult",
      age_range: { from: 18, to: 99 },
      option: "82386bf9-5260-47cc-b3ab-25c7b573dcf0",
      tiers: [
        {
          from: 1,
          to: 10,
          retail_price: 100.0,
          commission: 23,
          net_price: 77.0,
        },
      ],
    },
    {
      id: "7462a7d7-90d9-4ddd-828a-203600143b63",
      name: "Different pricing",
      holder: "Adult",
      age_range: { from: 18, to: 99 },
      option: "82386bf9-5260-47cc-b3ab-25c7b573dcf0",
      tiers: [
        {
          from: 1,
          to: 10,
          retail_price: 100.0,
          commission: 23,
          net_price: 77.0,
        },
      ],
    },
  ],
  optionData: {
    id: "82386bf9-5260-47cc-b3ab-25c7b573dcf0",
    name: "New option",
    duration: "P0Y0M1DT0H0M0S",
    multilanguage: false,
    capacity_type: "unlimited",
    status: "DRAFT",
    experience: "c300cc72-983d-4da8-a2ed-5d1f9d10354c",
  },
  deleteCallback: vi.fn(() => Promise.resolve()),
};

describe("AvailabilityDateAndTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("it should render correctly", () => {
    const wrapper = mount(AvailabilityDateAndTime, { props });

    expect(wrapper).toBeTruthy();
    expect(wrapper.find(selectors.title).text()).toBe(props.availability.name);
    expect((wrapper.find(selectors.nameInput).element as HTMLInputElement).value).toBe(props.availability.name);
    expect(wrapper.findAll(selectors.dateInput)[0].text()).toContain("25/01/2050");
    expect(wrapper.findAll(selectors.dateInput)[1].text()).toContain("29/01/2050");
    expect(wrapper.find(selectors.scheduleDay).exists()).toBe(true);
  });

  describe("when one of the field is changed", () => {
    test("it should emit an event", async () => {
      const wrapper = mount(AvailabilityDateAndTime, { props });

      await wrapper.find(selectors.nameInput).setValue("New Title");
      vi.runAllTimers();

      const events = wrapper.emitted<Event[]>()["update:availability"];
      expect(events).toBeTruthy();
      expect(events[0][0]).toStrictEqual({
        value: { ...props.availability, name: "New Title" },
        valid: false,
      });
    });
  });

  describe("when the date range is changed", () => {
    test("it should reset the day schedule", async () => {
      const wrapper = mount(AvailabilityDateAndTime, { props });

      await wrapper.find(selectors.dateInput).trigger("click");

      const dates = wrapper.findAll(selectors.dateBtn);
      await dates[3].trigger("click");
      await dates[6].trigger("click");

      expect(wrapper.findAll(selectors.scheduleDayCard).length).toBe(4);
      expect(wrapper.findAll(selectors.scheduleDayTimeslot).length).toBe(4);
    });
  });

  describe("when one of the days is selected", () => {
    test("it should add the schedule day card", async () => {
      const wrapper = mount(AvailabilityDateAndTime, { props });

      expect(wrapper.findAll(selectors.scheduleDayCard).length).toBe(0);

      await wrapper.findAll(selectors.scheduleDay)[4].get("input").trigger("click");

      expect(wrapper.findAll(selectors.scheduleDayCard).length).toBe(1);
    });
  });

  describe("when the user clicks on add timeslot", () => {
    test("it should add a timeslot to the day card", async () => {
      const wrapper = mount(AvailabilityDateAndTime, { props });

      expect(wrapper.findAll(selectors.scheduleDayCard).length).toBe(0);

      await wrapper.findAll(selectors.scheduleDay)[3].get("input").trigger("click");
      await wrapper.findAll(selectors.scheduleDay)[4].get("input").trigger("click");

      expect(wrapper.findAll(selectors.scheduleDayCard).length).toBe(2);
      expect(wrapper.findAll(selectors.scheduleDayTimeslot).length).toBe(2);

      await wrapper.findAll(selectors.addTimeslotBtn)[0].trigger("click");
      expect(wrapper.findAll(selectors.scheduleDayCard).length).toBe(2);
      expect(wrapper.findAll(selectors.scheduleDayTimeslot).length).toBe(3);
    });
  });

  describe("when the user clicks on delete timeslot", () => {
    test("it should remove the timeslot from the day card", async () => {
      const newProps: Props = {
        ...props,
        availability: {
          ...props.availability,
          days: {
            "2": [
              {
                pricings: [
                  {
                    pricing: "919e66f1-96ff-4778-a3e4-682a53dff3fd",
                  },
                ],
              },
              {
                pricings: [
                  {
                    pricing: "919e66f1-96ff-4778-a3e4-635a53dff3fd",
                  },
                ],
              },
              {
                pricings: [
                  {
                    pricing: "919e66f1-96ff-4778-a3e4-682a53dgf3fd",
                  },
                ],
              },
            ],
          },
        },
      };
      const wrapper = mount(AvailabilityDateAndTime, { props: newProps });
      await wrapper.vm.$nextTick();

      expect(wrapper.findAll(selectors.scheduleDayTimeslot).length).toBe(3);

      wrapper.findAll(selectors.deleteTimeslotBtn)[1].trigger("click");
      await wrapper.vm.$nextTick();
      await wrapper.find(selectors.modalConfirmBtn).trigger("click");

      expect(wrapper.findAll(selectors.scheduleDayTimeslot).length).toBe(2);
    });
  });

  describe("when one of the days is deselected", () => {
    test("it should remove the schedule day card", async () => {
      const newProps: Props = {
        ...props,
        availability: {
          ...props.availability,
          days: {
            "1": [
              {
                languages: [],
                pricings: [
                  {
                    pricing: "919e66f1-96ff-4778-a3e4-682a53dff3fd",
                  },
                ],
              },
            ],
            "2": [
              {
                languages: [],
                pricings: [
                  {
                    pricing: "919e66f1-96ff-4778-a3e4-682a53dff3fd",
                  },
                ],
              },
            ],
            "3": [
              {
                languages: [],
                pricings: [
                  {
                    pricing: "919e66f1-96ff-4778-a3e4-682a53dff3fd",
                  },
                ],
              },
            ],
          },
        },
      };
      const wrapper = mount(AvailabilityDateAndTime, { props: newProps });

      expect(wrapper.findAll(selectors.scheduleDayCard).length).toBe(3);

      await wrapper.findAll(selectors.scheduleDay)[0].get("input").trigger("click");

      expect(wrapper.findAll(selectors.scheduleDayCard).length).toBe(2);
    });
  });

  describe("when the user clicks on the delete button", () => {
    test("it should call the delete callback", async () => {
      const wrapper = mount(AvailabilityDateAndTime, { props });

      wrapper.find(selectors.deleteAvailabilityBtn).trigger("click");
      await wrapper.vm.$nextTick();
      await wrapper.find(selectors.modalConfirmBtn).trigger("click");

      expect(props.deleteCallback).toHaveBeenCalled();
    });
  });

  describe("when the user clicks on the clear button", () => {
    test("it should emit an event resetting the availability", async () => {
      const wrapper = mount(AvailabilityDateAndTime, { props });

      await wrapper.find(selectors.clearAvailabilityBtn).trigger("click");
      vi.runAllTimers();

      const events = wrapper.emitted<Event[]>()["update:availability"];
      expect(events).toBeTruthy();
      expect(events[0][0]).toStrictEqual({
        value: {
          id: "",
          name: "",
          option: "option-id",
          pricing_type_allowed: "person",
          date_range: { from: undefined, to: undefined },
          days: {},
        },
        valid: false,
      });
    });
  });

  describe("when the user clicks on 'copy settings'", () => {
    const availability: Props["availability"] = {
      ...props.availability,
      days: {
        "2": [
          {
            time: "12:30:00",
            languages: [],
            pricings: [
              {
                pricing: "919e66f1-96ff-4778-a3e4-682a53dff3fd",
              },
            ],
          },
        ],
        "3": [
          {
            languages: [],
            pricings: [
              {
                pricing: "7462a7d7-90d9-4ddd-828a-203600143b63",
              },
            ],
          },
        ],
        "4": [
          {
            languages: [],
            pricings: [
              {
                pricing: "7462a7d7-90d9-4ddd-828a-203600143b63",
              },
            ],
          },
        ],
      },
    };

    test("it should update the other day cards", async () => {
      const wrapper = mount(AvailabilityDateAndTime, {
        props: {
          ...props,
          availability,
        },
      });
      let pricingDropdown = wrapper.findAll(selectors.pricingDropdown);
      expect(pricingDropdown[0].text()).toContain("Expensive summer");
      expect(pricingDropdown[1].text()).toContain("Different pricing");
      expect(pricingDropdown[2].text()).toContain("Different pricing");

      expect(wrapper.findAll(selectors.scheduleDayCard).length).toBe(3);
      await wrapper.findAll(selectors.copySettingsBtn)[0].trigger("click");
      await wrapper.find(selectors.copySettingsSelectBtn).trigger("click");
      await wrapper.find(selectors.copySettingsCopyBtn).trigger("click");

      pricingDropdown = wrapper.findAll(selectors.pricingDropdown);
      expect(pricingDropdown[0].text()).toContain("Expensive summer");
      expect(pricingDropdown[1].text()).toContain("Expensive summer");
      expect(pricingDropdown[2].text()).toContain("Expensive summer");
    });

    test("it should emit an event", async () => {
      const wrapper = mount(AvailabilityDateAndTime, {
        props: {
          ...props,
          availability,
        },
      });
      await wrapper.findAll(selectors.copySettingsBtn)[0].trigger("click");
      await wrapper.find(selectors.copySettingsSelectBtn).trigger("click");
      await wrapper.find(selectors.copySettingsCopyBtn).trigger("click");
      vi.runAllTimers();

      const events = wrapper.emitted<Event[]>()["update:availability"];
      expect(events).toBeTruthy();
      expect(events[0][0]).toStrictEqual({
        value: {
          id: "2abcdc49-7513-41ce-88b9-cd004822b495",
          name: "Test availability",
          option: "82386bf9-5260-47cc-b3ab-25c7b573dcf0",
          pricing_type_allowed: "person",
          date_range: { from: "2050-01-25", to: "2050-01-29" },
          days: {
            "2": [
              {
                time: "12:30:00",
                languages: [],
                pricings: [
                  {
                    pricing: "919e66f1-96ff-4778-a3e4-682a53dff3fd",
                  },
                ],
              },
            ],
            "3": [
              {
                languages: [],
                time: "12:30:00",
                pricings: [
                  {
                    pricing: "919e66f1-96ff-4778-a3e4-682a53dff3fd",
                  },
                ],
              },
            ],
            "4": [
              {
                languages: [],
                time: "12:30:00",
                pricings: [
                  {
                    pricing: "919e66f1-96ff-4778-a3e4-682a53dff3fd",
                  },
                ],
              },
            ],
          },
        },
        valid: true,
      });
    });
  });

  describe("if the type is group", () => {
    test("it should show the alert", () => {
      const wrapper = mount(AvailabilityDateAndTime, {
        props: {
          ...props,
          availability: { ...props.availability, pricing_type_allowed: "group" },
        },
      });

      expect(wrapper.text().includes("experience.availability.info.group.max-number")).toBeTruthy();
    });
  });
});
