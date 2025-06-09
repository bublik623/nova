import { defineStore } from "pinia";
import { useNotifications } from "./notifications";
import { ExperienceMasterDataItem, useExperienceMasterDataApi } from "@/composables/useExperienceMasterDataApi";
import { FunctionalGroupCode } from "@/types/DocumentTypes";
import {
  AdditionalService,
  Category,
  Interest,
  Highlights,
  ImportantInformation,
  Included,
  Market,
  HierarchicalGroup,
} from "@/types/generated/ExperienceMasterDataApi";
import { AvailableLanguage } from "@/types/Language";
import { GenericHighlight, HighlightsMasterDataKey } from "@/types/Highlights";
import { useLogger } from "@/features/core-shared/composables/useLogger";
import { Country } from "@/types/Country";
import { COUNTRIES } from "@/constants/countries.constants";
import { Country as GeoCountry, City as GeoCity, Venue } from "@/types/generated/GeoMasterDataApi";
import { useGeoMasterDataApi } from "@/features/core-shared/composables/useGeoMasterDataApi";
import { Currency, Supplier } from "@/types/generated/ContractMasterDataApi";
import { useContractMasterDataApi } from "@/features/experience-masterdata/api/useContractMasterDataApi";
import {
  automaticTranslationLanguages,
  availableLanguages,
} from "@/features/experience-masterdata/lib/masterdata-languages";

export interface ExperienceMasterDataState {
  currencies: Currency[];
  highlights: Highlights[];
  included: Included[];
  importantInformation: ImportantInformation[];
  additionalServices: AdditionalService[];
  availableLanguages: Set<AvailableLanguage>;
  automaticTranslationLanguages: Set<AvailableLanguage>;
  experienceCategories: Category[];
  experienceInterests: Interest[];
  countries: Country[];
  markets: Market[];
  geoCountries: GeoCountry[];
  geoCities: GeoCity[];
  hierarchicalGroups: Map<string, HierarchicalGroup>;
  suppliers: Supplier[];
}

function handleMasterDataError(err: unknown) {
  const notificationStore = useNotifications();
  const { logError } = useLogger();

  logError("master-data", err);
  notificationStore.addNotification({
    message: "notifications.error.fetching.master.data",
    theme: "error",
  });
}

function mapHierarchicalGroupsToMap(groups: HierarchicalGroup[]): Map<string, HierarchicalGroup> {
  const groupMap = new Map<string, HierarchicalGroup>();

  for (const group of groups) {
    groupMap.set(group.code, group);
  }

  return groupMap;
}

export const useMasterData = defineStore("master-data-store", {
  state: (): ExperienceMasterDataState => ({
    currencies: [],
    highlights: [],
    included: [],
    importantInformation: [],
    additionalServices: [],
    // exposed here for retro-compatibility
    availableLanguages: availableLanguages,
    automaticTranslationLanguages: automaticTranslationLanguages,
    experienceCategories: [],
    experienceInterests: [],
    countries: COUNTRIES,
    markets: [],
    geoCountries: [],
    geoCities: [],
    hierarchicalGroups: new Map(),
    suppliers: [],
  }),
  getters: {
    getCurrencyByCode:
      (state) =>
      (code: string): Currency | undefined => {
        return state.currencies.find((currency) => currency.code === code);
      },
    getAdditionalServicesByFGCode: (state) => (code: FunctionalGroupCode) => {
      return state.additionalServices.filter((item) => item.functional_group_code === code);
    },
    getHighlightByCode: (state) => (key: HighlightsMasterDataKey, code: string) => {
      const item = state[key].find((highlight) => highlight.code === code);

      if (item == null) {
        throw new Error(`Could not find highlight of type '${key}' with code ${code} in master data store.`);
      }
      return item as GenericHighlight;
    },
    getCountryByCode: (state) => (code: string) => {
      const country = state.geoCountries.find((el) => el.iso_code_alpha2.toUpperCase() === code.toUpperCase());
      if (!country) {
        throw new Error(`Could not find any country with code ${code} in master data store.`);
      }

      return country;
    },
    getCityByCode: (state) => (code: string) => {
      const city = state.geoCities.find((option) => option.code === code) ?? "";

      if (!city) {
        throw new Error(`Could not find any city with code ${code} in master data store.`);
      }

      return city;
    },
    getHierarchicalGroupsByPremadesList: (state) => (premadeList: ExperienceMasterDataItem[]) => {
      if (!premadeList) {
        return [];
      }

      const uniqueGroups = premadeList
        .map((item) => state.hierarchicalGroups.get(item.hierarchical_group_code ?? ""))
        .filter((group): group is HierarchicalGroup => group !== undefined);
      return Array.from(mapHierarchicalGroupsToMap(uniqueGroups).values());
    },
  },
  actions: {
    async getMasterData() {
      const { getPremades } = useExperienceMasterDataApi();
      const { getCities, getCountries } = useGeoMasterDataApi();
      const { getCurrencies, getSuppliers } = useContractMasterDataApi();

      await Promise.all([
        getPremades("highlights", { language_code: "en" }),
        getPremades("included", { language_code: "en" }),
        getPremades("important-information", { language_code: "en" }),
        getPremades("additional-services", { language_code: "en" }),
        getCities(),
        getCountries(),
        getCurrencies(),
        getSuppliers(),
        this.fetchHierarchicalGroups(),
      ])
        .then(
          ([
            { data: highlights },
            { data: included },
            { data: importantInformation },
            { data: additionalServices },
            { data: geoCities },
            { data: geoCountries },
            { data: currencies },
            { data: suppliers },
          ]) => {
            this.highlights = highlights;
            this.included = included;
            this.importantInformation = importantInformation;
            this.additionalServices = additionalServices;
            this.geoCities = geoCities;
            this.geoCountries = geoCountries;
            this.currencies = currencies;
            this.suppliers = suppliers;
          }
        )
        .catch((error) => {
          handleMasterDataError(error);
        });
    },
    async getCategoriesAndInterests() {
      const { getCategories, getInterests } = useExperienceMasterDataApi();

      await Promise.all([getCategories(), getInterests()])
        .then(([{ data: categories }, { data: interests }]) => {
          this.experienceCategories = categories;
          this.experienceInterests = interests;
        })
        .catch((err) => {
          handleMasterDataError(err);
        });
    },
    async getMarkets() {
      const { getMarkets } = useExperienceMasterDataApi();

      await getMarkets()
        .then(({ data: markets }) => {
          this.markets = markets;
        })
        .catch((err) => {
          handleMasterDataError(err);
        });
    },
    async fetchHierarchicalGroups() {
      const { getHierarchicalGroups } = useExperienceMasterDataApi();

      await getHierarchicalGroups({ language_code: "en" }).then(({ data }) => {
        this.hierarchicalGroups = mapHierarchicalGroupsToMap(data);
      });
    },
    async getVenuesByCityCode(cityCodes: string[]): Promise<Venue[]> {
      try {
        const { getVenuesByCityCode } = useGeoMasterDataApi();
        const { data: venues } = await getVenuesByCityCode(cityCodes);
        return venues;
      } catch (error) {
        handleMasterDataError(error);
        return [];
      }
    },
  },
});
