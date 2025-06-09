import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { ref, nextTick, type Ref, computed } from "vue";

// Imports for the store and its dependencies/types
import { useLastSavedAllotmentSectionData } from "./useLastSavedAllotmentSectionData";
import type { AllotmentSectionData } from "./types";
import { useAllotmentSection } from "./useAllotmentSection";
import { useAllotmentSectionSaveOperation } from "./composables/useAllotmentSectionSaveOperation/useAllotmentSectionSaveOperation";

// --- Mock Dependencies ---
vi.mock("./useLastSavedAllotmentSectionData");
vi.mock("./composables/useAllotmentSectionSaveOperation/useAllotmentSectionSaveOperation");

// Using AllotmentSectionData structure
const ALL_MOCK_ALLOTMENTS_DATA: AllotmentSectionData = {
  allotments: [
    {
      id: "fedcba0987654321",
      isAtExperienceLevel: false,
      languages: ["en"],
      dates: {
        from: new Date("2025-05-19"),
        to: new Date("2025-05-25"),
      },
    },
  ],
};

// Helper Functions
const createDefaultAllotmentData = (): AllotmentSectionData => ({ allotments: [] });

// --- Test Suite ---
describe("useAllotmentSection Store", () => {
  // Refs to control the source values for the mock computed refs
  let mockIsLoadingSource: Ref<boolean>;
  let mockIsSavingSource: Ref<boolean>;
  let mockLastSavedDataSource: Ref<AllotmentSectionData | undefined>;

  // Ref captured from the composable call within the store
  let capturedExperienceIdRef: Ref<string | undefined> | undefined;

  beforeEach(() => {
    setActivePinia(createPinia()); // Setup fresh Pinia for test isolation
    vi.clearAllMocks();

    // Initialize source refs for mocking composable output
    mockIsLoadingSource = ref(false);
    mockIsSavingSource = ref(false);
    mockLastSavedDataSource = ref(createDefaultAllotmentData());
    capturedExperienceIdRef = undefined;

    // Get typed access to the mocked composable
    const mockedLastSavedDataComposable = vi.mocked(useLastSavedAllotmentSectionData, true);
    const mockedSaveOperationComposable = vi.mocked(useAllotmentSectionSaveOperation, true);

    // Configure the mock to return computed refs, matching the original composable
    mockedLastSavedDataComposable.mockImplementation((experienceIdArg: Ref<string | undefined>) => {
      capturedExperienceIdRef = experienceIdArg;
      return {
        isLoading: computed(() => mockIsLoadingSource.value),
        // Provide default data structure if source is undefined, matching original composable's likely behavior
        data: computed(() => mockLastSavedDataSource.value ?? createDefaultAllotmentData()),
      };
    });

    mockedSaveOperationComposable.mockImplementation((experienceIdArg: Ref<string | undefined>) => {
      capturedExperienceIdRef = experienceIdArg;
      return {
        isSaving: computed(() => mockIsSavingSource.value),
        save: vi.fn(),
      };
    });
  });

  describe("Given the store is initialized", () => {
    it("Then it should call useLastSavedAllotmentSectionData with an initial empty experienceId", () => {
      useAllotmentSection();
      expect(vi.mocked(useLastSavedAllotmentSectionData)).toHaveBeenCalledTimes(1);
      expect(capturedExperienceIdRef?.value).toBe("");
    });

    it("Then isLoading should reflect the initial state from the composable", () => {
      mockIsLoadingSource.value = true;
      const store = useAllotmentSection();
      expect(store.isLoading).toBe(true);
    });

    it("Then lastSavedData should contain the initial data from the composable", () => {
      const initialData = ALL_MOCK_ALLOTMENTS_DATA;
      mockLastSavedDataSource.value = initialData;
      const store = useAllotmentSection();

      expect(store.lastSavedData).toEqual(initialData);
      expect(store.lastSavedData).toBe(mockLastSavedDataSource.value);
    });

    it("Then workingCopyData should contain the default data", async () => {
      const store = useAllotmentSection();

      await nextTick();

      expect(store.workingCopyData).toEqual({ allotments: [] });
    });
  });

  describe("Given the setExperienceId action is called", () => {
    it("Then it should update the experienceId ref passed to the composable", () => {
      const store = useAllotmentSection();
      const newId = "exp-123";
      expect(capturedExperienceIdRef).toBeDefined(); // Ensure ref was captured before action

      store.setExperienceId(newId);
      expect(capturedExperienceIdRef?.value).toBe(newId);
    });
  });

  describe("Given the composable updates its data", () => {
    it("Then lastSavedValue should reflect the new data", async () => {
      const initialAllotments: AllotmentSectionData = {
        allotments: [{ ...ALL_MOCK_ALLOTMENTS_DATA.allotments[0], id: "test-000" }],
      };
      mockLastSavedDataSource.value = initialAllotments;
      const store = useAllotmentSection();

      expect(store.lastSavedData?.allotments[0].id).toBe("test-000"); // Initial check

      const newData = ALL_MOCK_ALLOTMENTS_DATA;
      mockLastSavedDataSource.value = newData; // Trigger composable data update

      expect(store.lastSavedData).toEqual(newData);
      expect(store.lastSavedData?.allotments[0].id).toBe("fedcba0987654321");
      expect(store.lastSavedData).toBe(mockLastSavedDataSource.value);
    });

    it("Then workingCopyData should be updated via the watcher", async () => {
      const initialAllotments: AllotmentSectionData = {
        allotments: [{ ...ALL_MOCK_ALLOTMENTS_DATA.allotments[0], id: "test-000" }],
      };
      mockLastSavedDataSource.value = initialAllotments;
      const store = useAllotmentSection();

      // trigger the watcher
      mockIsLoadingSource.value = true;
      await nextTick();
      mockIsLoadingSource.value = false;
      await nextTick();

      expect(store.workingCopyData?.allotments[0].id).toBe("test-000"); // Initial check

      const newData = ALL_MOCK_ALLOTMENTS_DATA;
      mockLastSavedDataSource.value = newData; // Trigger composable data update

      // trigger the watcher
      mockIsLoadingSource.value = true;
      await nextTick();
      mockIsLoadingSource.value = false;
      await nextTick();

      expect(store.workingCopyData).toEqual(newData);
      expect(store.workingCopyData?.allotments[0].id).toBe("fedcba0987654321");
      // References should differ due to cloneDeep in watcher
      expect(store.workingCopyData).not.toBe(mockLastSavedDataSource.value);
      expect(store.workingCopyData?.allotments).not.toBe(mockLastSavedDataSource.value?.allotments);
    });

    it("Then isLoading should update when the composable loading state changes", async () => {
      mockIsLoadingSource.value = true;
      const store = useAllotmentSection();
      await nextTick(); // Allow computed update
      expect(store.isLoading).toBe(true);

      mockIsLoadingSource.value = false;
      await nextTick();
      expect(store.isLoading).toBe(false);
    });
  });
});
