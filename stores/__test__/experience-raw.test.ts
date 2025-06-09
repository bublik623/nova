/* eslint-disable prefer-promise-reject-errors */
import { setActivePinia, createPinia } from "pinia";
import { describe, expect, test, beforeEach, vi, beforeAll, Mocked } from "vitest";
import { ExperienceRawData, useExperienceRaw, validateAsterixAdapterInformation } from "@/stores/experience-raw";
import { Experience, ExperienceType } from "@/types/generated/OfferServiceApiOld";
import { RawStatusCode } from "@/types/DocumentStatuses";
import { getExperienceRawInitialValues } from "@/features/experience-raw/utils/experience-raw-utils";
import { RawAsterixAdapterInformation, RawElement } from "@/types/generated/ExperienceRawServiceApi";
import { useExperienceRawApi } from "@/composables/useExperienceRawApi";
import { useDistributionAttributes } from "@/features/experience-shared/composables/useDistributionAttributes";
import { useBookingInformationStore } from "@/features/experience-shared/stores/useBookingInformationStore";
import { useExperienceLocationStore } from "@/features/experience-shared/stores/useExperienceLocationStore";
import { BRAND_TUI_COLLECTION } from "@/features/experience-raw/constants";

vi.mock("axios");

const mockedUseDistributionAttributes: Partial<ReturnType<typeof useDistributionAttributes>> = {
  saveData: vi.fn(),
};

vi.mock("@/features/experience-shared/composables/useDistributionAttributes", () => ({
  useDistributionAttributes: () => mockedUseDistributionAttributes,
}));

vi.stubGlobal("useNuxtApp", () => ({ $t: (s: string) => s }));
vi.stubGlobal("useNuxtData", () => ({ data: { value: { experience_source: "NOVA" } } }));

const mockedDistributionAttributes = vi.mocked(useDistributionAttributes());

const masterdataStoreMock = {
  highlights: [
    {
      id: "highlight",
    },
  ],
  included: [
    {
      id: "included 2",
    },
  ],
  getHighlightByCode: vi.fn(() => ({
    id: "included 2",
  })),
  getAdditionalServicesByFGCode: vi.fn(() => {
    return [];
  }),
};

const mockPayload: RawElement = {
  id: "test-id",
  functional: {
    asterix_id: "asterix-id",
    options: [{ code: "option", description: "option description" }],
    included: ["included 2"],
  },
  commercial: {
    title: "Test title",
    description: "Test description",
  },
  creation_date: "2022-06-16T14:25:52.529",
  updated_date: "2022-06-16T14:25:52.529",
  flow_code: "BASE",
  status_code: RawStatusCode.IN_CREATION,
  experience_id: "raw-exp-id",
};

const mockOfferExperience: Experience = {
  confirmation_time: "P0Y0M0DT2H0M0S",
  currency: "USD",
  cutoff_time: "P0Y0M1DT0H0M0S",
  state: "DRAFT",
  supplier: "test-supplier-id",
  type: ExperienceType.CALENDAR_NO_TIMESLOTS,
  uuid: "95d80898-22dc-44d1-aa4e-cbebaa70c616",
};

const mockMarkets = {
  id: "test-markets",
  experience_id: "test-id",
  markets: ["de-2c", "be-2c", "3b-nz"],
};

const experienceApiMock = {
  createExperienceRaw: vi.fn(),
  getExperienceRawV2: vi.fn(),
  getExperienceRawV2ByExperienceId: vi.fn(),
  updateExperienceRaw: vi.fn(),
  updateExperienceRawV2: vi.fn(),
  deleteDistributionContent: vi.fn(),
  patchDistributionContent: vi.fn(),
};

const mockOfferServiceApi = {
  getExperienceOptions: vi.fn(() => {
    return Promise.resolve([]);
  }),
  getExperience: vi.fn(),
};

const mockMetadataApi = {
  getMarkets: vi.fn(),
  post: vi.fn(() => {
    return {
      headers: {
        location: "",
      },
    };
  }),
  put: vi.fn(),
  del: vi.fn(),
};

const useExperienceLocationStoreMock = {
  initAdditionalCitiesField: vi.fn(),
  initVenuesField: vi.fn(),
  initLocationFields: vi.fn(),
  loadLocation: vi.fn(),
  getLocationPayload: vi.fn(),
  getAdditionalCitiesPayload: vi.fn(),
  getVenuesPayload: vi.fn(),
} satisfies Partial<ReturnType<typeof useExperienceLocationStore>>;
const useBookingInformationStoreMock = {
  initFields: vi.fn(),
  loadBookingInfo: vi.fn(),
  getBookingInfoPayload: vi.fn(),
} satisfies Partial<ReturnType<typeof useBookingInformationStore>>;

vi.mock("@/features/experience-shared/stores/useBookingInformationStore", () => ({
  useBookingInformationStore: () => useBookingInformationStoreMock,
}));

vi.mock("@/features/experience-shared/stores/useExperienceLocationStore", () => ({
  useExperienceLocationStore: () => useExperienceLocationStoreMock,
}));

vi.mock("@/stores/master-data", () => ({
  useMasterData: () => masterdataStoreMock,
}));

vi.mock("@/composables/useExperienceRawApi", () => ({
  useExperienceRawApi: () => experienceApiMock,
}));

vi.mock("@/composables/useOfferServiceApi", () => ({
  useOfferServiceApi: () => mockOfferServiceApi,
}));

vi.mock("@/composables/useMetadataExperienceApi", () => ({
  useMetadataExperienceApi: () => mockMetadataApi,
}));

vi.mock("@/features/experience-raw/stores/useRawSettingsStore", () => ({
  useRawSettingsStore: () => rawSettingValuesMock,
}));

const rawSettingValuesMock = {
  values: vi.fn(),
};

const loadRefundPoliciesSpy = vi.fn();
vi.mock("@/features/experience-shared/stores/useRefundPoliciesStore", () => ({
  useRefundPoliciesStore: () => ({
    loadRefundPolicies: loadRefundPoliciesSpy,
  }),
}));

const mockedUseExperienceRawApi = useExperienceRawApi() as Mocked<UseExperienceRawApi>;

describe("Experience Raw Store", () => {
  let store: ReturnType<typeof useExperienceRaw>;

  beforeEach(() => {
    vi.spyOn(experienceApiMock, "createExperienceRaw").mockImplementation(() =>
      Promise.resolve({
        headers: { location: "/experience-raw/generated-test-id" },
      })
    );
    vi.spyOn(experienceApiMock, "updateExperienceRawV2").mockImplementation(() => Promise.resolve());
    vi.spyOn(experienceApiMock, "getExperienceRawV2ByExperienceId").mockResolvedValueOnce({
      data: mockPayload,
    });
    vi.spyOn(mockOfferServiceApi, "getExperience").mockResolvedValue({
      data: mockOfferExperience,
    });
    vi.spyOn(mockMetadataApi, "getMarkets").mockResolvedValueOnce({
      data: mockMarkets,
    });
  });

  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
    store = useExperienceRaw();

    store.$state = {
      rawContents: {
        "test-id": {
          modified: true,
          fields: {
            emergency_contact: {
              value: { country_calling_code: "90", number: "5459991122" },
              required: false,
              category: "experience_settings",
            },
            voucher_type: {
              value: undefined,
              required: false,
              category: "experience_settings",
            },
            asterix_id: {
              value: "",
              required: false,
              category: "experience_settings",
            },
            supplier_id: {
              value: "",
              required: true,
              category: "experience_settings",
            },
            external_reference_code: {
              value: "",
              required: false,
              category: "experience_settings",
            },
            option: {
              value: "",
              required: false,
              category: "experience_settings",
            },
            title: {
              value: "",
              required: true,
              category: "experience_settings",
            },
            categories_interests: {
              value: { categories: [], interests: [] },
              required: true,
              category: "experience_settings",
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
            additional_services: {
              value: [],
              required: true,
              category: "property_and_relevance",
            },
            markets: {
              value: [],
              required: false,
              category: "segmentation_details",
            },
            info_voucher: { value: "", required: false, category: "voucher" },
            options: {
              value: [],
              required: false,
              category: "experience_info",
            },
            experience_type: {
              value: ExperienceType.CALENDAR_TIMESLOTS,
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
              value: "P0Y0M1DT0H0M0S",
              required: true,
              category: "experience_pricing_and_availability",
            },
            cutoff_time: {
              value: "PT2H",
              required: false,
              category: "experience_pricing_and_availability",
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
            features: {
              value: [],
              required: false,
              category: "experience_info",
            },
            nat_geo_tour_levels: {
              value: "",
              required: true,
              category: "experience_settings",
            },
            meeting_point_details: {
              value: "",
              required: false,
              category: "experience_location",
            },
            collection_criteria: {
              exceptional_experiences: {
                value: "",
                required: false,
                category: "experience_settings",
              },
              best_value_guaranteed: {
                value: "",
                required: false,
                category: "experience_settings",
              },
              created_with_care: {
                value: "",
                required: false,
                category: "experience_settings",
              },
            },
          },
          data: {
            ...mockPayload,
            offerExperience: mockOfferExperience,
            options: [],
            experience_id: "test-id",
            supplier_id: "",
            product_type: "NOVA",
            id: "raw-exp-id",
            experience_source: "NOVA",
          },
        },
      },
    };
  });

  describe("getters", () => {
    test("requiredFields", () => {
      expect(store.requiredFields("test-id")).toStrictEqual({
        supplier_id: {
          value: "",
          required: true,
          category: "experience_settings",
        },
        title: { value: "", required: true, category: "experience_settings" },
        description: { value: "", required: true, category: "experience_info" },
        highlights: {
          value: {
            custom: [],
            premade: [],
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
        additional_services: {
          value: [],
          required: true,
          category: "property_and_relevance",
        },
        nat_geo_tour_levels: {
          category: "experience_settings",
          required: true,
          value: "",
        },
        confirmation_time: {
          category: "experience_pricing_and_availability",
          required: true,
          value: "P0Y0M1DT0H0M0S",
        },
        currency: {
          category: "experience_pricing_and_availability",
          required: true,
          value: "EUR",
        },
        own_offer: {
          category: "experience_settings",
          required: true,
          value: "",
        },
        categories_interests: {
          value: { categories: [], interests: [] },
          required: true,
          category: "experience_settings",
        },
      });
    });

    test("submitEnabled", () => {
      expect(store.submitEnabled("test-id")).toBe(false);

      store.$state = {
        rawContents: {
          "test-id": {
            modified: true,
            fields: {
              emergency_contact: {
                value: { country_calling_code: "90", number: "5459991122" },
                required: false,
                category: "experience_settings",
              },
              voucher_type: {
                value: "MOBILE",
                required: false,
                category: "experience_settings",
              },
              asterix_id: {
                value: "test-asterix-id",
                required: false,
                category: "experience_settings",
              },
              external_reference_code: {
                value: "",
                required: false,
                category: "experience_settings",
              },
              supplier_id: {
                value: "test-supplier-id",
                required: true,
                category: "experience_settings",
              },
              option: {
                value: "test-option",
                required: false,
                category: "experience_settings",
              },
              title: {
                value: "test-title",
                required: true,
                category: "experience_settings",
              },
              categories_interests: {
                value: { categories: [], interests: [] },
                required: true,
                category: "experience_settings",
              },
              description: {
                value: "test-description",
                required: true,
                category: "experience_info",
              },
              additional_description: {
                value: "test-additional-description",
                required: false,
                category: "experience_info",
              },
              highlights: {
                value: {
                  custom: [
                    {
                      id: "1",
                      name: "highlight_1_custom",
                      action: "NOOP",
                      visualization_order: 0,
                    },
                  ],
                  premade: [
                    {
                      id: "1",
                      name: "highlight_1_premade",
                      action: "NOOP",
                      visualization_order: 0,
                    },
                  ],
                },
                required: true,
                category: "experience_info",
              },
              included: {
                value: {
                  custom: [
                    {
                      id: "1",
                      name: "highlight_1_custom",
                      action: "NOOP",
                      visualization_order: 0,
                    },
                  ],
                  premade: [
                    {
                      id: "1",
                      name: "highlight_1_premade",
                      action: "NOOP",
                      visualization_order: 0,
                    },
                  ],
                },
                required: true,
                category: "experience_info",
              },
              non_included: {
                value: {
                  custom: [
                    {
                      id: "1",
                      name: "highlight_1_custom",
                      action: "NOOP",
                      visualization_order: 0,
                    },
                  ],
                  premade: [
                    {
                      id: "1",
                      name: "highlight_1_premade",
                      action: "NOOP",
                      visualization_order: 0,
                    },
                  ],
                },
                required: false,
                category: "experience_info",
              },
              important_information: {
                value: {
                  custom: [
                    {
                      id: "1",
                      name: "highlight_1_custom",
                      action: "NOOP",
                      visualization_order: 0,
                    },
                  ],
                  premade: [
                    {
                      id: "1",
                      name: "highlight_1_premade",
                      action: "NOOP",
                      visualization_order: 0,
                    },
                  ],
                },
                required: false,
                category: "experience_info",
              },
              additional_services: {
                value: ["additional_1"],
                required: true,
                category: "property_and_relevance",
              },
              info_voucher: { value: "", required: false, category: "voucher" },
              options: {
                value: [
                  {
                    id: "9065eca2-4b8d-4889-b86c-752af39cda4c",
                    name: "TEST OPTION NOVA 3",
                    duration: "P0Y0M7DT10H23M54S",
                    valid_for: "P0Y0M7DT4H12M21S",
                    multilanguage: false,
                    capacity_type: "shared",
                    status: "DRAFT",
                    experience: "67dec5b5-b576-41fc-8780-36cc0e0547ad",
                  },
                ],
                required: false,
                category: "experience_info",
              },
              experience_type: {
                value: ExperienceType.CALENDAR_TIMESLOTS,
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
                value: "P0Y0M1DT0H0M0S",
                required: true,
                category: "experience_pricing_and_availability",
              },
              cutoff_time: {
                value: "PT2H",
                required: false,
                category: "experience_pricing_and_availability",
              },
              product_brand: {
                value: "BRAND_TUI_COLLECTION",
                required: false,
                category: "experience_settings",
              },
              own_offer: {
                value: "OWN_OFFER_TUI_DESIGNED_3P_OPERATED",
                required: true,
                category: "experience_settings",
              },
              promotional_options: {
                value: "PROMOTIONAL_SPECIAL",
                required: false,
                category: "experience_settings",
              },
              features: {
                value: ["FEATURE_INSTANT_CONFIRMATION"],
                required: false,
                category: "experience_info",
              },
              nat_geo_tour_levels: {
                value: "NAT_GEO_TOUR_LEVEL_ENTRY",
                required: true,
                category: "experience_settings",
              },
              meeting_point_details: {
                value: "",
                required: false,
                category: "experience_location",
              },
              markets: {
                value: [],
                required: false,
                category: "segmentation_details",
              },
              collection_criteria: {
                exceptional_experiences: {
                  value: "test",
                  required: false,
                  category: "experience_settings",
                },
                best_value_guaranteed: {
                  value: "test",
                  required: false,
                  category: "experience_settings",
                },
                created_with_care: {
                  value: "test",
                  required: false,
                  category: "experience_settings",
                },
              },
            },
            data: {
              ...mockPayload,
              offerExperience: mockOfferExperience,
              options: [],
              experience_id: "test-id",
              supplier_id: "test-supplier-id",
              product_type: "NOVA",
            },
          },
        },
      };

      expect(store.submitEnabled("test-id")).toBe(true);
    });

    test("isSaving", async () => {
      expect(store.isSaving).toBe(false);
      store.updateRawDocument("test-id");
      expect(store.isSaving).toBe(true);
      await store.updateRawDocument("test-id");
      expect(store.isSaving).toBe(false);
    });
  });

  describe("actions", () => {
    describe("createDocument", () => {
      test("it should create a new document in the store based on the data passed", () => {
        const rawData: ExperienceRawData = {
          ...mockPayload,
          offerExperience: mockOfferExperience,
          options: [],
          supplier_id: "test-supplier-id",
          product_type: "NOVA",
        };
        store.createDocument("new-document", rawData, "NOVA");

        expect(store.rawContents["new-document"]).toBeTruthy();
        expect(store.rawContents["new-document"].fields.asterix_id.value).toBe(mockPayload.functional?.asterix_id);
        expect(store.rawContents["new-document"].fields.option.value).toBe(mockPayload.functional?.options?.[0]?.code);
        expect(store.rawContents["new-document"].fields.title.value).toBe(mockPayload.commercial?.title);
        expect(store.rawContents["new-document"].fields.description.value).toBe(mockPayload.commercial?.description);

        expect(store.rawContents["new-document"].fields.included.value).toStrictEqual({
          premade: [{ id: "included 2" }],
          custom: [],
        });

        expect(store.rawContents["new-document"].data).toStrictEqual(rawData);
      });
    });

    describe("updateRawDocument", () => {
      beforeAll(() => {
        mockedUseExperienceRawApi.getDistributionContent = vi.fn().mockResolvedValue({
          data: { curation_level: "DEDICATED", priority: 1 },
        });
      });
      test("it should correctly submit the updated document", async () => {
        const mockTestId = "test-id";
        const experience = store.rawContents[mockTestId];
        Object.assign(experience.data, getExperienceRawInitialValues(), {
          id: "raw-exp-id",
          experience_id: mockTestId,
        });

        experience.fields.title.value = "test title";
        experience.fields.markets.value = ["new-market"];

        await store.updateRawDocument("test-id");

        expect(mockedDistributionAttributes.saveData).toHaveBeenCalledWith("test-id");
        expect(experience.modified).toBe(false);
        expect(experienceApiMock.updateExperienceRaw).toHaveBeenCalled();
        expect(experienceApiMock.updateExperienceRaw).toHaveBeenCalledWith("raw-exp-id", {
          experience_id: "test-id",
          commercial: {
            title: "test title",
          },
          functional: {
            markets: ["new-market"],
          },
        } satisfies Partial<RawElement>);
      });

      describe("when the document id doesn't exist in the store", () => {
        test("it should not call the api", async () => {
          await store.updateRawDocument("wrong-id");

          expect(experienceApiMock.updateExperienceRawV2).not.toHaveBeenCalled();
        });
      });

      describe("when there is an error during the api call", () => {
        test("it should not reset the modified flag", async () => {
          vi.spyOn(experienceApiMock, "updateExperienceRaw").mockImplementationOnce(() => Promise.reject());

          try {
            await store.updateRawDocument("test-id");
          } catch (error) {
            // do nothing...
          }

          expect(store.rawContents["test-id"].modified).toBe(true);
        });
      });

      describe("Experience update saves only changed fields (with experience_id since it is required by the endpoint)", () => {
        test("When an experience's title is modified, only the title change is saved", async () => {
          const mockTestId = "test-id";
          const experience = store.rawContents[mockTestId];
          Object.assign(experience.data, getExperienceRawInitialValues(), {
            flow_code: "BASE",
            status_code: RawStatusCode.IN_CREATION,
          });

          experience.fields.title.value = "test title";
          await store.updateRawDocument("test-id");

          expect(experience.modified).toBe(false);
          expect(experienceApiMock.updateExperienceRaw).toHaveBeenCalled();
          expect(experienceApiMock.updateExperienceRaw).toHaveBeenCalledWith("raw-exp-id", {
            experience_id: "test-id",
            commercial: {
              title: "test title",
            },
          });
        });

        test("After updating the experience, the experience.data should reflect the correct changes", async () => {
          const mockTestId = "test-id";
          const experience = store.rawContents[mockTestId];
          // Mock the initial fetched experience data
          experience.data = Object.assign(experience.data, getExperienceRawInitialValues(), {
            id: "raw-exp-id",
            experience_id: mockTestId,
            status_code: RawStatusCode.IN_CREATION,
            commercial: {
              description: "initial description",
            },
            functional: {
              additional_services: ["OWN_OFFER_TUI_DESIGNED_OPERATED", "DURATION_OVER_12", "DURATION_OVERNIGHT"],
              highlights: ["skip_this_higlight_bec_not_updated"],
            },
          });

          // Set highlights (not changed)
          experience.fields.highlights.value.premade = [
            {
              id: "skip_this_higlight_bec_not_updated",
              name: "skip_this_higlight_bec_not_updated",
              code: "skip_this_higlight_bec_not_updated",
              visualization_order: 0,
            },
          ];
          // Update the description
          experience.fields.description.value = "updated description";
          // Update the additional services
          experience.fields.additional_services.value = [
            "OWN_OFFER_TUI_DESIGNED_OPERATED",
            "DURATION_OVER_12",
            "DURATION_OVERNIGHT",
            "UPDATED_ADDITIONAL_SERVICE",
          ];

          await store.updateRawDocument(mockTestId);

          expect(experienceApiMock.updateExperienceRaw).toHaveBeenCalled();
          // Only the description and additional_services should be updated
          expect(experienceApiMock.updateExperienceRaw).toHaveBeenCalledWith("raw-exp-id", {
            experience_id: mockTestId,
            commercial: {
              description: "updated description",
            },
            functional: {
              additional_services: [
                "OWN_OFFER_TUI_DESIGNED_OPERATED",
                "DURATION_OVER_12",
                "DURATION_OVERNIGHT",
                "UPDATED_ADDITIONAL_SERVICE",
              ],
            },
          });

          // Update additional services and save again
          experience.fields.additional_services.value = ["OWN_OFFER_TUI_DESIGNED_OPERATED"];
          await store.updateRawDocument(mockTestId);

          // Only additional_services should be updated as we didn't change anything else
          expect(experienceApiMock.updateExperienceRaw).toHaveBeenCalledWith("raw-exp-id", {
            experience_id: mockTestId,
            functional: {
              additional_services: ["OWN_OFFER_TUI_DESIGNED_OPERATED"],
            },
          });
        });
      });

      describe("status_code changes", () => {
        test("it should'nt call updateExperienceRaw endpoint if there is no change", async () => {
          const mockTestId = "test-id";
          const experience = store.rawContents[mockTestId];

          Object.assign(experience.data, getExperienceRawInitialValues(), {
            id: "raw-exp-id",
            experience_id: mockTestId,
            status_code: RawStatusCode.IN_CREATION,
          });

          // save
          await store.updateRawDocument(mockTestId);

          // we shouldn't call
          expect(experienceApiMock.updateExperienceRaw).not.toHaveBeenCalled();
        });

        test("it should'nt set status_code if current status_code has not changed", async () => {
          const mockTestId = "test-id";
          const experience = store.rawContents[mockTestId];

          Object.assign(experience.data, getExperienceRawInitialValues(), {
            id: "raw-exp-id",
            experience_id: mockTestId,
            status_code: RawStatusCode.IN_CREATION,
          });

          experience.fields.title.value = "updated title";

          await store.updateRawDocument(mockTestId);

          expect(experienceApiMock.updateExperienceRaw).toHaveBeenCalled();
          expect(experienceApiMock.updateExperienceRaw).toHaveBeenCalledWith("raw-exp-id", {
            experience_id: "test-id",
            commercial: {
              title: "updated title",
            },
          });
        });

        test("it should transition to SENT_TO_REVIEW when user clicks publish (submit experience)", async () => {
          const mockTestId = "test-id";
          const experience = store.rawContents[mockTestId];
          Object.assign(experience.data, getExperienceRawInitialValues(), {
            id: "raw-exp-id",
            experience_id: mockTestId,
            status_code: RawStatusCode.IN_CREATION,
          });

          await store.updateRawDocument(mockTestId, { publish: true });

          expect(experienceApiMock.updateExperienceRaw).toHaveBeenCalled();
          expect(experienceApiMock.updateExperienceRaw).toHaveBeenCalledWith("raw-exp-id", {
            experience_id: "test-id",
            status_code: RawStatusCode.SENT_TO_REVIEW,
          });
        });

        test("it should transition to IN_REVIEW when a user edits a raw experience that is currently UP_TO_DATE", async () => {
          const mockTestId = "test-id";
          const experience = store.rawContents[mockTestId];
          Object.assign(experience.data, getExperienceRawInitialValues(), {
            id: "raw-exp-id",
            experience_id: mockTestId,
            status_code: RawStatusCode.UP_TO_DATE,
          });

          experience.fields.title.value = "updated title";

          // save
          await store.updateRawDocument(mockTestId);

          expect(experienceApiMock.updateExperienceRaw).toHaveBeenCalled();
          expect(experienceApiMock.updateExperienceRaw).toHaveBeenCalledWith("raw-exp-id", {
            experience_id: "test-id",
            commercial: {
              title: "updated title",
            },
            status_code: RawStatusCode.IN_REVIEW,
          });
        });

        test("it should transition to IN_REVIEW when a user edits a raw experience that is currently SENT_TO_REVIEW", async () => {
          const mockTestId = "test-id";
          const experience = store.rawContents[mockTestId];
          Object.assign(experience.data, getExperienceRawInitialValues(), {
            id: "raw-exp-id",
            experience_id: mockTestId,
            status_code: RawStatusCode.SENT_TO_REVIEW,
          });

          experience.fields.title.value = "updated title";

          // save
          await store.updateRawDocument(mockTestId);

          expect(experienceApiMock.updateExperienceRaw).toHaveBeenCalled();
          expect(experienceApiMock.updateExperienceRaw).toHaveBeenCalledWith("raw-exp-id", {
            experience_id: "test-id",
            commercial: {
              title: "updated title",
            },
            status_code: RawStatusCode.IN_REVIEW,
          });
        });
      });
    });

    describe("it should correctly handle the collection criteria when updating the document", () => {
      test("if the selected brand is 'tui collection' it should use the collection criteria form the store", async () => {
        const mockTestId = "test-id";
        const experience = store.rawContents[mockTestId];
        Object.assign(experience.data, getExperienceRawInitialValues(), {
          flow_code: "BASE",
          status_code: RawStatusCode.IN_CREATION,
        });

        experience.fields.product_brand.value = BRAND_TUI_COLLECTION;
        experience.fields.collection_criteria.best_value_guaranteed.value = "new best_value_guaranteed";
        experience.fields.collection_criteria.created_with_care.value = "new created_with_care";
        experience.fields.collection_criteria.exceptional_experiences.value = "new exceptional_experiences";

        await store.updateRawDocument(mockTestId);

        expect(experienceApiMock.updateExperienceRaw).toHaveBeenCalledWith("raw-exp-id", {
          collection_criteria: {
            best_value_guaranteed: "new best_value_guaranteed",
            created_with_care: "new created_with_care",
            exceptional_experiences: "new exceptional_experiences",
          },
          experience_id: "test-id",
          functional: {
            additional_services: ["BRAND_TUI_COLLECTION"],
          },
        });
      });

      test("if the selected brand is not 'tui collection' it should remove the collection criteria even if present in the store", async () => {
        const mockTestId = "test-id";
        const experience = store.rawContents[mockTestId];

        Object.assign(experience.data, getExperienceRawInitialValues(), {
          collection_criteria: { best_value_guaranteed: "random value", created_with_care: "random value" },
          flow_code: "BASE",
          status_code: RawStatusCode.IN_CREATION,
          functional: {
            additional_services: [BRAND_TUI_COLLECTION],
          },
        });

        experience.fields.product_brand.value = "NOT_TUI_COLLECTION";

        await store.updateRawDocument(mockTestId);
        expect(experienceApiMock.updateExperienceRaw).toHaveBeenLastCalledWith("raw-exp-id", {
          collection_criteria: {
            best_value_guaranteed: "",
            created_with_care: "",
          },
          experience_id: "test-id",
          functional: {
            additional_services: ["NOT_TUI_COLLECTION"],
          },
        });
      });
    });

    describe("getRawDocument", () => {
      test("it should fetch the raw document based on the id", async () => {
        await store.getRawDocument("random-id");

        expect(store.rawContents["random-id"]).toBeTruthy();
        expect(store.rawContents["random-id"].fields.asterix_id.value).toBe(mockPayload.functional?.asterix_id);
        expect(store.rawContents["random-id"].fields.title.value).toBe(mockPayload.commercial.title);

        // it should init the location fields
        expect(useExperienceLocationStoreMock.initLocationFields).toHaveBeenCalledOnce();
        // it should init the booking info fields
        expect(useBookingInformationStoreMock.initFields).toHaveBeenCalledOnce();
        // it should fetch the refund policies data
        expect(loadRefundPoliciesSpy).toHaveBeenCalledOnce();
      });

      test("it should load the offer experience if the product type is NOVA", async () => {
        await store.getRawDocument("random-id");

        expect(mockOfferServiceApi.getExperience).toHaveBeenCalled();
      });

      test("it should not load the offer experience if the product type is not NOVA", async () => {
        vi.stubGlobal("useNuxtData", () => ({ data: { value: { experience_source: "ASX" } } }));

        await store.getRawDocument("random-id");

        expect(mockOfferServiceApi.getExperience).not.toHaveBeenCalled();
      });

      describe("when there is an error during the api call", () => {
        test("it should not create the document in the store", async () => {
          vi.spyOn(experienceApiMock, "getExperienceRawV2ByExperienceId").mockImplementationOnce(() =>
            Promise.reject()
          );

          try {
            await store.getRawDocument("random-id");
          } catch (error) {
            // do nothing...
          }
          expect(store.rawContents["random-id"]).toBeFalsy();
        });
      });
    });

    describe("deleteRawDocument", () => {
      test("it should correctly delete document", async () => {
        await store.deleteRawDocument("experience_id");

        expect(experienceApiMock.deleteDistributionContent).toHaveBeenCalled();
        expect(experienceApiMock.deleteDistributionContent).toHaveBeenCalledWith("experience_id");
      });

      describe("when there is an error during the api call", () => {
        test("it should not reset the modified flag", async () => {
          store.rawContents["test-id"].modified = false;

          vi.spyOn(experienceApiMock, "deleteDistributionContent").mockRejectedValueOnce("error");

          expect(store.deleteRawDocument("experience_id")).rejects.toThrow();

          expect(store.rawContents["test-id"].modified).toBeFalsy();
        });
      });
    });
  });

  describe("validateAsterixAdapterInformation", () => {
    test.each([undefined, null])(
      "it should return false when the value is %s",
      (value: RawAsterixAdapterInformation[] | null | undefined) => {
        const result = validateAsterixAdapterInformation(value!);

        expect(result).toBe(false);
      }
    );

    test("it should return false when the given value is an empty array", () => {
      const result = validateAsterixAdapterInformation([]);

      expect(result).toBe(false);
    });

    test("it should return false when any of the items' code is a blank string", () => {
      const inputData: RawAsterixAdapterInformation[] = [
        {
          code: "A CODE",
          modality_codes: ["A CODE"],
        },
        {
          code: "",
          modality_codes: ["A CODE"],
        },
      ];

      const result = validateAsterixAdapterInformation(inputData);

      expect(result).toBe(false);
    });

    test("it should return false when any of the items' modality codes is empty", () => {
      const inputData: RawAsterixAdapterInformation[] = [
        {
          code: "A CODE",
          modality_codes: ["A CODE"],
        },
        {
          code: "A CODE",
          modality_codes: [],
        },
      ];

      const result = validateAsterixAdapterInformation(inputData);

      expect(result).toBe(false);
    });

    test("it should return true when all of the items contains the required information", () => {
      const inputData: RawAsterixAdapterInformation[] = [
        {
          code: "A CODE",
          modality_codes: ["A CODE"],
        },
        {
          code: "A CODE",
          modality_codes: ["A CODE"],
        },
      ];

      const result = validateAsterixAdapterInformation(inputData);

      expect(result).toBe(true);
    });
  });
});
