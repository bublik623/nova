/* eslint-disable prefer-promise-reject-errors */
import { setActivePinia, createPinia } from "pinia";
import { describe, expect, test, beforeEach, vi } from "vitest";
import { useMasterData } from "@/stores/master-data";
import { CategoryType, CategoryGroupType, Market } from "@/types/generated/ExperienceMasterDataApi";

const mockPremades = [
  {
    id: "9a496345-148e-4460-93a4-8f9ac9be79b2",
    code: "SPEEDBOATRIDE",
    hierarchical_group_code: "FEATURE",
    name: "Speedboat ride",
    language_code: "en",
  },
];

const mockCategories: CategoryGroupType[] = [
  {
    id: "75d5a37f-73ee-4899-b029-eee1fd6517d0",
    code: "ACTIVITIES",
    name: "activities",
    language_code: "en",
  },
  {
    id: "146a7eec-498a-4ef2-a071-68d0c5a1c1f7",
    code: "BOAT_TRIPS",
    name: "Boat trips",
    language_code: "en",
  },
];

const mockInterests: CategoryType[] = [
  {
    code: "AIR_ACTIVITIES",
    name: "Air activities",
    language_code: "en",
    id: "f628e0ad-92b0-4e1f-859c-cd47c10127e7",
    category_group_code: "",
  },
  {
    code: "CLASSES_AND_WORKSHOPS",
    name: "Classes & workshops",
    language_code: "en",
    id: "7e5547d6-f1f0-4a77-be3a-f312977accae",
    category_group_code: "",
  },
];

const mockMarkets: Market[] = [
  {
    id: "0bd69cfb-adc5-482d-8047-c7288d580c69",
    language_code: "en",
    code: "bo-2b",
    name: "Booking.com Market",
    category: "Booking.com",
  },
  {
    id: "234433c6-e939-4854-87f0-741949349079",
    language_code: "en",
    code: "br-2c",
    name: "Brazil",
    category: "B2C Musement",
  },
  {
    id: "ef467d4b-95f9-4296-9ade-0006035d8126",
    language_code: "en",
    code: "de-2c",
    name: "Germany",
    category: "B2C Musement",
  },
  {
    id: "b238f18f-dd7a-454f-ac33-e8f8d574b555",
    language_code: "en",
    code: "be-tx",
    name: "TUI B2C Belgium (French, Wallonia)",
    category: "B2C TUI",
  },
];

const notificationStoreMock = {
  addNotification: vi.fn(),
  deleteNotification: vi.fn(),
  error: {
    theme: "error",
    message: "notifications.error.fetching.master.data",
  },
  success: {
    theme: "success",
    message: "notifications.error.fetching.master.data",
  },
};

const masterDataApiMock = {
  getPremades: vi.fn(),
  getCategories: vi.fn(),
  getInterests: vi.fn(),
  getMarkets: vi.fn(),
  getHierarchicalGroups: vi.fn(),
};

const contractMasterDataApiMock = {
  getCurrencies: vi.fn(),
  getSuppliers: vi.fn(),
};

const mockCities = [
  {
    id: "403be0f5-b40b-4df0-a7f8-5e9eb9e11641",
    code: "DBV",
    name: "Dubrovnik",
    country_code_alpha2: "hr",
    language_code: "en",
  },
  {
    id: "fe668778-341f-4918-bcb4-c213e0d1d2fd",
    code: "SPU",
    name: "Split",
    country_code_alpha2: "hr",
    language_code: "en",
  },
];

const mockCountries = [
  {
    id: "0a7af766-1670-49b2-b754-f755ee7c9f97",
    iso_code_alpha2: "CV",
    iso_code_alpha3: "CPV",
    iso_code_numeric: 132,
    name: "Cabo Verde",
    language_code: "pt",
    description: "Cabo Verde",
    country_calling_codes: [238],
  },
  {
    id: "ca080b2d-a420-43bf-b109-25f7f3b26c09",
    iso_code_alpha2: "KH",
    iso_code_alpha3: "KHM",
    iso_code_numeric: 116,
    name: "Cambodia",
    language_code: "km",
    description: "Cambodia",
    country_calling_codes: [855],
  },
];

const mockHierarchicalGroups = [
  {
    id: "517751e1-4570-4837-bbeb-e4cd71e0524c",
    language_code: "en",
    code: "MEALS",
    name: "MEALS",
    parent_code: "HIGHLIGHTS",
  },
  { id: "d36c9da5-4cc4-4476-b0f2-5bdad06f1728", language_code: "en", code: "HIGHLIGHTS", name: "Highlights" },
];

const geoMasterdataApiMock = {
  getCities: vi.fn(),
  getCountries: vi.fn(),
  getVenuesByCityCode: vi.fn(),
};

const mockCurrencies = [
  {
    code: "USD",
    description: "US Dollar",
    name: "US Dollar",
    symbol: "$",
  },
  {
    code: "EUR",
    description: "Euro",
    name: "Euro",
    symbol: "€",
  },
];

const mockSuppliers = [
  {
    id: "supplier_1",
    source: "NOVA",
    name: "supplier 1",
    email: "supplier1@suppliers.su",
    commission: 0,
  },
  {
    id: "supplier_2",
    source: "BP",
    name: "supplier 2",
    email: "supplier2@suppliers.su",
    commission: 1,
  },
];

vi.mock("@/stores/notifications", () => ({
  useNotifications: () => notificationStoreMock,
}));

vi.mock("@/composables/useExperienceMasterDataApi", () => ({
  useExperienceMasterDataApi: () => masterDataApiMock,
}));

vi.mock("@/features/core-shared/composables/useGeoMasterDataApi", () => ({
  useGeoMasterDataApi: () => geoMasterdataApiMock,
}));

vi.mock("@/features/experience-masterdata/api/useContractMasterDataApi", () => ({
  useContractMasterDataApi: () => contractMasterDataApiMock,
}));

const loggerMock = { logError: vi.fn() };

vi.mock("@/features/core-shared/composables/useLogger", () => ({
  useLogger: () => loggerMock,
}));

describe("Experience Master Data", () => {
  setActivePinia(createPinia());
  const store = useMasterData();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(masterDataApiMock, "getPremades").mockResolvedValue({
      data: mockPremades,
    });
    vi.spyOn(masterDataApiMock, "getCategories").mockResolvedValue({
      data: mockCategories,
    });
    vi.spyOn(masterDataApiMock, "getInterests").mockResolvedValue({
      data: mockInterests,
    });
    vi.spyOn(masterDataApiMock, "getMarkets").mockResolvedValue({
      data: mockMarkets,
    });
    vi.spyOn(masterDataApiMock, "getHierarchicalGroups").mockResolvedValue({
      data: mockHierarchicalGroups,
    });

    vi.spyOn(geoMasterdataApiMock, "getCountries").mockResolvedValue({
      data: mockCountries,
    });
    vi.spyOn(geoMasterdataApiMock, "getCities").mockResolvedValue({
      data: mockCities,
    });
    vi.spyOn(contractMasterDataApiMock, "getCurrencies").mockResolvedValue({
      data: mockCurrencies,
    });
    vi.spyOn(contractMasterDataApiMock, "getSuppliers").mockResolvedValue({
      data: mockSuppliers,
    });

    store.$reset();
  });

  describe("actions", () => {
    describe("getMasterData", () => {
      test("it should fetch the raw document based on the id", async () => {
        await store.getMasterData();

        expect(store.highlights).toBeTruthy();
        expect(store.highlights.length).toBe(1);
        expect(store.included).toBeTruthy();
        expect(store.included.length).toBe(1);
        expect(store.importantInformation).toBeTruthy();
        expect(store.importantInformation.length).toBe(1);

        expect(store.geoCities.length).toBe(2);
        expect(store.geoCountries.length).toBe(2);

        expect(store.hierarchicalGroups.size).toBe(2);

        expect(store.currencies.length).toBe(2);
        expect(store.suppliers.length).toBe(2);
      });

      describe("when there is an error during the api call", () => {
        test("it should not update the state", async () => {
          vi.spyOn(masterDataApiMock, "getPremades").mockImplementationOnce(() => Promise.reject());

          await store.getMasterData();

          expect(store.highlights.length).toBe(0);
          expect(store.included.length).toBe(0);
          expect(store.importantInformation.length).toBe(0);

          expect(notificationStoreMock.addNotification).toHaveBeenCalledWith(notificationStoreMock.error);
        });

        test("it should log the error", async () => {
          vi.spyOn(masterDataApiMock, "getPremades").mockImplementationOnce(() =>
            Promise.reject(new Error("test-error"))
          );

          await store.getMasterData();

          expect(loggerMock.logError).toHaveBeenCalledWith("master-data", new Error("test-error"));
        });
      });
    });

    describe("getCategoriesAndInterests", () => {
      test("it should fetch the correct data", async () => {
        await store.getCategoriesAndInterests();

        expect(store.experienceCategories).toBeTruthy();
        expect(store.experienceCategories.length).toBe(mockCategories.length);
        expect(store.experienceCategories[0]).toStrictEqual(mockCategories[0]);
        expect(store.experienceCategories[1]).toStrictEqual(mockCategories[1]);
        expect(store.experienceInterests).toBeTruthy();
        expect(store.experienceInterests.length).toBe(mockInterests.length);
        expect(store.experienceInterests[0]).toStrictEqual(mockInterests[0]);
        expect(store.experienceInterests[1]).toStrictEqual(mockInterests[1]);
      });

      describe("when there is an error during the api call", () => {
        test("it should not update the state", async () => {
          vi.spyOn(masterDataApiMock, "getCategories").mockImplementationOnce(() => Promise.reject());

          await store.getCategoriesAndInterests();

          expect(store.experienceCategories.length).toBe(0);
          expect(store.experienceInterests.length).toBe(0);

          expect(notificationStoreMock.addNotification).toHaveBeenCalledWith(notificationStoreMock.error);
        });

        test("it should log the error", async () => {
          vi.spyOn(masterDataApiMock, "getCategories").mockImplementationOnce(() =>
            Promise.reject(new Error("test-error"))
          );

          await store.getCategoriesAndInterests();

          expect(loggerMock.logError).toHaveBeenCalledWith("master-data", new Error("test-error"));
        });
      });
    });

    describe("getMarkets", () => {
      test("it should fetch the correct data", async () => {
        await store.getMarkets();

        expect(store.markets).toBeTruthy();
        expect(store.markets.length).toBe(mockMarkets.length);
      });

      describe("when there is an error during the api call", () => {
        test("it should not update the state", async () => {
          vi.spyOn(masterDataApiMock, "getMarkets").mockImplementationOnce(() => Promise.reject());

          await store.getMarkets();

          expect(store.markets.length).toBe(0);

          expect(notificationStoreMock.addNotification).toHaveBeenCalledWith(notificationStoreMock.error);
        });

        test("it should log the error", async () => {
          vi.spyOn(masterDataApiMock, "getMarkets").mockImplementationOnce(() =>
            Promise.reject(new Error("test-error"))
          );

          await store.getMarkets();

          expect(loggerMock.logError).toHaveBeenCalledWith("master-data", new Error("test-error"));
        });
      });
    });

    describe("getVenuesByCityCode", () => {
      test("it should fetch venues by city code correctly", async () => {
        const mockVenues = [
          {
            address: "Piazza San Marco, 1",
            city: "DBV",
            code: "DBV1",
            id: "b65f834e-817e-449d-a256-44b2f8d64b79",
            language_code: "en",
            latitude: 45.433639,
            longitude: 63.598854,
            name: "DBV example 1",
          },
        ];

        vi.spyOn(geoMasterdataApiMock, "getVenuesByCityCode").mockResolvedValue({ data: mockVenues });

        const venues = await store.getVenuesByCityCode(["DBV"]);

        expect(venues).toBeTruthy();
        expect(venues.length).toBe(mockVenues.length);
        expect(venues[0]).toStrictEqual(mockVenues[0]);
      });

      test("it should handle errors when fetching venues by city code", async () => {
        const error = new Error("test-error");
        geoMasterdataApiMock.getVenuesByCityCode.mockRejectedValueOnce(error);

        await store.getVenuesByCityCode(["DBV"]);

        expect(loggerMock.logError).toHaveBeenCalledWith("master-data", error);
        expect(notificationStoreMock.addNotification).toHaveBeenCalledWith(notificationStoreMock.error);
      });
    });
  });
  describe("getter", () => {
    test("getCityByCode works correctly", async () => {
      await store.getMasterData();

      const status = store.getCityByCode("DBV");
      expect(status).toStrictEqual(mockCities[0]);
    });

    describe("getHighlightByCode", () => {
      const data = [
        {
          code: "highlight-1",
          id: "highlight-1",
          language_code: "en",
          name: "highlight-1",
        },
        {
          code: "highlight-2",
          id: "highlight-2",
          language_code: "en",
          name: "highlight-2",
        },
      ];

      beforeEach(() => {
        store.$reset();
        store.highlights = data;
      });

      test("it should return the correct highlight", () => {
        expect(store.getHighlightByCode("highlights", "highlight-1")).toStrictEqual(data[0]);
      });

      test("it should error if no highlight is found", () => {
        expect(() => store.getHighlightByCode("highlights", "highlight-error")).toThrowError(
          "Could not find highlight of type 'highlights' with code highlight-error in master data store"
        );
      });
    });

    describe("GetCountryByCode", () => {
      test("it should return the correct country", async () => {
        await store.getMasterData();
        expect(store.getCountryByCode("kh")?.name).toEqual("Cambodia");
      });

      describe("if there is no country with that code", () => {
        store.$reset();

        test("it should throw an error", () => {
          try {
            store.getCountryByCode("will-error");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (error: any) {
            expect(error.message).toBe("Could not find any country with code will-error in master data store.");
          }
        });
      });
    });

    describe("GetCurrencies", () => {
      beforeEach(() => {
        store.$reset();
        store.currencies = mockCurrencies;
      });

      test.each([
        {
          value: "EUR",
          expected: {
            code: "EUR",
            description: "Euro",
            name: "Euro",
            symbol: "€",
          },
        },
        {
          value: "USD",
          expected: {
            code: "USD",
            description: "US Dollar",
            name: "US Dollar",
            symbol: "$",
          },
        },
      ])("should return the correct currency based on the initial value", ({ value, expected }) => {
        expect(store.getCurrencyByCode(value)).toEqual(expected);
      });
    });

    describe("getHierarchicalGroupsByPremadesList", () => {
      beforeEach(() => {
        store.hierarchicalGroups = new Map<string, any>([
          ["MEALS", mockHierarchicalGroups[0]],
          ["HIGHLIGHTS", mockHierarchicalGroups[1]],
        ]);
      });

      test("should return an empty array if premadeList is undefined", () => {
        expect(store.getHierarchicalGroupsByPremadesList(undefined as any)).toEqual([]);
      });

      test("should return an empty array if premadeList is empty", () => {
        expect(store.getHierarchicalGroupsByPremadesList([])).toEqual([]);
      });

      test("should remove duplicate hierarchical groups", () => {
        const premadeList = [
          {
            id: "1",
            code: "SPEEDBOATRIDE",
            hierarchical_group_code: "MEALS",
            name: "Speedboat ride",
            language_code: "en",
          },
          {
            id: "2",
            code: "SPEEDBOATRIDE",
            hierarchical_group_code: "MEALS",
            name: "Speedboat ride duplicate",
            language_code: "en",
          },
          {
            id: "3",
            code: "SPEEDBOATRIDE",
            hierarchical_group_code: "HIGHLIGHTS",
            name: "Highlight group",
            language_code: "en",
          },
          {
            id: "4",
            code: "SPEEDBOATRIDE",
            hierarchical_group_code: "MEALS",
            name: "Another duplicate for MEALS",
            language_code: "en",
          },
        ];

        const result = store.getHierarchicalGroupsByPremadesList(premadeList);
        expect(result.length).toBe(2);

        const groupCodes = result.map((group) => group.code);
        expect(groupCodes).toContain("MEALS");
        expect(groupCodes).toContain("HIGHLIGHTS");
      });

      test("should filter out premades with non-existing hierarchical group codes", () => {
        const premadeList = [
          {
            id: "1",
            code: "SPEEDBOATRIDE",
            hierarchical_group_code: "NON_EXISTENT",
            name: "Invalid group",
            language_code: "en",
          },
          {
            id: "2",
            code: "SPEEDBOATRIDE",
            hierarchical_group_code: "HIGHLIGHTS",
            name: "Valid group",
            language_code: "en",
          },
        ];

        const result = store.getHierarchicalGroupsByPremadesList(premadeList);
        expect(result.length).toBe(1);
        expect(result[0].code).toBe("HIGHLIGHTS");
      });
    });
  });
});
