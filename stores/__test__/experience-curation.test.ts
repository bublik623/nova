/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-promise-reject-errors */
import { setActivePinia, createPinia } from "pinia";
import { describe, expect, test, beforeEach, vi, beforeAll, afterEach } from "vitest";
import { useExperienceCuration } from "@/stores/experience-curation";
import { AvailableLanguage } from "@/types/Language";
import { Experience, ExperienceType } from "@/types/generated/OfferServiceApiOld";
import * as getAllCustomHighlightsMock from "@/features/experience-highlights/lib/get-all-custom-highlights";
import * as commitCustomHighlightsMock from "@/features/experience-highlights/lib/commit-custom-highlights";
import { GenericHighlight } from "@/types/Highlights";
import { mockCustomHighlightsPayload } from "@/features/experience-highlights/lib/__mocks__/mock-custom-highlights-payload";
import * as mixedHighlights from "@/utils/mixed-highlights";
import { DistributionContent, RawSnapshot, Snapshot } from "@/types/generated/ExperienceRawServiceApi";

vi.stubGlobal("refreshNuxtData", () => {});
const useNuxtDataMock = vi.fn<(key: string) => { data: { value: Partial<DistributionContent> } } | undefined>(
  (key: string) => {
    if (key.includes("getDistributionContent")) {
      return {
        data: { value: { supplier_id: "test-supplier-id" } },
      };
    }
  }
);
vi.stubGlobal("useNuxtData", useNuxtDataMock);

const availableLanguages = new Set<AvailableLanguage>([
  "en",
  "es",
  "it",
  "de",
  "fr",
  "nl",
  "pl",
  "pt",
  "ru",
  "dk",
  "no",
  "fi",
  "se",
]);

const automaticTranslationLanguages = new Set<AvailableLanguage>(["es"]);

const mockCommercialContent = {
  experience_translations: [
    {
      id: "id-translation",
      language_code: "en",
    },
  ],
};

const mockContentCommandPayload = {
  id: "id-translation",
  title: "test title",
  seo_title: "test seo title",
  text1: "test description",
  seo_description: "test seo description",
  info_voucher: "test info voucher",
};

const masterdataStoreMock = {
  availableLanguages,
  automaticTranslationLanguages,
  getHighlightByCode: vi.fn(() => {
    return {
      code: "default-highlight-mock",
    };
  }),
  getAdditionalServicesByFGCode: vi.fn((code: string) => {
    switch (code) {
      case "DURATION":
        return [{ code: "DURATION_2_4" }];
      case "OWN_OFFER":
        return [{ code: "OWN_OFFER_CODE" }];
      case "NAT_GEO_TOUR_LEVELS":
        return [{ code: "NAT_GEO_TOUR_LEVELS" }];
      default:
        return [];
    }
  }),
};

const contentCommandApiMock = {
  getTranslation: vi.fn(),
  getTranslations: vi.fn(),
  putTranslation: vi.fn(() => Promise.resolve({})),
  translateExperience: vi.fn(),
  _axiosInstance: {
    post: vi.fn(),
  },
  getExperienceCommercialContent: vi.fn(),
  putCustomHighlight: vi.fn(),
  postCustomHighlight: vi.fn(),
  deleteCustomHighlight: vi.fn(),
  getCustomHighlights: vi.fn(() => {
    return {
      customHighlights: mockCustomHighlightsPayload("highlights"),
      customImportantInformation: mockCustomHighlightsPayload("important_information"),
      customIncluded: mockCustomHighlightsPayload("included"),
      customNonIncluded: mockCustomHighlightsPayload("non_included"),
    };
  }),
  publishTranslation: vi.fn(),
};

const metadataExperienceApiMock = {
  get: vi.fn(),
  put: vi.fn(),
  post: vi.fn(() => {
    return {
      headers: {
        location: "",
      },
    };
  }),
  del: vi.fn(),
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

const mockOfferServiceApi = {
  getExperienceOptions: vi.fn(() => {
    return Promise.resolve([]);
  }),
  getExperience: vi.fn(),
  updateExperience: vi.fn(() => Promise.resolve()),
  deleteExperience: vi.fn(() => Promise.resolve()),
};

const mockManageableHighlightData: GenericHighlight[] = [
  {
    name: "Custom highlight 1",
    action: "NOOP",
    id: "dfad345f-97c8-498c-ba63-ff160328019c",
    visualization_order: 0,
    language_code: "en",
    code: "code",
  },
  {
    name: "Custom highlight 2",

    action: "NOOP",
    id: "b2964fbc-0af4-45b3-87b4-89bad65f2363",
    visualization_order: 1,
    language_code: "en",
    code: "code",
  },
  {
    name: "Custom highlight 3",
    action: "NOOP",
    id: "c8c9fce0-a2f3-45ee-8f37-d6c217882b2f",
    visualization_order: 2,
    language_code: "en",
    code: "code",
  },
];

const useExperienceLocationStoreMock = {
  loadLocation: vi.fn(),
  loadVenues: vi.fn(),
  loadAdditionalCities: vi.fn(),
};
const useBookingInformationStoreMock = {
  loadBookingInfo: vi.fn(),
};

vi.mock("@/features/experience-shared/stores/useBookingInformationStore", () => ({
  useBookingInformationStore: () => useBookingInformationStoreMock,
}));

vi.mock("@/features/experience-shared/stores/useExperienceLocationStore", () => ({
  useExperienceLocationStore: () => useExperienceLocationStoreMock,
}));

vi.mock("@/stores/master-data", () => ({
  useMasterData: () => masterdataStoreMock,
}));

vi.mock("@/composables/useContentCommandApi", () => ({
  useContentCommandApi: () => contentCommandApiMock,
}));

vi.mock("@/composables/useMetadataExperienceApi", () => ({
  useMetadataExperienceApi: () => metadataExperienceApiMock,
}));

vi.mock("@/composables/useOfferServiceApi", () => ({
  useOfferServiceApi: () => mockOfferServiceApi,
}));

const mockRawSnapshot: RawSnapshot = {
  id: "1",
  raw: {
    status_code: "IN_CREATION",
    flow_code: "BASE",
    experience_id: "mock-exp-id",
    commercial: {
      title: "updated title",
      custom_highlights: [
        {
          name: "custom diff 1",
          code: "custom-diff-1",
        },
      ],
    },
    functional: {
      highlights: ["diff-1"],
    },
  },
};

const mockTranslationSnapshotData: Snapshot = {
  id: "test id",
  reference_code: "test short reference code",
  experience_id: "1",
  experience_commercial_information: {
    experience_media: {
      id: "1",
      flow_code: "BASE",
      status_code: "UP_TO_DATE",
      images: [],
    },
    translations: [
      {
        language_code: "en",
        experience_translation: {
          id: "1",
          title: "Test ",
          text1: "Test ",
          text2: "test ",
          text3: "test ",
          seo_title: "SEO test title ",
          seo_description: "SEO Description for Experience",
          info_voucher: "test ",
          meeting_point_details: "test ",
          flow_code: "BASE",
          status_code: "BEING_CURATED",
          name: "Sample Experience",
        },
      },
    ],
  },
};

const mockExperienceRawApi = {
  getMostRecentRawSnapshot: vi.fn(() => ({ data: mockRawSnapshot })),
  getLastTwoSnapshots: vi.fn(() => ({ data: [mockTranslationSnapshotData, mockTranslationSnapshotData] })),
};

vi.mock("@/composables/useExperienceRawApi", () => ({
  useExperienceRawApi: () => mockExperienceRawApi,
}));

vi.mock("@/features/core-shared/composables/useLogger", () => ({
  useLogger: () => ({ logError: vi.fn() }),
}));

vi.spyOn(getAllCustomHighlightsMock, "getAllCustomHighlights").mockImplementation(() =>
  Promise.resolve({
    custom_highlights: mockManageableHighlightData,
    custom_important_information: mockManageableHighlightData,
    custom_included: mockManageableHighlightData,
    custom_non_included: mockManageableHighlightData,
  })
);

vi.spyOn(commitCustomHighlightsMock, "commitCustomHighlights").mockImplementation(() => Promise.resolve([]));

describe("Experience Curation Store", () => {
  setActivePinia(createPinia());
  const store = useExperienceCuration();

  beforeAll(() => {
    store.$reset();
  });

  beforeEach(() => {
    vi.spyOn(contentCommandApiMock, "getTranslation").mockImplementationOnce(() =>
      Promise.resolve({
        data: mockContentCommandPayload,
      })
    );
    vi.spyOn(contentCommandApiMock, "getTranslations").mockImplementationOnce(() =>
      Promise.resolve({
        data: [mockContentCommandPayload],
      })
    );
    vi.spyOn(contentCommandApiMock, "getExperienceCommercialContent").mockImplementationOnce(() =>
      Promise.resolve({
        data: [mockCommercialContent],
      })
    );
    vi.spyOn(metadataExperienceApiMock, "get").mockImplementationOnce(() =>
      Promise.resolve({
        data: [{ markets: ["test-market"], id: "id-market" }],
      })
    );
    vi.spyOn(metadataExperienceApiMock, "get").mockImplementationOnce(() =>
      Promise.resolve({
        data: [
          {
            interests: ["INTEREST-1", "INTEREST-2"],
            id: "id-interests",
          },
        ],
      })
    );

    vi.spyOn(metadataExperienceApiMock, "get").mockImplementationOnce(() =>
      Promise.resolve({
        data: [
          {
            categories: ["CATEGORY"],
            id: "id-categories",
          },
        ],
      })
    );
    vi.spyOn(metadataExperienceApiMock, "get").mockImplementationOnce(() =>
      Promise.resolve({
        data: [
          {
            additional_services: ["DURATION_2_4", "OWN_OFFER_CODE", "NAT_GEO_TOUR_LEVELS"],
            id: "id-additional-services",
          },
        ],
      })
    );
    vi.spyOn(metadataExperienceApiMock, "get").mockImplementationOnce(() =>
      Promise.resolve({
        data: [
          {
            important_information: ["important-information"],
            id: "id-important-information",
          },
        ],
      })
    );
    vi.spyOn(metadataExperienceApiMock, "get").mockImplementationOnce(() =>
      Promise.resolve({
        data: [{ non_included: ["non-included"], id: "id-non-included" }],
      })
    );
    vi.spyOn(metadataExperienceApiMock, "get").mockImplementationOnce(() =>
      Promise.resolve({
        data: [{ included: ["included"], id: "id-included" }],
      })
    );
    vi.spyOn(metadataExperienceApiMock, "get").mockImplementationOnce(() =>
      Promise.resolve({
        data: [{ highlights: ["highlight"], id: "id-highlights" }],
      })
    );
    vi.spyOn(mockOfferServiceApi, "getExperience").mockResolvedValueOnce({
      data: mockOfferExperience,
    });

    store.$reset();
  });

  afterEach(() => {
    vi.clearAllMocks();
    store.$reset();
  });

  describe("actions", () => {
    describe("mapDataToHighlights", () => {
      test("it should map data to highlights correctly", () => {
        const highlightType = "highlights";
        const premadeData = ["highlight-1", "highlight-2"];
        const customsData = [
          { id: "custom-1", name: "Custom Highlight 1", action: "CREATE" },
          { id: "custom-2", name: "Custom Highlight 2", action: "CREATE" },
          { id: "custom-3", name: "Custom Highlight 3", action: "CREATE" },
        ];

        const result = store.mapDataToHighlights(highlightType, premadeData, customsData);

        expect(result.premade).toHaveLength(2);
        expect(result.custom).toHaveLength(3);
      });

      test("it should return empty arrays when no data is provided", () => {
        const highlightType = "highlights";

        const result = store.mapDataToHighlights(highlightType);

        expect(result.premade).toHaveLength(0);
        expect(result.custom).toHaveLength(0);
      });
    });
    describe("diff", () => {
      test("highlights should have correct properties", async () => {
        await store.getCurationDocument("random-id");

        expect(store.diff).toHaveProperty("highlights");
        expect(store.diff.highlights).toMatchObject({
          custom: [
            {
              action: "NOOP",
              code: "custom-diff-1",
              name: "custom diff 1",
              visualization_order: 0,
            },
          ],
          premade: [
            {
              code: "default-highlight-mock",
            },
          ],
        });
        expect(store.diff.included).toMatchObject({
          premade: [],
          custom: [],
        });
        expect(store.diff.non_included).toMatchObject({
          premade: [],
          custom: [],
        });
        expect(store.diff.important_information).toMatchObject({
          premade: [],
          custom: [],
        });
      });
    });
    describe("getCurationDocument", () => {
      test("it should fetch the curation document based on the id", async () => {
        masterdataStoreMock.getHighlightByCode
          .mockImplementationOnce(() => ({
            code: "highlight-1",
          }))
          .mockImplementationOnce(() => ({
            code: "included-1",
          }));

        await store.getCurationDocument("random-id");

        expect(store.curationDocuments["random-id"]).toBeTruthy();
        expect(store.curationDocuments["random-id"].fields.title).toStrictEqual({
          value: mockContentCommandPayload.title,
          category: "experience_settings",
          required: true,
        });
        expect(store.curationDocuments["random-id"].fields.included).toStrictEqual({
          value: {
            premade: [
              {
                code: "included-1",
              },
            ],
            custom: mockManageableHighlightData,
          },
          category: "experience_info",
          required: true,
          validator: mixedHighlights.mixedHighlightListValidator,
        });
        expect(store.curationDocuments["random-id"].fields.info_voucher).toStrictEqual({
          value: mockContentCommandPayload.info_voucher,
          category: "voucher",
          required: false,
        });

        expect(store.curationDocuments["random-id"].data).toStrictEqual({
          ...mockContentCommandPayload,
          ...mockOfferExperience,
          supplier_id: "test-supplier-id",
        });

        expect(store.curationDocuments["random-id"].fields.highlights.value.custom.length).toBe(3);

        expect(store.rawSnapshot).toMatchObject<RawSnapshot>({
          id: "1",
          raw: {
            experience_id: "mock-exp-id",
            commercial: { title: "updated title" },
            status_code: "IN_CREATION",
            flow_code: "BASE",
          },
        });
      });

      describe("when there is an error during the api call", () => {
        beforeEach(() => {
          vi.spyOn(contentCommandApiMock, "getTranslations").mockImplementationOnce(() => Promise.reject());
        });

        test("it should not create the document in the store", async () => {
          try {
            await store.getCurationDocument("random-id");
          } catch (error) {
            // do nothing...
          }
          expect(store.curationDocuments["random-id"]).toBeFalsy();
        });
      });

      describe("when the optional fields are missing", () => {
        beforeEach(() => {
          vi.spyOn(contentCommandApiMock, "getTranslations").mockImplementationOnce(() =>
            Promise.resolve({ data: [{ title: "test title" }] })
          );
          vi.spyOn(metadataExperienceApiMock, "get").mockImplementation(() =>
            Promise.resolve({
              data: {
                highlights: [{ highlights: "highlight" }],
                included: [{ included: "included" }],
                non_included: [{ non_included: "non-included" }],
              },
            })
          );

          store.$reset();
        });

        test("it should apply the default values", async () => {
          await store.getCurationDocument("random-id");

          expect(store.curationDocuments["random-id"]).toBeTruthy();
          expect(store.curationDocuments["random-id"].fields.seo_title.value).toBe("");
          expect(store.curationDocuments["random-id"].fields.description.value).toBe("");
          expect(store.curationDocuments["random-id"].fields.seo_description.value).toBe("");
          expect(store.curationDocuments["random-id"].fields.important_information.value).toStrictEqual({
            premade: [],
            custom: mockManageableHighlightData,
          });
        });
      });
      test("it should fetch location and booking info", async () => {
        await store.getCurationDocument("random-id");

        expect(useBookingInformationStoreMock.loadBookingInfo).toHaveBeenCalled();
        expect(useExperienceLocationStoreMock.loadLocation).toHaveBeenCalled();
        expect(useExperienceLocationStoreMock.loadAdditionalCities).toHaveBeenCalled();
        expect(useExperienceLocationStoreMock.loadVenues).toHaveBeenCalled();
      });

      describe("when Experience Type is `Product loaded from asterix`", () => {
        test("it should not retrieve data from offer-experience", async () => {
          useNuxtDataMock.mockImplementationOnce((key) => {
            if (key.includes("getDistributionContent")) {
              return { data: { value: { experience_source: "ASX" } } };
            }
          });

          await store.getCurationDocument("an experience id");

          expect(mockOfferServiceApi.getExperience).not.toHaveBeenCalled();
        });
      });
    });

    describe("update curation document", () => {
      test("it should correctly save the document", async () => {
        masterdataStoreMock.getHighlightByCode
          .mockImplementationOnce(() => ({
            code: "highlight-1",
          }))
          .mockImplementationOnce(() => ({
            code: "included-1",
          }));

        await store.getCurationDocument("random-id");

        store.curationDocuments["random-id"].fields.title.value = "new title";
        store.curationDocuments["random-id"].fields.description.value = "new description";
        store.curationDocuments["random-id"].fields.additional_description.value = "new additional description";

        store.curationDocuments["random-id"].fields.included.value.premade = [
          {
            id: "new-included",
            name: "new included",
            visualization_order: 0,
            code: "new-included",
          },
        ];
        store.curationDocuments["random-id"].fields.non_included.value.premade = [
          {
            id: "new-non-included",
            name: "new non included",
            visualization_order: 0,
            code: "new-non-included",
          },
        ];
        store.curationDocuments["random-id"].fields.important_information.value.premade = [
          {
            id: "new-important-information",
            name: "new important information",
            visualization_order: 0,
            code: "new-important-information",
          },
        ];
        store.curationDocuments["random-id"].fields.additional_services.value = ["DURATION_2_4"];
        store.curationDocuments["random-id"].fields.own_offer.value = "OWN_OFFER_CODE";
        store.curationDocuments["random-id"].fields.categories_interests.value.categories = ["NEW-CATEGORY"];
        store.curationDocuments["random-id"].fields.categories_interests.value.interests = ["NEW-INTEREST"];

        expect(store.curationDocuments["random-id"].modified).toBe(false);

        store.curationDocuments["random-id"].fields.highlights.value.custom[0] = {
          ...store.curationDocuments["random-id"].fields.highlights.value.custom[0],
          action: "EDIT",
          name: "Edited highlight name",
        };

        store.curationDocuments["random-id"].fields.highlights.value.custom.push({
          id: "999",
          name: "New Custom Highlight",
          action: "CREATE",
          visualization_order: 0,
        });
        store.curationDocuments["random-id"].fields.highlights.value.custom.push({
          id: "delete-custom-highlight",
          name: "New Custom Highlight",
          action: "DELETE",
          visualization_order: 0,
        });

        store.curationDocuments["random-id"].fields.highlights.value.premade.push({
          id: "111",
          name: "Premade Highlight",
          code: "111",
          visualization_order: 0,
        });

        store.curationDocuments["random-id"].fields.meeting_point_details.value = "test meeting";

        await store.updateCurationDocument("random-id");

        expect(commitCustomHighlightsMock.commitCustomHighlights).toHaveBeenCalledTimes(4);

        expect(contentCommandApiMock.putTranslation).toHaveBeenCalled();
        expect(contentCommandApiMock.putTranslation).toHaveBeenCalledWith("experience-translations/id-translation", {
          curation_quality: false,
          experience_id: "random-id",
          language_code: "en",
          seo_description: "test seo description",
          seo_title: "test seo title",
          text1: "new description",
          text2: "new additional description",
          meeting_point_details: "test meeting",
          info_voucher: "test info voucher",
          title: "new title",
          status_code: "IN_REVIEW",
          flow_code: "CURATION",
        });
        expect(metadataExperienceApiMock.put).toHaveBeenCalled();

        expect(metadataExperienceApiMock.put).toHaveBeenCalledTimes(8);

        expect(metadataExperienceApiMock.put).toHaveBeenNthCalledWith(1, "experience-highlights/id-highlights", {
          experience_id: "random-id",
          highlights: ["highlight-1", "111"],
          language_code: "en",
        });

        expect(metadataExperienceApiMock.put).toHaveBeenNthCalledWith(2, "experience-included/id-included", {
          experience_id: "random-id",
          included: ["new-included"],
          language_code: "en",
        });

        expect(metadataExperienceApiMock.put).toHaveBeenNthCalledWith(3, "experience-non-included/id-non-included", {
          experience_id: "random-id",
          non_included: ["new-non-included"],
          language_code: "en",
        });

        expect(metadataExperienceApiMock.put).toHaveBeenNthCalledWith(
          4,
          "experience-important-information/id-important-information",
          {
            experience_id: "random-id",
            important_information: ["new-important-information"],
            language_code: "en",
          }
        );

        expect(metadataExperienceApiMock.put).toHaveBeenNthCalledWith(
          5,
          "experience-additional-services/id-additional-services",
          {
            experience_id: "random-id",
            additional_services: ["OWN_OFFER_CODE", "NAT_GEO_TOUR_LEVELS", "DURATION_2_4"],
            language_code: "en",
          }
        );

        expect(metadataExperienceApiMock.put).toHaveBeenNthCalledWith(6, "experience-categories/id-categories", {
          experience_id: "random-id",
          categories: ["NEW-CATEGORY"],
          language_code: "en",
        });

        expect(metadataExperienceApiMock.put).toHaveBeenNthCalledWith(7, "experience-interests/id-interests", {
          experience_id: "random-id",
          interests: ["NEW-INTEREST"],
          language_code: "en",
        });
        expect(metadataExperienceApiMock.put).toHaveBeenNthCalledWith(8, "experience-markets/id-market", {
          experience_id: "random-id",
          markets: ["test-market"],
          language_code: "en",
        });
      });

      test("if a call fail it should display the error", async () => {
        await store.getCurationDocument("random-id");

        vi.spyOn(metadataExperienceApiMock, "put").mockImplementationOnce(() => Promise.reject());

        try {
          await store.updateCurationDocument("random-id");
        } catch (error) {
          // Do nothing
        }
      });

      describe("status_code changes", () => {
        test("it should update the status_code to IN_REVIEW when updating curation document", async () => {
          await store.getCurationDocument("random-id");
          await store.updateCurationDocument("random-id");

          expect(store.curationDocuments["random-id"].data.status_code).toBe("IN_REVIEW");
        });

        test("it should not update the status_code if the updateCurationDocument fails", async () => {
          await store.getCurationDocument("random-id");

          store.curationDocuments["random-id"].data.status_code = "READY";
          vi.spyOn(contentCommandApiMock, "putTranslation").mockImplementationOnce(() =>
            Promise.reject(new Error("Update failed"))
          );

          await expect(store.updateCurationDocument("random-id")).rejects.toThrow();
          expect(store.curationDocuments["random-id"].data.status_code).toBe("READY");
        });

        test("it should update the status_code to READY when publishing curation experience", async () => {
          await store.getCurationDocument("random-id");
          store.curationDocuments["random-id"].data.status_code = "IN_REVIEW";

          await store.publishCurationExperience("random-id");

          expect(store.curationDocuments["random-id"].data.status_code).toBe("READY");
        });

        test("it should not update the status_code if publish fails", async () => {
          await store.getCurationDocument("random-id");
          store.curationDocuments["random-id"].data.status_code = "IN_REVIEW";

          vi.spyOn(contentCommandApiMock, "publishTranslation").mockImplementationOnce(() =>
            Promise.reject(new Error("Publish failed"))
          );

          await expect(store.publishCurationExperience("random-id")).rejects.toThrow();
          expect(store.curationDocuments["random-id"].data.status_code).toBe("IN_REVIEW");
        });
      });

      describe("if the id of one relation is missing and the payload is not empty", () => {
        test("it should do a post request", async () => {
          vi.spyOn(metadataExperienceApiMock, "get")
            .mockReturnValueOnce({
              data: [{ highlights: ["highlight"] }],
            })
            .mockReturnValueOnce({
              data: [{ included: ["included"] }],
            })
            .mockReturnValueOnce({
              data: [{ non_included: [] }],
            })
            .mockReturnValueOnce({
              data: [{ important_information: ["important_information"] }],
            });

          await store.getCurationDocument("random-id");

          store.curationDocuments["random-id"].fields.included.value.premade = [
            {
              id: "new value",
              name: "new value",
              code: "new value",
              visualization_order: 0,
            },
          ];

          await store.updateCurationDocument("random-id");

          expect(metadataExperienceApiMock.post).toHaveBeenCalledWith("experience-included", {
            experience_id: "random-id",
            included: ["new value"],
            language_code: "en",
          });
        });

        test("if the post fail it should display the error", async () => {
          vi.spyOn(metadataExperienceApiMock, "get")
            .mockReturnValueOnce({
              data: [{ highlights: ["highlight"] }],
            })
            .mockReturnValueOnce({
              data: [{ included: ["included"] }],
            })
            .mockReturnValueOnce({
              data: [{ non_included: [] }],
            })
            .mockReturnValueOnce({
              data: [{ important_information: ["important_information"] }],
            });

          await store.getCurationDocument("random-id");

          store.curationDocuments["random-id"].fields.included.value.premade = [
            {
              id: "new value",
              code: "new value",
              name: "new value",
              visualization_order: 0,
            },
          ];

          vi.spyOn(metadataExperienceApiMock, "post").mockImplementationOnce(() => Promise.reject());

          try {
            await store.updateCurationDocument("random-id");
          } catch (error) {
            // do nothing...
          }
        });
      });
      describe("if the payload is missing", () => {
        test("if also the id is missing it should not do any put/post request", async () => {
          vi.spyOn(metadataExperienceApiMock, "get")
            .mockReturnValueOnce({
              data: [{ highlights: [] }],
            })
            .mockReturnValueOnce({
              data: [{ included: [] }],
            })
            .mockReturnValueOnce({
              data: [{ non_included: [] }],
            })
            .mockReturnValueOnce({
              data: [{ important_information: [] }],
            });

          await store.getCurationDocument("random-id");

          store.curationDocuments["random-id"].fields.description.value = "new value";

          await store.updateCurationDocument("random-id");

          expect(contentCommandApiMock.putTranslation).toHaveBeenCalled();
          expect(metadataExperienceApiMock.put).not.toHaveBeenCalled();
          expect(metadataExperienceApiMock.post).not.toHaveBeenCalled();
        });

        test("if the id is present it should delete the entity", async () => {
          await store.getCurationDocument("random-id");
          store.curationDocuments["random-id"].fields.included.value.premade = [];
          store.curationDocuments["random-id"].fields.description.value = "new value";

          await store.updateCurationDocument("random-id");
          expect(contentCommandApiMock.putTranslation).toHaveBeenCalled();
          expect(metadataExperienceApiMock.del).toHaveBeenCalledOnce();
        });
      });
    });

    describe("publishCurationExperience", () => {
      test("it should call the correct endpoint and update the status", async () => {
        await store.getCurationDocument("random-id");
        await store.publishCurationExperience("random-id", true);

        expect(contentCommandApiMock.publishTranslation).toHaveBeenCalledWith("random-id", "en", true);
        expect(store.curationDocuments["random-id"].data.status_code).toBe("READY");
      });
    });
  });

  describe("getters", () => {
    test("requiredFields", async () => {
      masterdataStoreMock.getHighlightByCode
        .mockImplementationOnce(() => ({
          code: "highlight-1",
        }))
        .mockImplementationOnce(() => ({
          code: "included-1",
        }));

      await store.getCurationDocument("random-id");
      expect(store.requiredFields("random-id")).toStrictEqual({
        title: {
          value: "test title",
          required: true,
          category: "experience_settings",
        },
        seo_title: {
          value: "test seo title",
          required: true,
          category: "experience_settings",
        },
        description: {
          value: "test description",
          required: true,
          category: "experience_info",
        },
        seo_description: {
          value: "test seo description",
          required: true,
          category: "experience_info",
        },
        highlights: {
          value: {
            custom: mockManageableHighlightData,
            premade: [
              {
                code: "highlight-1",
              },
            ],
          },
          required: true,
          category: "experience_info",
          validator: mixedHighlights.mixedHighlightListValidator,
        },
        included: {
          value: {
            custom: mockManageableHighlightData,
            premade: [
              {
                code: "included-1",
              },
            ],
          },
          required: true,
          category: "experience_info",
          validator: mixedHighlights.mixedHighlightListValidator,
        },
        additional_services: {
          value: ["DURATION_2_4"],
          required: true,
          category: "property_and_relevance",
        },
        own_offer: {
          category: "experience_settings",
          required: true,
          value: "OWN_OFFER_CODE",
        },
        currency: {
          category: "experience_pricing_and_availability",
          required: true,
          value: "USD",
        },
      });
      expect(store.submitEnabled("random-id")).toBe(true);
    });
    test("submitEnabled", async () => {
      await store.getCurationDocument("random-id");
      expect(store.submitEnabled("random-id")).toBe(true);
      store.curationDocuments["random-id"].fields.title.value = "";
      expect(store.submitEnabled("random-id")).toBe(false);
    });
  });
});
