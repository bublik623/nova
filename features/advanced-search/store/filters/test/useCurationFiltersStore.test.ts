import { vi, beforeEach, describe, expect, test } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useCurationFiltersStore } from "../useCurationFiltersStore";
import { mockMasterDataStore } from "@/__mocks__/useMasterData";

vi.stubGlobal("useNuxtApp", () => ({
  $t: (s: string) => s,
}));

mockMasterDataStore();

describe("useCurationFiltersStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
  });

  test("should return a filter store", () => {
    const store = useCurationFiltersStore();

    expect(store).toBeDefined();
  });

  describe("default filter values", () => {
    test("language filter should default to english", () => {
      const store = useCurationFiltersStore();

      const appliedFiltersValuesWithDefaults = store.appliedFiltersValuesWithDefaults;

      expect(appliedFiltersValuesWithDefaults["language"]).toStrictEqual({
        type: "multiselect",
        isDefaultValue: true,
        value: [
          {
            label: "common.language.de",
            value: "de",
          },
          {
            label: "common.language.dk",
            value: "dk",
          },
          {
            label: "common.language.en",
            value: "en",
          },
          {
            label: "common.language.es",
            value: "es",
          },
          {
            label: "common.language.fi",
            value: "fi",
          },
          {
            label: "common.language.fr",
            value: "fr",
          },
          {
            label: "common.language.it",
            value: "it",
          },
          {
            label: "common.language.nl",
            value: "nl",
          },
          {
            label: "common.language.no",
            value: "no",
          },
          {
            label: "common.language.pl",
            value: "pl",
          },
          {
            label: "common.language.pt",
            value: "pt",
          },
          {
            label: "common.language.ru",
            value: "ru",
          },
          {
            label: "common.language.se",
            value: "se",
          },
        ],
      });
    });
  });
});
