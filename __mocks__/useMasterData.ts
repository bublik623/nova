import { vi } from "vitest";

export function mockMasterDataStore() {
  vi.mock("@/stores/master-data", () => ({
    useMasterData: () => masterDataStoreMock,
  }));
}

const masterDataStoreMock = {
  geoCities: [
    {
      id: "city id",
      code: "city code",
      name: "city name",
      country_code_alpha2: "city country code",
      language_code: "city language code",
      description: "city description",
    },
  ],
  geoCountries: [
    {
      id: "country id",
      iso_code_alpha2: "country alpha 2 code",
      iso_code_alpha3: "country alpha 3 code",
      iso_code_numeric: 12,
      name: "country name",
      language_code: "country language code",
      description: "country description",
      country_calling_codes: [],
    },
  ],
  availableLanguages: ["en", "es", "it", "de"],
  suppliers: [
    {
      id: "supplier id",
      source: "NOVA",
      name: "supplier name",
      email: "supplier email",
      commission: 1,
    },
  ],
  markets: [
    {
      id: "market id",
      language_code: "market language code",
      code: "market code",
      name: "market name",
      description: "markent description",
      category: "market category",
    },
  ],
};
