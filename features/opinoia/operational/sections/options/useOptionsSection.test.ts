import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { ref, nextTick, type Ref, computed } from "vue";

// Imports for the store and its dependencies/types
import { useOptionsSection } from "./useOptionsSection";
import { useLastSavedOptionsSectionData } from "./composables/useLastSavedOptionsSectionData";
import { useOptionsSectionSaveOperation } from "./composables/useOptionsSectionSaveOperation";
import type { OptionsSectionData, Option } from "./types";

// --- Mock Dependencies ---
vi.mock("./composables/useLastSavedOptionsSectionData");
vi.mock("./composables/useOptionsSectionSaveOperation");

// --- Reusable Mock Data ---
const MOCK_OPTION_1: Option = {
  id: "opt1",
  title: "Option One",
  code: "C-opt1",
  duration: 2,
  subchannels: "all",
  paxTypes: ["ADT", "CHD"],
};
const MOCK_OPTION_2: Option = {
  id: "opt2",
  title: "Option Two",
  code: "C-opt2",
  duration: 0.5,
  subchannels: "all",
  paxTypes: "all",
};
const MOCK_OPTION_3: Option = {
  id: "opt3",
  title: "Option Three",
  code: "C-opt3",
  duration: undefined,
  subchannels: [],
  paxTypes: ["INF"],
};
const MOCK_OPTION_4: Option = {
  id: "opt4",
  title: "Option Four",
  code: "C-opt4",
  duration: 1,
  subchannels: [],
  paxTypes: [],
};

// Using OptionsSectionData structure
const ALL_MOCK_OPTIONS_DATA: OptionsSectionData = {
  options: [MOCK_OPTION_1, MOCK_OPTION_2, MOCK_OPTION_3, MOCK_OPTION_4],
};

// Helper Functions
const createDefaultOptionsData = (): OptionsSectionData => ({ options: [] });
const createSampleOption = (id: string, title: string, pax: string[] | "all"): Option => ({
  id: id,
  title: title,
  code: `C-${id}`,
  duration: Math.random() * 5,
  subchannels: "all",
  paxTypes: pax,
});

// --- Test Suite ---
describe("useOptionsSection Store", () => {
  // Refs to control the source values for the mock computed refs
  let mockIsLoadingSource: Ref<boolean>;
  let mockIsSavingSource: Ref<boolean>;
  let mockLastSavedDataSource: Ref<OptionsSectionData | undefined>;
  // Ref captured from the composable call within the store
  let capturedExperienceIdRef: Ref<string | undefined> | undefined;

  beforeEach(() => {
    setActivePinia(createPinia()); // Setup fresh Pinia for test isolation
    vi.clearAllMocks();

    // Initialize source refs for mocking composable output
    mockIsLoadingSource = ref(false);
    mockIsSavingSource = ref(false);
    mockLastSavedDataSource = ref(createDefaultOptionsData());
    capturedExperienceIdRef = undefined;

    // Get typed access to the mocked composable
    const mockedLastSavedDataComposable = vi.mocked(useLastSavedOptionsSectionData, true);
    const mockedSaveOperationComposable = vi.mocked(useOptionsSectionSaveOperation, true);

    // Configure the mock to return computed refs, matching the original composable
    mockedLastSavedDataComposable.mockImplementation((experienceIdArg: Ref<string | undefined>) => {
      capturedExperienceIdRef = experienceIdArg;
      return {
        isLoading: computed(() => mockIsLoadingSource.value),
        // Provide default data structure if source is undefined, matching original composable's likely behavior
        data: computed(() => mockLastSavedDataSource.value ?? createDefaultOptionsData()),
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
    it("Then it should call useLastSavedOptionsSectionData with an initial undefined experienceId", () => {
      useOptionsSection();
      expect(vi.mocked(useLastSavedOptionsSectionData)).toHaveBeenCalledTimes(1);
      expect(capturedExperienceIdRef?.value).toBeUndefined();
    });

    it("Then isLoading should reflect the initial state from the composable", () => {
      mockIsLoadingSource.value = true;
      const store = useOptionsSection();
      expect(store.isLoading).toBe(true);
    });

    it("Then lastSavedData should contain the initial data from the composable", () => {
      const initialData = ALL_MOCK_OPTIONS_DATA;
      mockLastSavedDataSource.value = initialData;
      const store = useOptionsSection();

      expect(store.lastSavedData).toEqual(initialData);
      expect(store.lastSavedData).toBe(mockLastSavedDataSource.value);
    });

    it("Then workingCopyData should contain the initial data from the composable due to the immediate watcher", async () => {
      const initialData = ALL_MOCK_OPTIONS_DATA;
      mockLastSavedDataSource.value = initialData;
      const store = useOptionsSection();

      await nextTick(); // Allow watcher/computed to settle

      expect(store.workingCopyData).toEqual(initialData);
      // References should differ because the store watcher uses cloneDeep
      expect(store.workingCopyData).not.toBe(mockLastSavedDataSource.value);
      expect(store.workingCopyData.options).not.toBe(mockLastSavedDataSource.value.options);
    });

    it("Then workingCopyData should initialize with default data if composable data is initially undefined", async () => {
      mockLastSavedDataSource.value = undefined; // Set composable data to undefined
      const store = useOptionsSection();

      await nextTick();

      const expectedDefaultData = createDefaultOptionsData();
      expect(store.workingCopyData).toEqual(expectedDefaultData); // Store gets default from mock + watcher clones it
      expect(store.workingCopyData).not.toBe(mockLastSavedDataSource.value); // workingCopyData is an object, source is undefined

      const loadedData = ALL_MOCK_OPTIONS_DATA;
      mockLastSavedDataSource.value = loadedData; // Simulate data loading
      await nextTick();

      expect(store.workingCopyData).toEqual(loadedData);
      // References should differ due to cloneDeep in watcher
      expect(store.workingCopyData).not.toBe(mockLastSavedDataSource.value);
      expect(store.workingCopyData?.options).not.toBe(mockLastSavedDataSource.value?.options);
    });
  });

  describe("Given the setExperienceId action is called", () => {
    it("Then it should update the experienceId ref passed to the composable", () => {
      const store = useOptionsSection();
      const newId = "exp-123";
      expect(capturedExperienceIdRef).toBeDefined(); // Ensure ref was captured before action

      store.setExperienceId(newId);

      expect(capturedExperienceIdRef?.value).toBe(newId);
    });
  });

  describe("Given the composable updates its data", () => {
    it("Then lastSavedValue should reflect the new data", async () => {
      const initialOptions = { options: [createSampleOption("opt-init", "Initial", ["ADT"])] };
      mockLastSavedDataSource.value = initialOptions;
      const store = useOptionsSection();

      expect(store.lastSavedData?.options[0]?.id).toBe("opt-init"); // Initial check

      const newData = ALL_MOCK_OPTIONS_DATA;
      mockLastSavedDataSource.value = newData; // Trigger composable data update

      expect(store.lastSavedData).toEqual(newData);
      expect(store.lastSavedData?.options[0]?.id).toBe("opt1");
      expect(store.lastSavedData).toBe(mockLastSavedDataSource.value);
    });

    it("Then workingCopyData should be updated via the watcher", async () => {
      const initialOptions = { options: [createSampleOption("opt-init", "Initial", ["ADT"])] };
      mockLastSavedDataSource.value = initialOptions;
      const store = useOptionsSection();
      await nextTick();
      expect(store.workingCopyData?.options[0]?.id).toBe("opt-init"); // Initial check

      const newData = ALL_MOCK_OPTIONS_DATA;
      mockLastSavedDataSource.value = newData; // Trigger composable data update
      await nextTick(); // Allow watcher (with cloneDeep) to run

      expect(store.workingCopyData).toEqual(newData);
      expect(store.workingCopyData?.options[0]?.id).toBe("opt1");
      // References should differ due to cloneDeep in watcher
      expect(store.workingCopyData).not.toBe(mockLastSavedDataSource.value);
      expect(store.workingCopyData?.options).not.toBe(mockLastSavedDataSource.value?.options);
    });

    it("Then isLoading should update when the composable loading state changes", async () => {
      mockIsLoadingSource.value = true;
      const store = useOptionsSection();
      await nextTick(); // Allow computed update
      expect(store.isLoading).toBe(true);

      mockIsLoadingSource.value = false;
      await nextTick();
      expect(store.isLoading).toBe(false);
    });
  });
});
