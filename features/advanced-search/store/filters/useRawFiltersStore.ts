import { defineStore } from "pinia";
import { buildFilterStoreFactory } from "./filtersStoreFactory";
import { Option } from "@/types/Option";
import { useMasterData } from "@/stores/master-data";
import { RawStatusCode } from "@/types/DocumentStatuses";
import { AdvancedFilterSectionsConfig } from "../../types/filters";

export const useRawFiltersStore = defineStore(
  "rawFiltersStore",
  buildFilterStoreFactory(rawFiltersConfigurationProvider)
);

function rawFiltersConfigurationProvider() {
  const { $t } = useNuxtApp();
  const masterDataStore = useMasterData();

  return computed<AdvancedFilterSectionsConfig>(() => {
    return {
      mostUsedFiltersConfig: [
        {
          type: "date-range",
          key: "lastModificationDate",
          label: "Last modification date",
        },
        {
          type: "multiselect",
          key: "status",
          label: "Status",
          options: Object.values(RawStatusCode)
            .map((statusCode) => ({ label: $t(`experience.status_code.${statusCode}`), value: statusCode }))
            .sort(byLabel),
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
      moreFiltersConfig: [{ type: "date-range", key: "creationDate", label: "Creation date" }],
    };
  });
}

function byLabel(a: Option, b: Option): number {
  return a.label.localeCompare(b.label);
}
