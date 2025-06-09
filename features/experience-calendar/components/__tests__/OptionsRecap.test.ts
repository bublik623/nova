import { config, flushPromises, mount, RouterLinkStub, shallowMount } from "@vue/test-utils";
import { beforeEach, describe, expect, test, vi } from "vitest";
import OptionsRecap from "../OptionsRecap.vue";
import { ExperienceType } from "@/types/generated/OfferServiceApiOld";
import { mockUseRuntimeConfig } from "@/__mocks__/useRuntimeConfig";
import { testId } from "@/utils/test.utils";
import { createPinia, setActivePinia } from "pinia";
import { useExperienceRaw } from "@/stores/experience-raw";

const mockRoute = reactive({
  fullPath: "/experience/experienceId/raw/options",
  name: "experience-id-raw-options",
  params: {
    id: "experienceId",
  },
});

const mockRouter = {
  push: vi.fn(),
};

config.global.stubs = {
  NuxtLink: RouterLinkStub,
  OptionsRecapPickup: {
    template: "<div />",
  },
  OptionsRecapDetails: {
    template: "<div />",
  },
};
config.global.mocks = {
  $router: mockRouter,
  $t: (s: string) => s,
};

vi.stubGlobal("useRuntimeConfig", mockUseRuntimeConfig);
vi.stubGlobal("useNuxtApp", () => ({
  $t: (text: string) => text,
  $isoDuration: (duration: string) => ({
    humanize: () => duration,
  }),
}));
vi.stubGlobal("useRoute", () => mockRoute);
vi.stubGlobal("useRouter", () => mockRouter);

const customerDetailsStoreMock = { saveForm: vi.fn() };
vi.mock("@/features/experience-calendar/store/useCustomerDetailsStore", () => ({
  useCustomerDetailsStore: () => customerDetailsStoreMock,
}));

const experienceStore = {
  rawContents: {
    experienceId: {
      data: {
        offerExperience: {
          type: ExperienceType.CALENDAR_TIMESLOTS,
        },
      },
      fields: {
        experience_type: {
          value: ExperienceType.CALENDAR_TIMESLOTS,
        },
        options: {
          value: [
            {
              id: "optionId1",
              name: "Option 1",
              duration: "P0Y0M31DT3H2M0S",
              valid_for: null,
              multilanguage: false,
              capacity_type: "unlimited",
              pricing_type_allowed: "person",
              status: "DRAFT",
              experience: "1f8ee8a7-ae80-420e-a36d-2cdf697417e6",
            },
          ],
          required: true,
          category: "experience_info",
        },
      },
    },
  },
};

const mockExperienceRaw = experienceStore;

const mockOfferServiceApi = {
  deleteOption: vi.fn(() => Promise.resolve()),
  getOptionPricing: vi.fn(),
  getAvailabilities: vi.fn(),
  postOption: vi.fn(() => ({
    data: {
      id: "optionIdPosted",
    },
  })),
};

const notificationStoreMock = {
  addNotification: vi.fn(),
};

vi.mock("@/stores/experience-raw", () => ({
  useExperienceRaw: () => mockExperienceRaw,
}));

vi.mock("@/stores/notifications", () => ({
  useNotifications: () => notificationStoreMock,
}));

vi.mock("@/composables/useOfferServiceApi", () => ({
  useOfferServiceApi: () => mockOfferServiceApi,
}));

vi.mock("@/features/experience-calendar/utils/availability-types-guard", () => ({
  isOpenTicket: () => false,
  isDateTimeTicket: () => false,
}));

const mockPricing = {
  id: "029003e1-79b7-49d4-ace4-b6190acf7adb",
  name: "New Pricing",
  holder: "adult",
  age_range: {
    from: 1,
    to: 2,
  },
  option: "10345768-63a3-4c8e-9277-ab133ba7b34f",
  tiers: [
    {
      from: 1,
      to: 20,
      retail_price: 1,
      commission: 2,
      net_price: 0.98,
    },
  ],
};

const mockAvailability = {
  id: "cb6a269c-7784-4070-bb98-89e525e6c1af",
  option: "optionId1",
  name: "new Availability",
  date_range: {
    from: "2023-02-16",
    to: "2023-02-17",
  },
  days: {
    "4": [
      {
        time: "01:02:00",
        languages: [],
        pricings: [
          {
            pricing: "9d541066-aa41-43e8-9bf6-c644c0ba8e8b",
          },
        ],
      },
    ],
    "5": [
      {
        time: "01:02:00",
        languages: [],
        pricings: [
          {
            pricing: "9d541066-aa41-43e8-9bf6-c644c0ba8e8b",
          },
        ],
      },
    ],
  },
};

describe("OptionsRecap", () => {
  beforeEach(() => {
    vi.spyOn(mockOfferServiceApi, "getOptionPricing").mockResolvedValueOnce({
      data: [mockPricing],
    });
    vi.spyOn(mockOfferServiceApi, "getAvailabilities").mockResolvedValueOnce({
      data: [mockAvailability],
    });
  });
  setActivePinia(createPinia());
  const store = useExperienceRaw();

  test(" it should render correctly", async () => {
    const wrapper = mount(OptionsRecap);

    expect(wrapper.exists()).toBeTruthy();
    expect(wrapper.html()).contain("P0Y0M31DT3H2M0S");

    // needed to wait for the async call
    await flushPromises();

    expect(wrapper.find(testId("option-details-collapsible")).exists()).toBeTruthy();
    expect(wrapper.find(testId("availability-details-collapsible")).exists()).toBeTruthy();
    expect(wrapper.find(testId("pricing-details-collapsible")).exists()).toBeTruthy();

    // check the holder label
    expect(wrapper.text()).include("experience.options.pricing.holder");
  });

  test("the links should redirect to the correct route | raw", async () => {
    const wrapper = mount(OptionsRecap);
    // needed to wait for the async call
    await flushPromises();

    const goToOptionBtn = wrapper.findAll(testId("option-action-edit"))[0];
    const goToPricingBtn = wrapper.find(testId("pricing-table-reroute"));
    const goToAvailabilityBtn = wrapper.find(testId("availability-table-reroute"));

    const baseUrl = "/experience/experienceId/options/raw/optionId1/";

    await goToOptionBtn.trigger("click");
    expect(mockRouter.push).toHaveBeenNthCalledWith(1, baseUrl + "option-settings");

    await goToPricingBtn.trigger("click");
    expect(mockRouter.push).toHaveBeenNthCalledWith(2, baseUrl + "pricing");

    await goToAvailabilityBtn.trigger("click");
    expect(mockRouter.push).toHaveBeenNthCalledWith(3, baseUrl + "availability");
  });

  test("the links should redirect to the correct route | curation", async () => {
    mockRoute.fullPath = "/experience/experienceId/curation/options";
    mockRoute.name = "experience-id-curation-options";
    const wrapper = mount(OptionsRecap);
    // needed to wait for the async call
    await flushPromises();
    vi.clearAllMocks();

    const goToOptionBtn = wrapper.findAll(testId("option-action-edit"))[0];
    const goToPricingBtn = wrapper.find(testId("pricing-table-reroute"));
    const goToAvailabilityBtn = wrapper.find(testId("availability-table-reroute"));

    const baseUrl = "/experience/experienceId/options/curation/optionId1/";

    await goToOptionBtn.trigger("click");
    expect(mockRouter.push).toHaveBeenNthCalledWith(1, baseUrl + "option-settings");

    await goToPricingBtn.trigger("click");
    expect(mockRouter.push).toHaveBeenNthCalledWith(2, baseUrl + "pricing");

    await goToAvailabilityBtn.trigger("click");
    expect(mockRouter.push).toHaveBeenNthCalledWith(3, baseUrl + "availability");
  });

  describe("if the options type is group", async () => {
    test("it should show the group labels", async () => {
      store.rawContents.experienceId.fields.options.value[0].pricing_type_allowed = "group";
      const wrapper = mount(OptionsRecap);
      expect(wrapper.text()).include("experience.options.pricing.group");
      expect(wrapper.text()).include("common.groups");
    });
  });

  describe("if is readonly", async () => {
    test("it should render correctly", async () => {
      const wrapper = mount(OptionsRecap, { props: { readonly: true } });

      const goToOptionBtn = wrapper.findAll(testId("option-action-edit"))[0];
      const goToPricingBtn = wrapper.find(testId("pricing-table-reroute"));
      const goToAvailabilityBtn = wrapper.find(testId("availability-table-reroute"));
      const createOptBtn = wrapper.find(testId("experience-options-index-create-option"));

      expect(goToOptionBtn.isVisible()).toBeTruthy();
      expect(goToPricingBtn.isVisible()).toBeTruthy();
      expect(goToAvailabilityBtn.isVisible()).toBeTruthy();
      expect(createOptBtn.isVisible()).toBeFalsy();
    });

    test("it should not render the delete button", () => {
      const wrapper = shallowMount(OptionsRecap, { props: { readonly: true } });

      const [deleteButton] = wrapper.findAll(testId("option-action-delete"));

      expect(deleteButton).toBeFalsy();
    });
  });
});
