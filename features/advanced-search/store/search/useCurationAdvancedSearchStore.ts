import { defineStore } from "pinia";
import { useContentQueryApi } from "@/composables/useContentQueryApi";
import { useCurationFiltersStore } from "../filters/useCurationFiltersStore";
import { SortDirection, searchStoreFactory } from "./searchStoreFactory";
import { AdvancedFiltersValues } from "../../types/filters";
import { SortKey } from "@/types/SortingTypes";

const SORT_KEY_MAP: Partial<Record<SortKey, string>> = {
  title: "experience_content.experience_translation.title",
  reference_code: "reference_code",
  last_modified: "experience_content.experience_translation.updated_date",
  country: "functional_content.experience_location.address.country",
  published: "experience_content.experience_translation.distribution_date",
  created: "experience_content.experience_translation.creation_date",
};

export const useCurationAdvancedSearchStore = defineStore("curationAdvancedSearchStore", () => {
  const { getAllDistributionContentsV2, getAllDistributionContentsReport } = useContentQueryApi();

  return searchStoreFactory(
    "curation",
    "last_modified",
    "desc",
    useCurationFiltersStore,
    fetchCurationSearchResults,
    exportCurationSearchResults
  );

  async function fetchCurationSearchResults(
    query: string,
    filters: AdvancedFiltersValues,
    sortKey: SortKey,
    sortDirection: SortDirection,
    offset: number,
    limit: number
  ) {
    return await getAllDistributionContentsV2({
      offset,
      limit,
      query,
      sort: serializeSortDirection(sortDirection) + SORT_KEY_MAP[sortKey],
      pagination: true,
      filters,
    });
  }

  async function exportCurationSearchResults(
    query: string,
    filters: AdvancedFiltersValues,
    sortKey: SortKey,
    sortDirection: SortDirection
  ) {
    return await getAllDistributionContentsReport({
      query: query,
      sort: serializeSortDirection(sortDirection) + SORT_KEY_MAP[sortKey],
      filters: filters,
      fields: [
        "experience_content.experience_translation.title",
        "reference_code",
        "global_status",
        "experience_content.experience_translation.updated_date",
        "supplier_id",
        "functional_content.experience_location.address.city",
        "functional_content.experience_location.address.country",
        "experience_content.experience_translation.creation_date",
        // TODO: add published field
        "experience_content.language_code",
        "functional_content.markets",
      ],
    });
  }

  function serializeSortDirection(sortDirection: SortDirection): "+" | "-" {
    return sortDirection === "asc" ? "+" : "-";
  }
});
