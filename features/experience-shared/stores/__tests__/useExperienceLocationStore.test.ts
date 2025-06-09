import { describe, expect, test, vi, beforeEach } from "vitest";
import { createPinia } from "pinia";
import { ExperienceLocationData, useExperienceLocationStore } from "../../stores/useExperienceLocationStore";
import { ExperienceLocation } from "@/types/generated/MetadataExperiencesApi";
import { City } from "@/types/generated/GeoMasterDataApi";

const metadataServiceMock = {
  getLocation: vi.fn(),
  createLocation: vi.fn(),
  updateLocation: vi.fn(),
  deleteLocation: vi.fn(),
  createAdditionalCities: vi.fn(),
  getAdditionalCitiesById: vi.fn(),
  deleteAdditionalCities: vi.fn(),
  updateAdditionalCities: vi.fn(),
  getVenuesById: vi.fn(),
  createVenues: vi.fn(),
  updateVenues: vi.fn(),
  deleteVenues: vi.fn(),
};

const mockVenues = [
  {
    address: "Piazza San Marco, 1",
    city: "DBV",
    code: "DBV1",
    id: "test-venues-id",
    language_code: "en",
    latitude: 45.433639,
    longitude: 63.598854,
    name: "DBV example 1",
  },
  {
    address: "Piazza San Marco, 1",
    city: "ZAD",
    code: "ZAD1",
    id: "test-venues-id",
    language_code: "en",
    latitude: 45.433639,
    longitude: 63.598854,
    name: "ZAD example 1",
  },
];

const masterDataStoreMock = {
  getCountryByCode: vi.fn(() => ({
    id: "fa09257c-f91e-4970-b41d-95aacb41a604",
    iso_code_alpha2: "HR",
    iso_code_alpha3: "HRV",
    iso_code_numeric: 191,
    name: "Spain",
    language_code: "hr",
    description: "Croatia",
    country_calling_codes: [385],
  })),
  geoCities: [
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
    {
      id: "caa5ccbe-ec6c-4bfc-931a-fb2698953c43",
      code: "ZAD",
      name: "Zadar",
      country_code_alpha2: "hr",
      language_code: "en",
    },
    {
      id: "74bcc363-c46d-43ed-ad3b-7fdf1d14c308",
      code: "AGP",
      name: "Malaga",
      country_code_alpha2: "es",
      language_code: "en",
    },
  ],
  geoCountries: [
    {
      id: "fa09257c-f91e-4970-b41d-95aacb41a604",
      iso_code_alpha2: "HR",
      iso_code_alpha3: "HRV",
      iso_code_numeric: 191,
      name: "Croatia",
      language_code: "hr",
      description: "Croatia",
      country_calling_codes: [385],
    },
    {
      id: "bdfd5912-b0bb-4ac6-87a9-fca9a22ff150",
      iso_code_alpha2: "ES",
      iso_code_alpha3: "ESP",
      iso_code_numeric: 724,
      name: "Spain",
      language_code: "es",
      description: "Spain",
      country_calling_codes: [34],
    },
  ],
  getVenuesByCityCode: vi.fn().mockResolvedValue(mockVenues),
};

const geoMasterDataMock = {
  getVenuesByCityCode: vi.fn(),
};

vi.mock("@/composables/useMetadataExperienceApi.ts", () => ({
  useMetadataExperienceApi: () => metadataServiceMock,
}));

vi.mock("@/stores/master-data", () => ({
  useMasterData: () => masterDataStoreMock,
}));

vi.mock("@/features/core-shared/composables/useGeoMasterDataApi.ts", () => ({
  useGeoMasterDataApi: () => geoMasterDataMock,
}));

const createExperienceLocation = ({
  name,
  city,
  country,
  direction,
  postalCode,
  latitude,
  longitude,
}: {
  name: string;
  city: string;
  country: string;
  latitude?: string;
  longitude?: string;
  direction?: string;
  postalCode?: string;
}): ExperienceLocation => ({
  id: "location-id-1",
  experience_id: "test-experience",
  name,
  ...(latitude && { latitude }),
  ...(longitude && { longitude }),
  address: {
    city,
    country,
    ...(postalCode && { postal_code: postalCode }),
    ...(direction && { direction: direction }),
  },
});

const createExampleCity = () => {
  const exampleCity: City = {
    country_code_alpha2: "es",
    name: "Malaga",
    code: "AGP",
    language_code: "en",
  };
  return exampleCity;
};

describe("useExperienceLocationStore", () => {
  test("loadLocation loads data and initializes fields", async ({ expect }) => {
    const exampleCity = createExampleCity();
    metadataServiceMock.getLocation = vi.fn().mockResolvedValue({
      data: {
        ...createExperienceLocation({
          name: exampleCity.name,
          city: exampleCity.code,
          country: "Spain",
          direction: "direction text",
          latitude: "9.1",
          longitude: "9.1",
          postalCode: "06010",
        }),
        id: "test-id",
      },
    });

    const pinia = createPinia();
    const store = useExperienceLocationStore(pinia);

    await store.loadLocation("test-experience");

    expect(store.isLoading).toBe(false);

    expect(store.locationId).toBe("test-id");

    // fields
    expect(store.fields.city.value).toMatchObject(exampleCity);
    expect(store.fields.address.value).toMatchObject({
      direction: "direction text",
      latitude: 9.1,
      longitude: 9.1,
      postalCode: "06010",
    });
  });

  test("saveLocation creates a new location", async ({ expect }) => {
    const exampleCity = createExampleCity();
    metadataServiceMock.createLocation = vi.fn().mockResolvedValue({
      headers: { location: "/location/location-id-new" },
      data: "location-id-new",
    });

    const pinia = createPinia();
    const store = useExperienceLocationStore(pinia);

    store.fields.city.value = exampleCity;
    store.fields.address.value = {
      direction: "direction text",
      latitude: 9,
      longitude: 9,
      postalCode: "06010",
    };

    await store.saveLocation("test-experience");

    expect(store.isSaving).toBe(false);
    expect(metadataServiceMock.createLocation).toHaveBeenCalledWith({
      experience_id: "test-experience",
      name: exampleCity.name,
      latitude: "9",
      longitude: "9",
      address: {
        city: exampleCity.code,
        country: "Spain",
        direction: "direction text",
        postal_code: "06010",
      },
    });

    // check if the relation id is stored correctly
    expect(store.locationId).toBe("location-id-new");
  });

  test("saveLocation updates an existing location", async ({ expect }) => {
    const exampleCity = createExampleCity();
    metadataServiceMock.getLocation = vi.fn().mockResolvedValue({
      data: createExperienceLocation({
        name: exampleCity.name,
        city: exampleCity.code,
        country: "Spain",
      }),
    });

    const pinia = createPinia();
    const store = useExperienceLocationStore(pinia);
    await store.loadLocation("test-experience");

    store.fields.city.value = exampleCity;

    await store.saveLocation("test-experience");

    expect(store.isSaving).toBe(false);
    expect(metadataServiceMock.updateLocation).toHaveBeenCalledWith("location-id-1", {
      experience_id: "test-experience",
      name: exampleCity.name,
      address: {
        city: exampleCity.code,
        country: "Spain",
      },
    });
  });

  test("saveLocation deletes a location when user removes active city", async ({ expect }) => {
    const exampleCity = createExampleCity();
    metadataServiceMock.getLocation = vi.fn().mockResolvedValue({
      data: createExperienceLocation({
        name: exampleCity.name,
        city: exampleCity.code,
        country: "Spain",
      }),
    });

    const pinia = createPinia();
    const store = useExperienceLocationStore(pinia);
    await store.loadLocation("test-experience");

    // remove selected city
    store.fields.city.value = null;

    await store.saveLocation("test-experience");

    expect(metadataServiceMock.deleteLocation).toHaveBeenCalledWith("location-id-1");
  });

  describe("initAdditionalCitiesField", () => {
    test("should initialize additional cities correctly", () => {
      const pinia = createPinia();
      const store = useExperienceLocationStore(pinia);
      const cityCodes = ["DBV", "SPU"];

      store.initAdditionalCitiesField(cityCodes);

      expect(store.fields.additionalCities.value).toEqual([
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
      ]);
    });

    test("should not add cities that don't exist in masterDataStore", () => {
      const pinia = createPinia();
      const store = useExperienceLocationStore(pinia);
      const cityCodes = ["DBV", "INVALID", "SPU"];

      store.initAdditionalCitiesField(cityCodes);

      expect(store.fields.additionalCities.value).toEqual([
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
      ]);
    });
  });

  describe("getAdditionalCitiesPayload", () => {
    test("should return an array of city codes", () => {
      const pinia = createPinia();
      const store = useExperienceLocationStore(pinia);
      const cityCodes = ["DBV", "SPU"];

      store.initAdditionalCitiesField(cityCodes);

      const payload = store.getAdditionalCitiesPayload();

      expect(payload).toEqual(["DBV", "SPU"]);
    });

    test("should return an empty array if no additional cities are set", () => {
      const pinia = createPinia();
      const store = useExperienceLocationStore(pinia);

      const payload = store.getAdditionalCitiesPayload();

      expect(payload).toEqual([]);
    });
  });

  describe("resetFields", () => {
    test("should reset all fields", async () => {
      const pinia = createPinia();
      const store = useExperienceLocationStore(pinia);
      const cityCodes = ["DBV", "SPU"];

      store.initAdditionalCitiesField(cityCodes);
      await store.$reset();

      expect(store.fields.additionalCities.value).toEqual([]);
      expect(store.fields.city.value).toBeNull();
      expect(store.fields.address.value).toEqual({
        direction: "",
        latitude: 0,
        longitude: 0,
        postalCode: "",
      });
      expect(store.fields.venues.value).toEqual([]);
    });
  });

  describe("isFormValid", () => {
    test("isFormValid should return true if the fields are not empty/valid", () => {
      const pinia = createPinia();
      const store = useExperienceLocationStore(pinia);
      const exampleCity = createExampleCity();

      store.fields.city.value = exampleCity;

      expect(store.isFormValid).toBe(true);
    });

    test("isFormValid should return false if the fields are valid", () => {
      const pinia = createPinia();
      const store = useExperienceLocationStore(pinia);

      store.fields.city.value = null;

      expect(store.isFormValid).toBe(false);
    });
  });

  describe("initFields", () => {
    test("initFields should initialize the fields with the data", async ({ expect }) => {
      const exampleCity = createExampleCity();
      metadataServiceMock.getLocation = vi.fn().mockResolvedValue({
        data: createExperienceLocation({
          name: exampleCity.name,
          city: exampleCity.code,
          country: "Spain",
        }),
      });
      const pinia = createPinia();
      const store = useExperienceLocationStore(pinia);

      const data = createExperienceLocation({
        name: exampleCity.name,
        city: exampleCity.code,
        country: "Spain",
        direction: "direction text",
        latitude: "9.1",
        longitude: "9.1",
        postalCode: "06010",
      });
      store.initLocationFields(data);

      expect(store.fields.city.value).toMatchObject(exampleCity);
      expect(store.fields.address.value).toMatchObject({
        direction: "direction text",
        latitude: 9.1,
        longitude: 9.1,
        postalCode: "06010",
      });
    });
  });

  describe("getLocationPayload", () => {
    test("getLocationPayload should return the payload", () => {
      const pinia = createPinia();
      const store = useExperienceLocationStore(pinia);

      const exampleCity = createExampleCity();
      const data = createExperienceLocation({
        name: exampleCity.name,
        city: exampleCity.code,
        country: "Spain",
        direction: "direction text",
        latitude: "9.1",
        longitude: "9.1",
        postalCode: "06010",
      });
      store.initLocationFields(data);

      const payload = store.getLocationPayload();

      expect(payload).toMatchObject<ExperienceLocationData>({
        name: exampleCity.name,
        address: {
          city: exampleCity.code,
          country: "Spain",
          direction: "direction text",
          postal_code: "06010",
        },
        latitude: "9.1",
        longitude: "9.1",
      });
    });
  });

  describe("state and getters", () => {
    test("hasCoordinates should be true if lat and lng values are valid", () => {
      const pinia = createPinia();
      const store = useExperienceLocationStore(pinia);

      expect(store.hasCoordinates).toBe(false);

      store.fields.address.value = {
        latitude: 1,
        longitude: 1,
        direction: "1",
        postalCode: "01234",
      };

      expect(store.hasCoordinates).toBe(true);
    });
  });

  describe("Additional Cities", () => {
    test("should create additional cities if none exist", async ({ expect }) => {
      const exampleCity = createExampleCity();
      metadataServiceMock.createAdditionalCities = vi.fn().mockResolvedValue({
        data: "additional-cities-id-new",
      });

      const pinia = createPinia();
      const store = useExperienceLocationStore(pinia);

      store.fields.additionalCities.value = [exampleCity];

      await store.saveAdditionalCities("test-experience");

      expect(store.isSaving).toBe(false);
      expect(metadataServiceMock.createAdditionalCities).toHaveBeenCalledWith("test-experience", {
        experience_id: "test-experience",
        additional_cities: [exampleCity.code],
      });
    });
    test("should initialize additional cities correctly with multiple cities", () => {
      const pinia = createPinia();
      const store = useExperienceLocationStore(pinia);
      const cityCodes = ["DBV", "SPU", "AGP"];

      store.initAdditionalCitiesField(cityCodes);

      expect(store.fields.additionalCities.value).toEqual([
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
        {
          id: "74bcc363-c46d-43ed-ad3b-7fdf1d14c308",
          code: "AGP",
          name: "Malaga",
          country_code_alpha2: "es",
          language_code: "en",
        },
      ]);
    });

    test("should not add cities that don't exist in masterDataStore", () => {
      const pinia = createPinia();
      const store = useExperienceLocationStore(pinia);
      const cityCodes = ["DBV", "INVALID", "SPU"];

      store.initAdditionalCitiesField(cityCodes);

      expect(store.fields.additionalCities.value).toEqual([
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
      ]);
    });

    test("should update existing additional cities", async ({ expect }) => {
      const exampleCity = createExampleCity();
      metadataServiceMock.updateAdditionalCities = vi.fn().mockResolvedValue({});

      metadataServiceMock.getAdditionalCitiesById = vi.fn().mockResolvedValue({
        data: {
          id: "test-id",
          additional_cities: ["SPU"],
        },
      });

      const pinia = createPinia();
      const store = useExperienceLocationStore(pinia);

      await store.loadAdditionalCities("test-experience");

      store.fields.additionalCities.value = [exampleCity];
      await store.saveAdditionalCities("test-experience");

      expect(store.isSaving).toBe(false);
      expect(metadataServiceMock.updateAdditionalCities).toHaveBeenCalledWith("test-experience", "test-id", {
        experience_id: "test-experience",
        additional_cities: [exampleCity.code],
      });
    });

    test("should delete location successfully", async () => {
      const pinia = createPinia();
      const store = useExperienceLocationStore(pinia);

      metadataServiceMock.getAdditionalCitiesById = vi.fn().mockResolvedValue({
        data: {
          id: "test-id",
          additional_cities: ["SPU"],
        },
      });

      await store.loadAdditionalCities("test-experience");

      store.fields.additionalCities.value = [];

      await store.saveAdditionalCities("test-id");

      expect(metadataServiceMock.deleteAdditionalCities).toHaveBeenCalledWith("test-id");
    });
  });

  describe("Venues", () => {
    let pinia;
    let store: ReturnType<typeof useExperienceLocationStore>;

    const initializeStoreWithCity = () => {
      const data = createExperienceLocation({
        name: "Dubrovnik",
        city: "DBV",
        country: "Spain",
        direction: "direction text",
        latitude: "9.1",
        longitude: "9.1",
        postalCode: "06010",
      });
      store.initLocationFields(data);
    };

    beforeEach(() => {
      pinia = createPinia();
      store = useExperienceLocationStore(pinia);
      initializeStoreWithCity();
    });

    test("should initialize venues correctly", async () => {
      geoMasterDataMock.getVenuesByCityCode = vi.fn().mockResolvedValue([mockVenues[0]]);
      const venueCodes = ["DBV1"];

      await store.initVenuesField(venueCodes);

      expect(store.fields.venues.value).toEqual([mockVenues[0].code]);
    });

    test("getVenuesPayload should return an array of venue codes", async () => {
      geoMasterDataMock.getVenuesByCityCode = vi.fn().mockResolvedValue(mockVenues);
      const venueCodes = ["DBV1", "ZAD1"];

      await store.initVenuesField(venueCodes);
      const payload = store.getVenuesPayload();

      expect(payload).toEqual(venueCodes);
    });

    test("should create venues if none exist", async () => {
      metadataServiceMock.createVenues = vi.fn().mockResolvedValue({
        data: "venues-id-new",
      });

      store.fields.venues.value = [mockVenues[0].code, mockVenues[1].code];

      await store.saveVenues("test-experience");

      expect(store.isSaving).toBe(false);
      expect(metadataServiceMock.createVenues).toHaveBeenCalledWith("test-experience", {
        experience_id: "test-experience",
        venues: [mockVenues[0].code, mockVenues[1].code],
      });
    });

    test("should update existing venues", async () => {
      metadataServiceMock.updateVenues = vi.fn().mockResolvedValue({});
      metadataServiceMock.getVenuesById = vi.fn().mockResolvedValue({
        data: {
          id: "test-venues-id",
          venues: [mockVenues[0].code],
        },
      });

      await store.loadVenues("test-experience");

      store.fields.venues.value = [mockVenues[0].code, mockVenues[1].code];
      await store.saveVenues("test-experience");

      expect(store.isSaving).toBe(false);
      expect(metadataServiceMock.updateVenues).toHaveBeenCalledWith("test-experience", "test-venues-id", {
        experience_id: "test-experience",
        venues: [mockVenues[0].code, mockVenues[1].code],
      });
    });

    test("should delete venues successfully", async () => {
      metadataServiceMock.getVenuesById = vi.fn().mockResolvedValue({
        data: {
          id: "test-venues-id",
          venues: [mockVenues[0].code],
        },
      });

      await store.loadVenues("test-experience");

      store.fields.venues.value = [];

      await store.saveVenues("test-experience");

      expect(metadataServiceMock.deleteVenues).toHaveBeenCalledWith("test-venues-id");
    });

    test("loadVenues should initialize venues correctly", async () => {
      geoMasterDataMock.getVenuesByCityCode = vi.fn().mockResolvedValue(mockVenues);
      metadataServiceMock.getVenuesById = vi.fn().mockResolvedValue({
        data: {
          id: "test-venues-id",
          venues: [mockVenues[0].code, mockVenues[1].code],
        },
      });

      await store.loadVenues("test-venues-id");

      expect(store.fields.venues.value).toEqual([mockVenues[0].code, mockVenues[1].code]);
    });
  });
});
