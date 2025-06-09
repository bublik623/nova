import { defineStore } from "pinia";
import { useContentQueryApi } from "@/composables/useContentQueryApi";
import { useRawFiltersStore } from "../filters/useRawFiltersStore";
import { SortDirection, searchStoreFactory } from "./searchStoreFactory";
import { AdvancedFiltersValues } from "../../types/filters";
import { SortKey } from "@/types/SortingTypes";

const SORT_KEY_MAP: Partial<Record<SortKey, string>> = {
  title: "commercial.title",
  reference_code: "reference_code",
  last_modified: "updated_date",
  country: "functional.location.address.country",
  created: "creation_date",
};

export const useRawAdvancedSearchStore = defineStore("rawAdvancedSearchStore", () => {
  const { getExperienceRawContentV3, getExperienceRawContentReport } = useContentQueryApi();

  return searchStoreFactory(
    "raw",
    "last_modified",
    "desc",
    useRawFiltersStore,
    fetchRawSearchResult,
    exportRawSearchResults
  );

  async function fetchRawSearchResult(
    query: string,
    filters: AdvancedFiltersValues,
    sortKey: SortKey,
    sortDirection: SortDirection,
    offset: number,
    limit: number
  ) {
    return await getExperienceRawContentV3({
      offset,
      limit,
      query,
      sort: serializeSortDirection(sortDirection) + SORT_KEY_MAP[sortKey],
      pagination: true,
      filters,
    });
  }

  async function exportRawSearchResults(
    query: string,
    filters: AdvancedFiltersValues,
    sortKey: SortKey,
    sortDirection: SortDirection
  ) {
    return await getExperienceRawContentReport({
      query: query,
      sort: serializeSortDirection(sortDirection) + SORT_KEY_MAP[sortKey],
      filters: filters,
      fields: [
        "commercial.title",
        "reference_code",
        "status_code",
        "updated_date",
        "supplier_id",
        "functional.location.address.city",
        "functional.location.address.country",
        "creation_date",
        // TODO: add published ??
        // TODO: add language ??
        "functional.markets",
      ],
    });
  }

  function serializeSortDirection(sortDirection: SortDirection): "+" | "-" {
    return sortDirection === "asc" ? "+" : "-";
  }
});
