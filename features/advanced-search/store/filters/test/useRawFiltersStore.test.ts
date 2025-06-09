import { vi, beforeEach, describe, expect, test } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useRawFiltersStore } from "../useRawFiltersStore";
import { mockMasterDataStore } from "@/__mocks__/useMasterData";

vi.stubGlobal("useNuxtApp", () => ({
  $t: (s: string) => s,
}));

mockMasterDataStore();

describe("useRawFiltersStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  test("should return a filter store", () => {
    const store = useRawFiltersStore();

    expect(store).toBeDefined();
  });
});
