import { describe, it, expect, vi } from "vitest";
import { useRawSidebarData } from "../useRawSidebarData";
import { ExperienceType } from "@/types/generated/OfferServiceApiOld";
import { usePaxesStore } from "@/features/experience-raw/stores/usePaxesStore";

// mock paxes store to avoid initial data loading
vi.mock("@/features/experience-raw/stores/usePaxesStore", () => ({
  usePaxesStore: vi.fn(() => {
    return {
      fields: { paxes: { value: [] } },
    } satisfies Partial<ReturnType<typeof usePaxesStore>>;
  }),
}));

describe("useRawSidebarData", () => {
  it("should return empty object if rawDocument is null", () => {
    const result = useRawSidebarData("non_existing_raw_document");

    expect(result.value).toEqual({});
  });

  it("should correctly show all the categories if the rawDocument exists", () => {
    const result = useRawSidebarData("test_document");

    expect(Object.keys(result.value)).toEqual([
      "settings",
      "location",
      "content_generation",
      "customer_information",
      "pricing_and_availability",
      "options",
      "agenda",
    ]);
  });

  it("should show the correct raw settings fields", () => {
    const result = useRawSidebarData("test_document");
    const settingsFields = result.value.settings.fields;

    expect(settingsFields).toMatchInlineSnapshot(`
      [
        {
          "filled": true,
          "id": "title",
          "required": true,
        },
        {
          "filled": true,
          "id": "supplier_id",
          "required": true,
        },
      ]
    `);
  });

  it("should show the confirmation time field if the instant confirmation is false", () => {
    experienceStore.rawContents.test_document.fields.instant_confirmation.value = false;
    const result = useRawSidebarData("test_document");
    const pricingAndAvailFields = result.value.pricing_and_availability.fields;

    expect(pricingAndAvailFields.find((field) => field.id === "pricing.confirmation-time")?.hide).toBeFalsy();
  });

  it("should hide the confirmation time field if the instant confirmation is true", () => {
    experienceStore.rawContents.test_document.fields.instant_confirmation.value = true;
    const result = useRawSidebarData("test_document");
    const pricingAndAvailFields = result.value.pricing_and_availability.fields;

    expect(pricingAndAvailFields.find((field) => field.id === "pricing.confirmation-time")?.hide).toBeTruthy();
  });

  describe("if the experience type is no calendar fixed end or no calendar fixed validity", () => {
    it("should show the expiration date field", () => {
      experienceStore.rawContents.test_document.fields.experience_type.value = ExperienceType.NO_CALENDAR_FIXED_END;
      const result = useRawSidebarData("test_document");
      const pricingAndAvailFields = result.value.pricing_and_availability.fields;

      expect(pricingAndAvailFields.find((field) => field.id === "pricing.expiration-date")?.hide).toBeFalsy();
    });

    it("should hide the cutoff time field", () => {
      experienceStore.rawContents.test_document.fields.experience_type.value =
        ExperienceType.NO_CALENDAR_FIXED_VALIDITY;
      const result = useRawSidebarData("test_document");
      const pricingAndAvailFields = result.value.pricing_and_availability.fields;

      expect(pricingAndAvailFields.find((field) => field.id === "pricing.cutoff-time")?.hide).toBeTruthy();
    });
  });

  describe("if the experience type is calendar timeslot or calendar no timeslot", () => {
    it("should show the cutoff time field", () => {
      experienceStore.rawContents.test_document.fields.experience_type.value = ExperienceType.CALENDAR_TIMESLOTS;
      const result = useRawSidebarData("test_document");
      const pricingAndAvailFields = result.value.pricing_and_availability.fields;

      expect(pricingAndAvailFields.find((field) => field.id === "pricing.cutoff-time")?.hide).toBeFalsy();
    });

    it("should hide the expiration date field", () => {
      experienceStore.rawContents.test_document.fields.experience_type.value = ExperienceType.CALENDAR_NO_TIMESLOTS;
      const result = useRawSidebarData("test_document");
      const pricingAndAvailFields = result.value.pricing_and_availability.fields;

      expect(pricingAndAvailFields.find((field) => field.id === "pricing.expiration-date")?.hide).toBeTruthy();
    });
  });

  it("should show the correct categories if the experience source is NOVA", () => {
    const result = useRawSidebarData("test_document");
    expect(Object.keys(result.value)).toEqual([
      "settings",
      "location",
      "content_generation",
      "customer_information",
      "pricing_and_availability",
      "options",
      "agenda",
    ]);
  });

  it("should show the correct categories if the experience source is ASX", () => {
    experienceStore.rawContents.test_document.data.product_type = "ASX";
    const result = useRawSidebarData("test_document");
    expect(Object.keys(result.value)).toEqual([
      "settings",
      "location",
      "content_generation",
      "customer_information",
      "asterix_integration",
    ]);
  });

  it("should show the correct categories if the experience source is SIP", () => {
    experienceStore.rawContents.test_document.data.product_type = "SIP";
    const result = useRawSidebarData("test_document", false);
    expect(Object.keys(result.value)).toEqual([
      "settings",
      "location",
      "content_generation",
      "customer_information",
      "api_connection",
    ]);
  });
});

const experienceStore = reactive({
  rawContents: {
    test_document: {
      data: { product_type: "NOVA" },
      fields: {
        title: {
          value: "TEST FIONA - 25.05.2024",
          required: true,
          category: "experience_settings",
        },
        categories_interests: {
          value: {
            categories: ["DAY_TRIPS"],
            interests: ["FOOD_AND_DRINK", "FESTIVAL_AND_CONCERTS"],
          },
          required: true,
          category: "experience_settings",
        },
        supplier_id: {
          value: "c2b1e5d0-04f2-46f1-b74b-4f9a5c75d7f9",
          required: true,
          category: "experience_settings",
        },
        external_reference_code: {
          value: "",
          required: false,
          category: "experience_settings",
        },
        collection_criteria: {
          exceptional_experiences: {
            value: "",
            required: false,
            category: "experience_settings",
          },
          created_with_care: {
            value: "",
            required: false,
            category: "experience_settings",
          },
          best_value_guaranteed: {
            value: "",
            required: false,
            category: "experience_settings",
          },
        },
        description: {
          value: "",
          required: true,
          category: "experience_info",
        },
        additional_description: {
          value: "",
          required: false,
          category: "experience_info",
        },
        highlights: {
          value: {
            premade: [],
            custom: [],
          },
          required: true,
          category: "experience_info",
        },
        included: {
          value: {
            premade: [],
            custom: [],
          },
          required: true,
          category: "experience_info",
        },
        non_included: {
          value: {
            premade: [],
            custom: [],
          },
          required: false,
          category: "experience_info",
        },
        important_information: {
          value: {
            premade: [],
            custom: [],
          },
          required: false,
          category: "experience_info",
        },
        meeting_point_details: {
          value: "",
          required: false,
          category: "experience_location",
        },
        experience_type: {
          value: "CALENDAR-TIMESLOTS",
          required: false,
          category: "experience_pricing_and_availability",
        },
        currency: {
          value: "EUR",
          required: true,
          category: "experience_pricing_and_availability",
        },
        instant_confirmation: {
          value: true,
          required: false,
          category: "experience_pricing_and_availability",
        },
        confirmation_time: {
          value: "P0Y0M0DT0H0M0S",
          required: false,
          category: "experience_pricing_and_availability",
        },
        cutoff_time: {
          value: "P0Y0M0DT4H30M0S",
          required: false,
          category: "experience_pricing_and_availability",
        },
        options: {
          value: [],
          required: false,
          category: "experience_info",
        },
        product_brand: {
          value: "",
          required: false,
          category: "experience_settings",
        },
        own_offer: {
          value: "",
          required: true,
          category: "experience_settings",
        },
        promotional_options: {
          value: "",
          required: false,
          category: "experience_settings",
        },
        nat_geo_tour_levels: {
          value: "",
          required: false,
          category: "experience_settings",
        },
        features: {
          value: ["FEATURE_FAST_TRACK"],
          required: false,
          category: "experience_info",
        },
        additional_services: {
          value: [],
          required: true,
          category: "property_and_relevance",
        },
        voucher_type: {
          required: true,
          category: "voucher",
        },
        emergency_contact: {
          value: {
            country_calling_code: "",
            number: "",
          },
          required: false,
          category: "voucher",
        },
        info_voucher: {
          value: "",
          required: false,
          category: "voucher",
        },
      },
    },
  },
});

const useBookingInformationStoreMock = {
  bookingInfoFields: {
    voucher_type: {
      value: "MOBILE",
      required: true,
      category: "voucher",
    },
    emergency_contact: {
      value: {
        country_calling_code: "",
        number: "",
      },
      required: false,
      category: "voucher",
    },
  },
};

const useExperienceLocationStoreMock = {
  fields: {
    city: {
      value: null,
      required: true,
      category: "experience_location",
    },
    additionalCities: {
      value: [],
      required: false,
      category: "experience_location",
    },
    venues: {
      value: [],
      required: false,
      category: "experience_location",
    },
    address: {
      value: {
        latitude: 0,
        longitude: 0,
        direction: "",
        postalCode: "",
      },
      required: false,
      category: "experience_location",
    },
  },
};

const useRefundPolicyStoreMock = {
  field: {
    value: [],
    required: true,
    category: "experience_settings",
  },
};

const useDistributionContentStoreMock = {
  getFieldStatus: vi.fn(() => {
    return {
      key: "supplier_id",
      isRequired: true,
      isValid: true,
    };
  }),
};

const useRawSettingsStoreMock = {
  fieldStatus: [
    {
      key: "title",
      isRequired: true,
      isValid: true,
    },
  ],
};
const useRawApiConnectionStoreMock = {
  fields: {
    event: {
      value: undefined,
      required: true,
      category: "api_connection",
    },
  },
};

vi.mock("@/stores/experience-raw", () => ({
  useExperienceRaw: () => experienceStore,
}));

vi.mock("@/features/experience-shared/stores/useBookingInformationStore", () => ({
  useBookingInformationStore: () => useBookingInformationStoreMock,
}));

vi.mock("@/features/experience-shared/stores/useExperienceLocationStore", () => ({
  useExperienceLocationStore: () => useExperienceLocationStoreMock,
}));

vi.mock("@/features/experience-shared/stores/useRefundPoliciesStore", () => ({
  useRefundPoliciesStore: () => useRefundPolicyStoreMock,
}));

vi.mock("@/features/experience-raw/stores/useRawSettingsStore", () => ({
  useRawSettingsStore: () => useRawSettingsStoreMock,
}));

vi.mock("@/features/experience-shared/stores/useDistributionContentStore", () => ({
  useDistributionContentStore: () => useDistributionContentStoreMock,
}));

vi.mock("@/features/experience-raw/stores/useRawApiConnectionStore", () => ({
  useRawApiConnectionStore: () => useRawApiConnectionStoreMock,
}));
