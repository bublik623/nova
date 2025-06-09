import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { ref, nextTick, type Ref, computed } from "vue";

// Imports for the store and its dependencies/types
import { useLastSavedConfigurationSectionData } from "./useLastSavedConfigurationSectionData";
import { useConfigurationSectionSaveOperation } from "./useConfigurationSectionSaveOperation";
import type { ConfigurationSectionData } from "./types";
import { useConfigurationSection } from "./useConfigurationSection";

// --- Mock Dependencies ---
vi.mock("./useLastSavedConfigurationSectionData");
vi.mock("./useConfigurationSectionSaveOperation");

const notificationStoreMock = {
  addNotification: vi.fn(),
};

vi.mock("@/stores/notifications", () => ({
  useNotifications: () => notificationStoreMock,
}));

// Using ConfigurationSectionData structure
const ALL_MOCK_CONFIGURATION_DATA: ConfigurationSectionData = {
  configuration: {
    experienceCode: "test-123",
    paxes: [
      {
        pax_type: "PERSON",
        pax_code: "abcdef",
        all_ages: true,
        free_of_charge: true,
      },
    ],
    languages: [
      {
        label: "English",
        val: "en",
      },
    ],
    refundPolicies: [
      {
        experience: "lorem ipsum",
        period: "2025",
        refund_type_code: "lorem",
        value: 5,
        action: "NOOP",
      },
    ],
  },
};

// Helper Functions
const createDefaultConfigurationData = (): ConfigurationSectionData => ({ configuration: { experienceCode: "" } });

// --- Test Suite ---
describe("useConfigurationSection Store", () => {
  // Refs to control the source values for the mock computed refs
  let mockIsLoadingSource: Ref<boolean>;
  // let mockIsSavingSource: Ref<boolean>;
  let mockLastSavedDataSource: Ref<ConfigurationSectionData | undefined>;

  // New refs for the save-operation mock
  let mockIsSavingSource: Ref<boolean>;
  let mockSaveFn: ReturnType<typeof vi.fn>;

  // Ref captured from the composable call within the store
  let capturedExperienceIdRef: Ref<string | undefined> | undefined;

  beforeEach(() => {
    setActivePinia(createPinia()); // Setup fresh Pinia for test isolation
    vi.clearAllMocks();

    // Initialize source refs for mocking composable output
    mockIsLoadingSource = ref(false);
    // mockIsSavingSource = ref(false);
    mockLastSavedDataSource = ref(createDefaultConfigurationData());
    capturedExperienceIdRef = undefined;

    // Get typed access to the mocked composable
    const mockedLastSavedDataComposable = vi.mocked(useLastSavedConfigurationSectionData, true);

    // Configure the mock to return computed refs, matching the original composable
    mockedLastSavedDataComposable.mockImplementation((experienceIdArg: Ref<string | undefined>) => {
      capturedExperienceIdRef = experienceIdArg;
      return {
        isLoading: computed(() => mockIsLoadingSource.value),
        // Provide default data structure if source is undefined, matching original composable's likely behavior
        data: computed(() => mockLastSavedDataSource.value ?? createDefaultConfigurationData()),
      };
    });

    // Mock useConfigurationSectionSaveOperation
    mockIsSavingSource = ref(false);
    mockSaveFn = vi.fn();
    const mockedSaveOperationComposable = vi.mocked(useConfigurationSectionSaveOperation, true);
    mockedSaveOperationComposable.mockImplementation((experienceIdArg: Ref<string>) => {
      capturedExperienceIdRef = experienceIdArg;
      return {
        isSaving: computed(() => mockIsSavingSource.value),
        save: mockSaveFn,
      };
    });
  });

  describe("Given the store is initialized", () => {
    it("Then it should call useLastSavedConfigurationSectionData with an initial empty experienceId", () => {
      useConfigurationSection();
      expect(vi.mocked(useLastSavedConfigurationSectionData)).toHaveBeenCalledTimes(1);
      expect(capturedExperienceIdRef?.value).toBe("");
    });

    it("Then isLoading should reflect the initial state from the composable", () => {
      mockIsLoadingSource.value = true;
      const store = useConfigurationSection();
      expect(store.isLoading).toBe(true);
    });

    it("Then lastSavedData should contain the initial data from the composable", () => {
      const initialData = ALL_MOCK_CONFIGURATION_DATA;
      mockLastSavedDataSource.value = initialData;
      const store = useConfigurationSection();

      expect(store.lastSavedData).toEqual(initialData);
      expect(store.lastSavedData).toBe(mockLastSavedDataSource.value);
    });

    it("Then workingCopyData should contain the initial data from the composable due to the immediate watcher", async () => {
      const initialData = ALL_MOCK_CONFIGURATION_DATA;
      mockLastSavedDataSource.value = initialData;
      const store = useConfigurationSection();

      await nextTick(); // Allow watcher/computed to settle

      expect(store.workingCopyData).toEqual(initialData);
      // References should differ because the store watcher uses cloneDeep
      expect(store.workingCopyData).not.toBe(mockLastSavedDataSource.value);
      expect(store.workingCopyData.configuration).not.toBe(mockLastSavedDataSource.value.configuration);
    });

    it("Then workingCopyData should initialize with default data if composable data is initially undefined", async () => {
      mockLastSavedDataSource.value = undefined; // Set composable data to undefined
      const store = useConfigurationSection();

      await nextTick();

      const expectedDefaultData = createDefaultConfigurationData();
      expect(store.workingCopyData).toEqual(expectedDefaultData); // Store gets default from mock + watcher clones it
      expect(store.workingCopyData).not.toBe(mockLastSavedDataSource.value); // workingCopyData is an object, source is undefined

      const loadedData = ALL_MOCK_CONFIGURATION_DATA;
      mockLastSavedDataSource.value = loadedData; // Simulate data loading
      await nextTick();

      expect(store.workingCopyData).toEqual(loadedData);
      // References should differ due to cloneDeep in watcher
      expect(store.workingCopyData).not.toBe(mockLastSavedDataSource.value);
      expect(store.workingCopyData?.configuration).not.toBe(mockLastSavedDataSource.value?.configuration);
    });
  });

  describe("Given the setExperienceId action is called", () => {
    it("Then it should update the experienceId ref passed to the composable", () => {
      const store = useConfigurationSection();
      const newId = "exp-123";
      expect(capturedExperienceIdRef).toBeDefined(); // Ensure ref was captured before action

      store.setExperienceId(newId);
      expect(capturedExperienceIdRef?.value).toBe(newId);
    });
  });

  describe("Given the composable updates its data", () => {
    it("Then lastSavedValue should reflect the new data", async () => {
      const initialConfiguration = {
        configuration: { ...ALL_MOCK_CONFIGURATION_DATA.configuration, experienceCode: "test-000" },
      };
      mockLastSavedDataSource.value = initialConfiguration;
      const store = useConfigurationSection();

      expect(store.lastSavedData?.configuration.experienceCode).toBe("test-000"); // Initial check

      const newData = ALL_MOCK_CONFIGURATION_DATA;
      mockLastSavedDataSource.value = newData; // Trigger composable data update

      expect(store.lastSavedData).toEqual(newData);
      expect(store.lastSavedData?.configuration.experienceCode).toBe("test-123");
      expect(store.lastSavedData).toBe(mockLastSavedDataSource.value);
    });

    it("Then workingCopyData should be updated via the watcher", async () => {
      const initialConfiguration = {
        configuration: { ...ALL_MOCK_CONFIGURATION_DATA.configuration, experienceCode: "test-000" },
      };
      mockLastSavedDataSource.value = initialConfiguration;
      const store = useConfigurationSection();
      await nextTick();
      expect(store.workingCopyData?.configuration.experienceCode).toBe("test-000"); // Initial check

      const newData = ALL_MOCK_CONFIGURATION_DATA;
      mockLastSavedDataSource.value = newData; // Trigger composable data update
      await nextTick(); // Allow watcher (with cloneDeep) to run

      expect(store.workingCopyData).toEqual(newData);
      expect(store.workingCopyData?.configuration.experienceCode).toBe("test-123");
      // References should differ due to cloneDeep in watcher
      expect(store.workingCopyData).not.toBe(mockLastSavedDataSource.value);
      expect(store.workingCopyData?.configuration).not.toBe(mockLastSavedDataSource.value?.configuration);
    });

    it("Then isLoading should update when the composable loading state changes", async () => {
      mockIsLoadingSource.value = true;
      const store = useConfigurationSection();
      await nextTick(); // Allow computed update
      expect(store.isLoading).toBe(true);

      mockIsLoadingSource.value = false;
      await nextTick();
      expect(store.isLoading).toBe(false);
    });

    it("Then isSaving should reflect the save operation state", async () => {
      const store = useConfigurationSection();
      expect(store.isSaving).toBe(false);

      mockIsSavingSource.value = true;
      await nextTick();
      expect(store.isSaving).toBe(true);
    });

    it("Then save() should call the save function from the composable and call the notification", async () => {
      const store = useConfigurationSection();
      await store.save();
      expect(mockSaveFn).toHaveBeenCalledOnce();
      expect(notificationStoreMock.addNotification).toHaveBeenCalledWith({
        message: "notifications.success.saving.document",
        theme: "success",
      });
    });
  });
});
