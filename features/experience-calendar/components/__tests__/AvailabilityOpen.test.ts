import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { mount, config } from "@vue/test-utils";
import AvailabilityOpen, { Props } from "../AvailabilityOpen.vue";
import { testId } from "@/utils/test.utils";
import { ExperienceType } from "@/types/generated/OfferServiceApiOld";
import { mockUseRuntimeConfig } from "@/__mocks__/useRuntimeConfig";

vi.stubGlobal("useRoute", () => ({
  params: { optionId: "option-id", id: "experience_id" },
}));
vi.stubGlobal("useNuxtApp", () => ({
  $t: (text: string) => text,
}));
vi.stubGlobal("useRuntimeConfig", mockUseRuntimeConfig);

config.global.mocks = {
  $t: (text: string) => text,
};

const experienceStore = reactive({
  rawContents: {
    experience_id: {
      fields: {
        experience_type: {
          value: ExperienceType.NO_CALENDAR_FIXED_END,
        },
      },
    },
  },
});

const mockExperienceRaw = experienceStore;

vi.mock("@/stores/experience-raw", () => ({
  useExperienceRaw: () => mockExperienceRaw,
}));

const selectors = {
  title: testId("nova-collapse-title"),
  nameInput: testId("availability_name-input-text"),
  expireDateInput: testId("availability_expiration-date-input-date-input"),
  expireDaysInput: testId("availability.expiration-days-input-number"),
  dateBtn: testId("date-card"),
  itemSlot: testId("time-slot-item"),
  capacityInput: testId("availability.any-day-slot-item-capacity-input-number"),
  deleteAvailabilityBtn: testId("delete-availability"),
  clearAvailabilityBtn: testId("clear-availability"),
  modalConfirmBtn: testId("modal-save-btn"),
};

const props: Props = {
  isOpen: true,
  availability: {
    option: "option-id",
    expiration_date: "2023-02-03",
    expiration_days: null,
    name: "Availability name",
    pricings: [],
  },
  pricingData: [
    {
      id: "919e66f1-96ff-4778-a3e4-682a53dff3fd",
      name: "Expensive summer",
      holder: "Adult",
      age_range: { from: 18, to: 99 },
      pricing_type: "person",
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
    capacity_type: "shared",
    status: "DRAFT",
    experience: "c300cc72-983d-4da8-a2ed-5d1f9d10354c",
  },
  deleteCallback: vi.fn(() => Promise.resolve()),
};

describe("AvailabilityOpen", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("it should render correctly", () => {
    const wrapper = mount(AvailabilityOpen, { props });

    expect(wrapper.exists()).toBe(true);

    expect(wrapper.find(selectors.title).text()).toBe(props.availability.name);
    expect((wrapper.find(selectors.nameInput).element as HTMLInputElement).value).toBe(props.availability.name);
    expect(wrapper.find(selectors.expireDateInput).text()).toContain("03/02/2023");
    expect(wrapper.find(selectors.expireDaysInput).exists()).toBeFalsy();
  });
  describe("when one of the field is changed", () => {
    test("it should emit an event", async () => {
      const newProps = {
        ...props,
        availability: {
          ...props.availability,
          name: "",
          pricings: [{ pricing: "919e66f1-96ff-4778-a3e4-682a53dff3fd" }],
          languages: [],
        },
      };

      const wrapper = mount(AvailabilityOpen, { props: newProps });

      await wrapper.find(selectors.nameInput).setValue("New Title");
      await wrapper.find(selectors.capacityInput).setValue(100);
      vi.runAllTimers();

      const events = wrapper.emitted<Event[]>()["update:availability"];
      expect(events).toBeTruthy();
      expect(events[0][0]).toStrictEqual({
        value: { ...newProps.availability, name: "New Title", capacity: 100 },
        valid: true,
      });
    });
  });

  describe("when the user clicks on the delete button", () => {
    test("it should call the delete callback", async () => {
      const wrapper = mount(AvailabilityOpen, { props });

      wrapper.find(selectors.deleteAvailabilityBtn).trigger("click");
      await wrapper.vm.$nextTick();
      await wrapper.find(selectors.modalConfirmBtn).trigger("click");

      expect(props.deleteCallback).toHaveBeenCalled();
    });
  });

  describe("when the user clicks on the clear button", () => {
    test("it should emit an event resetting the availability", async () => {
      const wrapper = mount(AvailabilityOpen, { props });

      await wrapper.find(testId("clear-availability")).trigger("click");
      vi.runAllTimers();

      const events = wrapper.emitted<Event[]>()["update:availability"];
      expect(events).toBeTruthy();
      expect(events[0][0]).toStrictEqual({
        value: {
          option: "option-id",
          expiration_date: null,
          expiration_days: null,
          name: "",
          pricings: [],
        },
        valid: false,
      });
    });
  });

  describe("If the experience type is NO-CALENDAR-FIXED-VALIDITY", () => {
    test("it should render the input number with the right value", async () => {
      experienceStore.rawContents = {
        experience_id: {
          fields: {
            experience_type: {
              value: ExperienceType.NO_CALENDAR_FIXED_VALIDITY,
            },
          },
        },
      };

      const wrapper = mount(AvailabilityOpen, {
        props: {
          ...props,
          availability: {
            option: "option-id",
            expiration_date: null,
            expiration_days: 0,
            name: "Availability name",
            pricings: [{ pricing: "919e66f1-96ff-4778-a3e4-682a53dff3fd" }],
            languages: [],
          },
        },
      });

      expect(wrapper.exists()).toBe(true);

      expect(wrapper.find(selectors.title).text()).toBe(props.availability.name);
      expect((wrapper.find(selectors.nameInput).element as HTMLInputElement).value).toBe(props.availability.name);
      expect(wrapper.find(selectors.expireDateInput).exists()).toBeFalsy();
      expect((wrapper.find(selectors.expireDaysInput).element as HTMLInputElement).value).toEqual("0");

      await wrapper.find(selectors.expireDaysInput).setValue(10);
      await wrapper.find(selectors.capacityInput).setValue(100);
      vi.runAllTimers();

      const events = wrapper.emitted<Event[]>()["update:availability"];
      expect(events).toBeTruthy();
      expect(events[0][0]).toStrictEqual({
        value: {
          option: "option-id",
          expiration_date: null,
          expiration_days: 10,
          capacity: 100,
          name: "Availability name",
          pricings: [{ pricing: "919e66f1-96ff-4778-a3e4-682a53dff3fd" }],
          languages: [],
        },
        valid: true,
      });
    });
  });
  describe("if the user click on the collapsable component", () => {
    test("it should emit an event", async () => {
      const wrapper = mount(AvailabilityOpen, { props });

      await wrapper.findAll(selectors.title)[0].trigger("click");

      const events = wrapper.emitted<Event[]>()["toggle:availabilityCard"];
      expect(events).toBeTruthy();
      expect(events[0][0]).toStrictEqual(false);
    });
  });
});
