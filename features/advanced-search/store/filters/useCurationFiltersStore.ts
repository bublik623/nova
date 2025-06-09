import { defineStore } from "pinia";
import { useMasterData } from "@/stores/master-data";
import { AdvancedFilterSectionsConfig } from "../../types/filters";
import { Option } from "@/types/Option";
import { useFeatureFlag } from "@/features/experience-shared/composables/useFeatureFlag";
import { buildFilterStoreFactory } from "./filtersStoreFactory";

export const useCurationFiltersStore = defineStore(
  "curationFiltersStore",
  buildFilterStoreFactory(curationFiltersConfigurationProvider)
);

function curationFiltersConfigurationProvider() {
  const { $t } = useNuxtApp();
  const masterDataStore = useMasterData();

  return computed(() => {
    const languageOptions = Array.from(masterDataStore.availableLanguages)
      .map((language) => ({ label: $t(`common.language.${language}`), value: language }))
      .sort(byLabel);

    const filtersConfig: AdvancedFilterSectionsConfig = {
      mostUsedFiltersConfig: [
        {
          type: "date-range",
          key: "publicationDate",
          label: "Publication date",
        },
        {
          type: "multiselect",
          key: "city",
          label: "City",
          options: masterDataStore.geoCities.map((city) => ({ label: city.name, value: city.code })).sort(byLabel),
        },
        {
          type: "multiselect",
          key: "country",
          label: "Country",
          options: masterDataStore.geoCountries
            .map((country) => ({ label: country.name, value: country.name }))
            .sort(byLabel),
        },
        {
          type: "multiselect",
          key: "language",
          label: "Language",
          options: languageOptions,
          defaultValue: languageOptions,
        },
        {
          type: "multiselect",
          key: "supplier",
          label: "Supplier",
          options:
            masterDataStore.suppliers
              ?.map((supplier) => ({ label: supplier.name, value: supplier.id! }))
              .sort(byLabel) ?? [],
        },
        {
          type: "multiselect",
          key: "markets",
          label: "Market",
          options:
            masterDataStore.markets?.map((market) => ({ label: market.name, value: market.code })).sort(byLabel) ?? [],
        },
      ],
      moreFiltersConfig: [],
    };

    if (useFeatureFlag("adv_search_editorial_status_filter")) {
      filtersConfig.mostUsedFiltersConfig.splice(1, 0, {
        type: "multiselect",
        key: "status",
        label: "Status",
        options: ["PUBLISHED", "UNPUBLISHED", "NOT_READY"]
          .map((statusCode) => ({ label: $t(`experience.status_code.${statusCode}`), value: statusCode }))
          .sort(byLabel),
      });
    }

    return filtersConfig;
  });
}

function byLabel(a: Option, b: Option): number {
  return a.label.localeCompare(b.label);
}
