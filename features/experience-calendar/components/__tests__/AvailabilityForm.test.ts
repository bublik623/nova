import { ExperienceType } from "@/types/generated/OfferServiceApiOld";
import { config, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, test, vi } from "vitest";
import AvailabilityForm, { Props } from "../AvailabilityForm.vue";

config.global.mocks = {
  $t: (key: string) => key,
};

config.global.stubs = {
  AvailabilityDaysOfWeek: true,
  AvailabilityDateAndTime: true,
  AvailabilityOpen: true,
};

const TEST_OPTION_ID = "07987b35-1556-4c72-84d9-7613b49ea25b";

const mockOption = {
  id: TEST_OPTION_ID,
  name: "test",
  duration: "P0Y0M1DT0H0M0S",
  valid_for: null,
  multilanguage: false,
  capacity_type: "unlimited",
  status: "DRAFT",
  experience: "0cd490b6-1b95-4580-8e4c-1df2ac23f9af",
  pricing_type_allowed: "person",
};

const mockAvailabilities = [
  {
    cardId: "local-ebebd5gpf9m",
    isOpen: true,
    isValid: true,
    value: {
      days: {
        "5": [{ time: "04:00:00", pricings: [{ pricing: "4f76ef14-1774-4f6b-910e-2a8a86a6f6b6" }], languages: [] }],
      },
      option: TEST_OPTION_ID,
      date_range: { from: "2023-07-21", to: "2023-07-21" },
      name: "test",
      id: "b7451f2e-04ac-423b-a4f4-ffdf75c782e2",
    },
  },
  {
    cardId: "local-1092381029830",
    isOpen: true,
    isValid: true,
    value: {
      days: {
        "5": [{ time: "04:00:00", pricings: [{ pricing: "4f76ef14-1774-4f6b-910e-2a8a86a6f6b6" }], languages: [] }],
      },
      option: TEST_OPTION_ID,
      date_range: { from: "2023-07-21", to: "2023-07-21" },
      name: "test",
      id: "b7451f2e-04ac-423b-a4f4-ffdf75c782e2",
    },
  },
];

const useExperienceOptionsStoreMock = {
  deleteAvailability: vi.fn(),
  state: {
    option: mockOption,
    availabilities: mockAvailabilities,
  },
};

vi.mock("@/features/experience-calendar/store/useExperienceOptionsStore", () => ({
  useExperienceOptionsStore: () => useExperienceOptionsStoreMock,
}));

const usePricingStoreMock = {
  pricings: [],
};

vi.mock("@/features/experience-calendar/store/usePricingStore", () => ({
  usePricingStore: () => usePricingStoreMock,
}));

const useNotificationStoreMock = {
  addNotification: vi.fn(),
};

vi.mock("@/stores/notifications", () => ({
  useNotifications: () => useNotificationStoreMock,
}));

describe("AvailabilityForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("it renders correctly", () => {
    const wrapper = getWrapper();

    expect(wrapper.html()).toBeTruthy();
    expect(wrapper.text()).toContain("experience.availability.title.plural");
    expect(wrapper.text()).toContain("experience.availability.description");
    expect(wrapper.findAll('[data-testid*="availability-card"]').length).toBe(mockAvailabilities.length);
  });

  test("it creates a new availability", async () => {
    const wrapper = getWrapper();

    await wrapper.find('[data-testid="add-availability"]').trigger("click");
    expect(useExperienceOptionsStoreMock.state.availabilities.length).toBe(3);
  });

  test("it updates an availability", async () => {
    const mockUpdate = {
      value: { myMockData: ["hey!"] },
      valid: true,
    };

    const wrapper = getWrapper();

    // @ts-expect-error vm is actually available
    await wrapper.findComponent("availability-date-and-time-stub").vm.$emit("update:availability", mockUpdate);

    expect(useExperienceOptionsStoreMock.state.availabilities[0].value).toStrictEqual(mockUpdate.value);

    expect(useExperienceOptionsStoreMock.state.availabilities[0].isValid).toStrictEqual(mockUpdate.valid);
  });

  test("it deletes an availability", async () => {
    const wrapper = getWrapper();

    // @ts-expect-error vm is actually available
    await wrapper.findComponent("availability-date-and-time-stub").vm.deleteCallback();

    expect(useExperienceOptionsStoreMock.deleteAvailability).toHaveBeenCalledWith(
      0,
      TEST_OPTION_ID,
      ExperienceType.CALENDAR_TIMESLOTS,
      undefined
    );
  });

  test("if is readonly, it should not be editable", () => {
    const wrapper = getWrapper({ readonly: true });
    expect(wrapper.find('[data-testid="add-availability"]').exists()).toBeFalsy();
  });
});

function getWrapper(newProps?: Partial<Props>) {
  const props: Props = {
    isCuration: true,
    optionId: TEST_OPTION_ID,
    experienceType: ExperienceType.CALENDAR_TIMESLOTS,
    ...newProps,
  };

  return mount(AvailabilityForm, { props });
}
