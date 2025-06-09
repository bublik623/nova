import { vi, beforeEach, describe, expect, test } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { mockMasterDataStore } from "@/__mocks__/useMasterData";
import { flushPromises } from "@vue/test-utils";
import { useRawAdvancedSearchStore } from "../useRawAdvancedSearchStore";

vi.stubGlobal("useNuxtApp", () => ({
  $t: (s: string) => s,
}));

const contentQueryApiMock = {
  getExperienceRawContentV3: vi.fn(),
  getExperienceRawContentReport: vi.fn(),
};

vi.mock("@/composables/useContentQueryApi", () => {
  return {
    useContentQueryApi: () => contentQueryApiMock,
  };
});

mockMasterDataStore();

describe("useRawAdvancedSearchStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
  });

  test("should return an advanced search store", () => {
    const store = useRawAdvancedSearchStore();

    expect(store).toBeDefined();
  });

  test("it should use getExperienceRawContentV3 to fetch data", async () => {
    contentQueryApiMock.getExperienceRawContentV3.mockReturnValueOnce({ data: {}, headers: {} });

    const store = useRawAdvancedSearchStore();
    store.isSearching = false;
    store.inputQuery = "a new query";
    store.activeQuery = "a new query";
    store.sortKey = "title";
    store.sortDirection = "desc";
    store.pageNumber = 4;

    await store.fetchSearchResults();

    expect(contentQueryApiMock.getExperienceRawContentV3).toHaveBeenCalledOnce();
    expect(contentQueryApiMock.getExperienceRawContentV3).toHaveBeenCalledWith({
      offset: 150,
      limit: 50,
      query: "a new query",
      sort: "-commercial.title",
      pagination: expect.anything(),
      filters: expect.anything(),
    });
  });

  test("it should use getExperienceRawContentReport to get the report", async () => {
    contentQueryApiMock.getExperienceRawContentReport.mockReturnValueOnce({ data: {}, headers: {} });

    const store = useRawAdvancedSearchStore();
    store.isSearching = false;
    store.inputQuery = "a new query";
    store.activeQuery = "a new query";
    store.sortKey = "title";
    store.sortDirection = "desc";
    store.totalCount = 10;

    await flushPromises();

    await store.exportSearchResults();

    expect(contentQueryApiMock.getExperienceRawContentReport).toHaveBeenCalledOnce();
    expect(contentQueryApiMock.getExperienceRawContentReport).toHaveBeenCalledWith({
      query: "a new query",
      sort: "-commercial.title",
      filters: expect.anything(),
      fields: expect.anything(),
    });
  });
});
