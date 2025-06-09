/* eslint-disable prefer-promise-reject-errors */
import { setActivePinia, createPinia } from "pinia";
import { describe, expect, test, beforeEach, vi, beforeAll } from "vitest";
import { useExperienceOptionsStore } from "@/features/experience-calendar/store/useExperienceOptionsStore";
import { DateTicket, ExperienceType, Pricing } from "@/types/generated/OfferServiceApiOld";
import { Option, Pax } from "@/types/generated/OfferServiceApi";
import { AvailabilityCard } from "@/features/experience-calendar/types/Availability";
import { mapAvailability } from "../../lib/experience-option-availability";

const mockOption: Option = {
  id: "option-id",
  capacity_type: "unlimited",
  duration: "P0Y0M1DT0H0M0S",
  experience: "experience-id",
  multilanguage: false,
  name: "Hello",
  status: "DRAFT",
  allowed_languages: [],
};

const mockPricings: Pricing[] = [
  {
    id: "pricing-child",
    name: "Summer season",
    holder: "child",
    age_range: { from: 1, to: 17 },
    option: "option-id",
    pricing_type: "person",
    tiers: [{ from: 1, to: 8, retail_price: 70.0, commission: 33, net_price: 46.9 }],
  },
  {
    id: "pricing-adult",
    name: "Summer season",
    holder: "adult",
    age_range: { from: 18, to: 45 },
    pricing_type: "person",
    option: "option-id",
    tiers: [{ from: 1, to: 4, retail_price: 100.0, commission: 34, net_price: 66.0 }],
  },
];

const mockExperiencePaxes: Pax[] = [];

const mockAvailability: AvailabilityCard<DateTicket>[] = [
  {
    cardId: "test-uuid",
    isOpen: false,
    isValid: true,
    value: {
      id: "availability-1-id",
      option: "option-id",
      name: "Test availability 1",
      date_range: { from: "2023-03-06", to: "2023-03-12" },
      days: {
        "1": {
          languages: [],
          pricings: [{ pricing: "pricing-adult" }],
        },
        "7": {
          languages: [],
          pricings: [{ pricing: "pricing-adult" }],
        },
      },
    },
  },
  {
    cardId: "test-uuid",
    isOpen: false,
    isValid: true,
    value: {
      id: "availability-2-id",
      option: "option-id",
      name: "Test availability 2",
      date_range: { from: "2023-02-08", to: "2023-02-10" },
      days: {
        "3": {
          languages: [],
          pricings: [{ pricing: "pricing-adult" }, { pricing: "pricing-child" }],
        },
        "4": {
          languages: [],
          pricings: [{ pricing: "pricing-adult" }],
        },
        "5": {
          languages: [],
          pricings: [{ pricing: "pricing-child" }],
        },
      },
    },
  },
];

const offerServiceMock = {
  getOption: vi.fn(),
  putOption: vi.fn(() => Promise.resolve()),
  updateOption: vi.fn(() => Promise.resolve()),
  updateExperience: vi.fn(() => Promise.resolve()),
  publishExperience: vi.fn(() => Promise.resolve()),
  getPricings: vi.fn(),
  createPricing: vi.fn(() => Promise.resolve({ data: { id: "new-id" } })),
  updatePricing: vi.fn(() => Promise.resolve({ data: { id: "new-id" } })),
  deletePricing: vi.fn(() => Promise.resolve()),
  getAvailabilities: vi.fn(),
  createAvailability: vi.fn(() => Promise.resolve({ data: { id: "new-id" } })),
  updateAvailability: vi.fn(() => Promise.resolve({ data: { id: "new-id" } })),
  deleteAvailability: vi.fn(() => Promise.resolve()),
  getExperiencePaxes: vi.fn(),
};

vi.mock("@/composables/useOfferServiceApi", () => ({
  useOfferServiceApi: () => offerServiceMock,
}));

const customerDetailsStoreMock = { loadData: vi.fn(), isSaved: true };
vi.mock("@/features/experience-calendar/store/useCustomerDetailsStore", () => ({
  useCustomerDetailsStore: () => customerDetailsStoreMock,
}));

const pickupsStoreMock = { loadData: vi.fn(), isFormValid: true };
vi.mock("@/features/experience-calendar/store/usePickupsStore", () => ({
  usePickupsStore: () => pickupsStoreMock,
}));

vi.mock("@/utils/uuid", () => ({
  uuid: () => "test-uuid",
}));

vi.stubGlobal("useRoute", () => ({ params: { optionId: "option-id" } }));

describe("Experience Options Store - Date Tickets", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let store: ReturnType<typeof useExperienceOptionsStore>;

  beforeAll(() => {
    setActivePinia(createPinia());
    store = useExperienceOptionsStore();
  });

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.spyOn(offerServiceMock, "getOption").mockImplementation(() => Promise.resolve({ data: mockOption }));
    vi.spyOn(offerServiceMock, "getPricings").mockImplementation(() => Promise.resolve({ data: mockPricings }));
    vi.spyOn(offerServiceMock, "getAvailabilities").mockImplementation(() =>
      Promise.resolve({ data: mockAvailability.map((a) => ({ ...a.value })) })
    );
    vi.spyOn(offerServiceMock, "getExperiencePaxes").mockImplementation(() =>
      Promise.resolve({ data: { experience_id: "id", pax_list: mockExperiencePaxes } })
    );

    store.state.availabilities = [];

    await store.loadOptionData("exp-id", "option-id", ExperienceType.CALENDAR_NO_TIMESLOTS);
  });

  describe("getters", () => {
    test("isLoading", () => {
      expect(store.isLoading).toBe(false);
    });
  });

  describe("actions", () => {
    describe("loadOptionData", () => {
      test("it should fetch the option data and store it", async () => {
        await store.loadOptionData("exp-id", "option-id", ExperienceType.CALENDAR_NO_TIMESLOTS);

        expect(offerServiceMock.getOption).toHaveBeenCalledWith("option-id");
        expect(offerServiceMock.getPricings).toHaveBeenCalledWith("exp-id", "option-id");
        expect(offerServiceMock.getAvailabilities).toHaveBeenCalledWith(
          "option-id",
          ExperienceType.CALENDAR_NO_TIMESLOTS
        );

        // load customer details
        expect(customerDetailsStoreMock.loadData).toHaveBeenCalled();

        // load pickups
        expect(pickupsStoreMock.loadData).toHaveBeenCalled();

        expect(store.state.option).toBeTruthy();

        expect(store.state.availabilities).toStrictEqual(mockAvailability);
      });
    });

    describe("updateOption", () => {
      test("it should call the offer service to update the option", async () => {
        await store.updateOption("option-id");

        expect(offerServiceMock.putOption).toHaveBeenCalledWith("option-id", store.state.option);
      });

      describe("when publish is set to true", () => {
        test("it should set the correct status", async () => {
          await store.updateOption("option-id", true);

          expect(offerServiceMock.putOption).toHaveBeenCalledWith("option-id", {
            ...store.state.option,
            status: "PUBLISHED",
          });
        });
      });
    });

    describe("deleteAvailability", () => {
      test("it should call the offer service to delete the availability and update the state", async () => {
        expect(store.state.availabilities.length).toBe(2);

        await store.deleteAvailability(1, "option-id", ExperienceType.CALENDAR_NO_TIMESLOTS, "availability-1-id");

        expect(offerServiceMock.deleteAvailability).toHaveBeenCalledWith("availability-1-id", "CALENDAR-NO-TIMESLOTS");
        expect(store.state.availabilities.length).toBe(1);
      });

      describe("if the availability type is DatetimeTicket", () => {
        test("it should remove it from the datetimeTickets array", async () => {
          await store.loadOptionData("exp-id", "option-id", ExperienceType.CALENDAR_TIMESLOTS);

          await store.deleteAvailability(1, "option-id", ExperienceType.CALENDAR_TIMESLOTS, "availability-1-id");

          expect(offerServiceMock.deleteAvailability).toHaveBeenCalledWith("availability-1-id", "CALENDAR-TIMESLOTS");
          expect(store.state.availabilities.length).toBe(1);
        });
      });

      describe("if the availability type is OpenTicket", () => {
        test("it should remove it from the openTickets array", async () => {
          await store.loadOptionData("exp-id", "option-id", ExperienceType.NO_CALENDAR_FIXED_END);

          await store.deleteAvailability(1, "option-id", ExperienceType.NO_CALENDAR_FIXED_END, "availability-1-id");

          expect(offerServiceMock.deleteAvailability).toHaveBeenCalledWith(
            "availability-1-id",
            "NO-CALENDAR-FIXED-END"
          );
          expect(store.state.availabilities.length).toBe(1);
        });
      });
    });

    describe("saveAvailabilities", () => {
      test("it should not call updateAvailability if the availabilities are not changed", async () => {
        // save with no changes
        await store.saveAvailabilities(ExperienceType.CALENDAR_NO_TIMESLOTS);

        // should not call updateAvailability
        expect(offerServiceMock.updateAvailability).toHaveBeenCalledTimes(0);
      });

      test("it should call updateAvailability for changed availabilities", async () => {
        // Modify an availability
        store.state.availabilities[0].value.name = "new-name";

        await store.saveAvailabilities(ExperienceType.CALENDAR_NO_TIMESLOTS);

        // should be called once
        expect(offerServiceMock.updateAvailability).toHaveBeenCalledTimes(1);
        expect(offerServiceMock.updateAvailability).toHaveBeenCalledWith(
          expect.objectContaining({ name: "new-name" }),
          ExperienceType.CALENDAR_NO_TIMESLOTS
        );
      });

      test("it should call updateAvailability for all availabilities if they are updated", async () => {
        // modify 2 availabilities
        store.state.availabilities[0].value.name = "new-name-1";
        store.state.availabilities[1].value.name = "new-name-2";

        await store.saveAvailabilities(ExperienceType.CALENDAR_NO_TIMESLOTS);

        // it should be called 2 times
        expect(offerServiceMock.updateAvailability).toHaveBeenCalledTimes(2);
        expect(offerServiceMock.updateAvailability).toHaveBeenNthCalledWith(
          1,
          {
            ...mockAvailability[0].value,
            name: "new-name-1",
          },
          ExperienceType.CALENDAR_NO_TIMESLOTS
        );
        expect(offerServiceMock.updateAvailability).toHaveBeenNthCalledWith(
          2,
          {
            ...mockAvailability[1].value,
            name: "new-name-2",
          },
          ExperienceType.CALENDAR_NO_TIMESLOTS
        );
      });

      describe("if the availability is new", () => {
        test("it should call the offer service to create the availability", async () => {
          const newAvailability: DateTicket = {
            option: "option-id",
            name: "New availability name",
            date_range: { from: "2023-03-06", to: "2023-03-12" },
            days: { "1": { languages: [], pricings: [{ pricing: "pricing-adult" }] } },
          };

          const mappedAvailability = mapAvailability(newAvailability); // Assuming mapAvailability is a utility function that's already defined
          store.state.availabilities = [mappedAvailability];

          await store.saveAvailabilities(ExperienceType.CALENDAR_NO_TIMESLOTS);
          expect(offerServiceMock.createAvailability).toHaveBeenCalledWith(
            expect.objectContaining(newAvailability),
            ExperienceType.CALENDAR_NO_TIMESLOTS
          );
        });
      });
    });
  });

  describe("publishing", () => {
    test("canPublish validates a document ready for publish", () => {
      expect(store.canPublish).toBe(true);
    });

    test("canPublish does NOT validate a document NOT ready for publish", () => {
      store.state.availabilities = store.state.availabilities.map((t) => ({
        ...t,
        isValid: false,
      }));

      expect(store.canPublish).toBe(false);
    });

    test("canPublish does NOT validate a document with no availabilities", () => {
      store.state.availabilities = [];

      expect(store.canPublish).toBe(false);
    });

    test("publishOption publishes correctly", async () => {
      const mockDock = {
        confirmation_time: "test",
        currency: "EUR",
        cutoff_time: "test",
        supplier: "test",
        type: ExperienceType.CALENDAR_NO_TIMESLOTS,
        uuid: "test",
        state: "test",
      };
      await store.publishOption("option-id", mockDock);
      expect(offerServiceMock.publishExperience).toHaveBeenCalledWith(mockDock.uuid);

      expect(offerServiceMock.putOption).toHaveBeenCalledWith("option-id", {
        capacity_type: "unlimited",
        duration: "P0Y0M1DT0H0M0S",
        experience: "experience-id",
        id: "option-id",
        multilanguage: false,
        name: "Hello",
        status: "PUBLISHED",
        allowed_languages: [],
      });
    });
  });
});
