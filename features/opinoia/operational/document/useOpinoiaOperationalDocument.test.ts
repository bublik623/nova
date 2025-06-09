// File: useOpinoiaOperationalDocument.spec.ts

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ref, computed, nextTick, type Ref } from "vue";
import { createPinia, setActivePinia } from "pinia";
import { useOpinoiaOperationalDocument } from "./useOpinoiaOperationalDocument";
import { useOptionsSection } from "../sections/options/useOptionsSection";

// --- Mock Setup for useConfigurationSection ---

const configurationSection = {
  setExperienceId: vi.fn(),
};
const allotmentSection = {
  setExperienceId: vi.fn(),
};
const priceSection = {
  setExperienceId: vi.fn(),
};

vi.mock("../sections/configuration/useConfigurationSection", () => ({
  useConfigurationSection: () => configurationSection,
}));
vi.mock("../sections/allotment/useAllotmentSection", () => ({
  useAllotmentSection: () => allotmentSection,
}));
vi.mock("../sections/price/usePriceSection", () => ({
  usePriceSection: () => priceSection,
}));

// --- Mock Setup for useLastSavedOptionsSectionData (Dependency of useOptionsSection) ---

const mockLastSavedOptionsIsLoading = ref(false);
const mockLastSavedOptionsData = ref(null); // Define if data mocking is needed

const mockSaveOperationIsSaving = ref(false);
const mockSaveFn = vi.fn();

// Helper to reset the state for the useLastSavedOptionsSectionData mock
const resetLastSavedOptionsMockState = () => {
  mockLastSavedOptionsIsLoading.value = false;
};

// Mock the dependency composable
vi.mock("../sections/options/composables/useLastSavedOptionsSectionData", () => ({
  // Adjust path
  useLastSavedOptionsSectionData: vi.fn((_experienceId: Ref<string | undefined>) => ({
    isLoading: computed(() => mockLastSavedOptionsIsLoading.value),
    data: computed(() => mockLastSavedOptionsData.value),
  })),
}));

vi.mock("../sections/options/composables/useOptionsSectionSaveOperation", () => ({
  // Adjust path
  useOptionsSectionSaveOperation: vi.fn((_experienceId: Ref<string | undefined>) => ({
    isSaving: computed(() => mockSaveOperationIsSaving.value),
    save: mockSaveFn,
  })),
}));

// --- Test Suite ---
describe("useOpinoiaOperationalDocument", () => {
  let experienceId: Ref<string>;

  beforeEach(() => {
    // Activate a fresh Pinia instance FOR EACH TEST
    setActivePinia(createPinia());
    // Reset the state of the mocked dependency before each test
    resetLastSavedOptionsMockState();
    experienceId = ref("initial-exp-id");
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // --- Test Group: Experience ID Propagation ---
  describe("Experience ID Propagation", () => {
    it("Scenario: Initialization - should ensure sections are immediately updated with the initial experienceId", () => {
      // Given
      const initialId = "exp-123";
      experienceId.value = initialId;
      const optionsStore = useOptionsSection();
      const setOptionExperienceIdSpy = vi.spyOn(optionsStore, "setExperienceId");
      const setConfigurationExperienceIdSpy = vi.spyOn(configurationSection, "setExperienceId");
      const setAllotmentExperienceIdSpy = vi.spyOn(allotmentSection, "setExperienceId");

      // When
      useOpinoiaOperationalDocument(experienceId);

      // Then
      expect(setOptionExperienceIdSpy).toHaveBeenCalledTimes(1);
      expect(setOptionExperienceIdSpy).toHaveBeenCalledWith(initialId);
      expect(setConfigurationExperienceIdSpy).toHaveBeenCalledTimes(1);
      expect(setConfigurationExperienceIdSpy).toHaveBeenCalledWith(initialId);
      expect(setAllotmentExperienceIdSpy).toHaveBeenCalledTimes(1);
      expect(setAllotmentExperienceIdSpy).toHaveBeenCalledWith(initialId);
    });

    it("Scenario: experienceId Change - should ensure sections are updated with the new experienceId", async () => {
      // Given
      const initialId = "exp-abc";
      experienceId.value = initialId;
      const optionsStore = useOptionsSection();
      const setOptionExperienceIdSpy = vi.spyOn(optionsStore, "setExperienceId");
      const setConfigurationExperienceIdSpy = vi.spyOn(configurationSection, "setExperienceId");
      const setPriceExperienceIdSpy = vi.spyOn(priceSection, "setExperienceId");
      const setAllotmentExperienceIdSpy = vi.spyOn(allotmentSection, "setExperienceId");

      useOpinoiaOperationalDocument(experienceId);
      setOptionExperienceIdSpy.mockClear(); // Clear the initial call from watch({ immediate: true })
      setConfigurationExperienceIdSpy.mockClear(); // Clear the initial call from watch({ immediate: true })
      setPriceExperienceIdSpy.mockClear(); // Clear the initial call from watch({ immediate: true })
      setAllotmentExperienceIdSpy.mockClear(); // Clear the initial call from watch({ immediate: true })

      // When
      const newId = "exp-xyz";
      experienceId.value = newId;
      await nextTick(); // Wait for the watcher

      // Then
      expect(setOptionExperienceIdSpy).toHaveBeenCalledTimes(1);
      expect(setOptionExperienceIdSpy).toHaveBeenCalledWith(newId);
      expect(setConfigurationExperienceIdSpy).toHaveBeenCalledTimes(1);
      expect(setConfigurationExperienceIdSpy).toHaveBeenCalledWith(newId);
      expect(setPriceExperienceIdSpy).toHaveBeenCalledTimes(1);
      expect(setPriceExperienceIdSpy).toHaveBeenCalledWith(newId);
      expect(setAllotmentExperienceIdSpy).toHaveBeenCalledTimes(1);
      expect(setAllotmentExperienceIdSpy).toHaveBeenCalledWith(newId);
    });
  });

  // --- Test Group: Loading State ---
  describe("Loading State", () => {
    it("Scenario: isLoading State - should reflect the combined loading state of the sections", async () => {
      // Given
      experienceId.value = "exp-load-test";
      const { isLoading } = useOpinoiaOperationalDocument(experienceId);

      // Then: isLoading should initially be false
      expect(isLoading.value).toBe(false);

      // When: Dependency loading state changes to true
      mockLastSavedOptionsIsLoading.value = true;
      await nextTick(); // Wait for reactivity chain

      // Then: The composable's isLoading should become true
      expect(isLoading.value).toBe(true);

      // When: Dependency loading state changes back to false
      mockLastSavedOptionsIsLoading.value = false;
      await nextTick();

      // Then: The composable's isLoading should become false
      expect(isLoading.value).toBe(false);
    });
  });
});
