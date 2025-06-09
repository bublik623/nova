import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref, type Ref } from "vue";
import { useOptionsSectionSaveOperation } from "./useOptionsSectionSaveOperation";
import type { OptionsSectionData, Option as InternalOption } from "../../types";

// --- Mock the Performer Composable dependencies ---
const mockCreatePerformerBatchFn = vi.fn();
const mockUpdatePerformerBatchFn = vi.fn();
const mockDeletePerformerBatchFn = vi.fn();
const mockCreateIsPerformingRef = ref(false);
const mockUpdateIsPerformingRef = ref(false);
const mockDeleteIsPerformingRef = ref(false);

const MOCK_CONSTRUCTOR_useCreateOptionsPerformer = vi.hoisted(() =>
  vi.fn(() => ({
    performBatch: mockCreatePerformerBatchFn,
    isPerforming: mockCreateIsPerformingRef,
  }))
);
const MOCK_CONSTRUCTOR_useUpdateOptionsPerformer = vi.hoisted(() =>
  vi.fn(() => ({
    performBatch: mockUpdatePerformerBatchFn,
    isPerforming: mockUpdateIsPerformingRef,
  }))
);
const MOCK_CONSTRUCTOR_useDeleteOptionsPerformer = vi.hoisted(() =>
  vi.fn(() => ({
    performBatch: mockDeletePerformerBatchFn,
    isPerforming: mockDeleteIsPerformingRef,
  }))
);

vi.mock("./useCreateOptionsPerformer", () => ({
  useCreateOptionsPerformer: MOCK_CONSTRUCTOR_useCreateOptionsPerformer,
}));
vi.mock("./useUpdateOptionsPerformer", () => ({
  useUpdateOptionsPerformer: MOCK_CONSTRUCTOR_useUpdateOptionsPerformer,
}));
vi.mock("./useDeleteOptionsPerformer", () => ({
  useDeleteOptionsPerformer: MOCK_CONSTRUCTOR_useDeleteOptionsPerformer,
}));

// --- Test Helper Functions for Data ---
const createSampleInternalOption = (id: string, data: Partial<InternalOption> = {}): InternalOption => ({
  id,
  title: `Title for ${id}`,
  code: `CODE-${id.toUpperCase()}`,
  subchannels: ["web", "mobile"],
  paxTypes: ["adult", "child"],
  duration: 60,
  ...data,
});

describe("useOptionsSectionSaveOperation (Orchestrator)", () => {
  let experienceId: Ref<string | undefined>;

  beforeEach(() => {
    experienceId = ref<string | undefined>("expOrchestrator123");

    // Reset mocks for performer composable OUTPUTS
    mockCreatePerformerBatchFn.mockReset().mockResolvedValue([]);
    mockUpdatePerformerBatchFn.mockReset().mockResolvedValue([]);
    mockDeletePerformerBatchFn.mockReset().mockResolvedValue([]);

    mockCreateIsPerformingRef.value = false;
    mockUpdateIsPerformingRef.value = false;
    mockDeleteIsPerformingRef.value = false;

    // Reset the mock CONSTRUCTORS for the performers (to clear call counts, etc.)
    MOCK_CONSTRUCTOR_useCreateOptionsPerformer.mockClear();
    MOCK_CONSTRUCTOR_useUpdateOptionsPerformer.mockClear();
    MOCK_CONSTRUCTOR_useDeleteOptionsPerformer.mockClear();
  });

  describe("isSaving", () => {
    it("should be false if all performers are not performing", () => {
      const { isSaving } = useOptionsSectionSaveOperation(experienceId);
      expect(isSaving.value).toBe(false);
    });

    it("should be true if the create process is performing", () => {
      const { isSaving } = useOptionsSectionSaveOperation(experienceId);
      mockCreateIsPerformingRef.value = true;
      expect(isSaving.value).toBe(true);
    });

    it("should be true if the update process is performing", () => {
      const { isSaving } = useOptionsSectionSaveOperation(experienceId);
      mockUpdateIsPerformingRef.value = true;
      expect(isSaving.value).toBe(true);
    });

    it("should be true if the delete process is performing", () => {
      const { isSaving } = useOptionsSectionSaveOperation(experienceId);
      mockDeleteIsPerformingRef.value = true;
      expect(isSaving.value).toBe(true);
    });
  });

  describe("save method", () => {
    const opt1Server = createSampleInternalOption("opt1", { title: "Server Option 1" });
    const opt2Server = createSampleInternalOption("opt2", { title: "Server Option 2" });
    const optLocal1 = createSampleInternalOption("local-1", { title: "New Local 1" });
    const optLocal2 = createSampleInternalOption("local-2", { title: "New Local 2" });

    const lastSavedEmpty: OptionsSectionData = { options: [] };
    const lastSavedOneOpt: OptionsSectionData = { options: [{ ...opt1Server }] };
    const lastSavedTwoOpts: OptionsSectionData = { options: [{ ...opt1Server }, { ...opt2Server }] };

    it("should initialize performers with the given experience id", async () => {
      const currentData: OptionsSectionData = { options: [] };
      const { save } = useOptionsSectionSaveOperation(experienceId);

      await save(lastSavedTwoOpts, currentData);

      expect(MOCK_CONSTRUCTOR_useCreateOptionsPerformer).toHaveBeenCalledWith(experienceId);
      expect(MOCK_CONSTRUCTOR_useUpdateOptionsPerformer).toHaveBeenCalledWith(experienceId);
      expect(MOCK_CONSTRUCTOR_useDeleteOptionsPerformer).toHaveBeenCalledWith(experienceId);
    });

    it("should delegate creation of new options to the create performer", async () => {
      const currentData: OptionsSectionData = { options: [{ ...optLocal1 }, { ...optLocal2 }] };

      const expectedNewOptions = [{ ...optLocal1 }, { ...optLocal2 }];

      const { save } = useOptionsSectionSaveOperation(experienceId);
      await save(lastSavedEmpty, currentData);

      expect(mockCreatePerformerBatchFn).toHaveBeenCalledWith(expectedNewOptions);
    });

    it("should delegate updating of edited options to the update performer", async () => {
      const editedOpt1Payload = { ...opt1Server, title: "Edited Server Opt 1" };
      const currentData: OptionsSectionData = { options: [editedOpt1Payload] };

      const expectedEditedOptions = [editedOpt1Payload];

      const { save } = useOptionsSectionSaveOperation(experienceId);
      await save(lastSavedTwoOpts, currentData);

      expect(mockUpdatePerformerBatchFn).toHaveBeenCalledWith(expectedEditedOptions);
    });

    it("should delegate deletion of removed options to the delete performer", async () => {
      const currentData: OptionsSectionData = { options: [{ ...opt1Server }] };

      const expectedRemovedIds = [opt2Server.id];

      const { save } = useOptionsSectionSaveOperation(experienceId);
      await save(lastSavedTwoOpts, currentData);

      expect(mockDeletePerformerBatchFn).toHaveBeenCalledWith(expectedRemovedIds);
    });

    it("should correctly orchestrate create, update, and delete operations together", async () => {
      const editedOpt1Payload = { ...opt1Server, title: "Edited Opt1 For Mixed Test" };
      const currentData: OptionsSectionData = { options: [editedOpt1Payload, { ...optLocal1 }] };

      const expectedNewOptions = [{ ...optLocal1 }];
      const expectedEditedOptions = [editedOpt1Payload];
      const expectedRemovedIds = [opt2Server.id];

      const { save } = useOptionsSectionSaveOperation(experienceId);
      await save(lastSavedTwoOpts, currentData);

      expect(mockCreatePerformerBatchFn).toHaveBeenCalledWith(expectedNewOptions);
      expect(mockUpdatePerformerBatchFn).toHaveBeenCalledWith(expectedEditedOptions);
      expect(mockDeletePerformerBatchFn).toHaveBeenCalledWith(expectedRemovedIds);
    });

    it("should call performers with empty arrays when no actual changes are identified", async () => {
      const currentDataNoChange: OptionsSectionData = { options: [{ ...opt1Server }, { ...opt2Server }] };
      const { save } = useOptionsSectionSaveOperation(experienceId);
      await save(lastSavedTwoOpts, currentDataNoChange);

      expect(mockCreatePerformerBatchFn).toHaveBeenCalledWith([]);
      expect(mockUpdatePerformerBatchFn).toHaveBeenCalledWith([]);
      expect(mockDeletePerformerBatchFn).toHaveBeenCalledWith([]);
    });

    it("should await all performer batch operations before resolving", async () => {
      let resolveCreate: (value: void[]) => void = () => {};
      let resolveUpdate: (value: void[]) => void = () => {};
      mockCreatePerformerBatchFn.mockReturnValue(
        new Promise<void[]>((res) => {
          resolveCreate = res;
        })
      );
      mockUpdatePerformerBatchFn.mockReturnValue(
        new Promise<void[]>((res) => {
          resolveUpdate = res;
        })
      );
      mockDeletePerformerBatchFn.mockResolvedValue([]);

      const currentDataForAwait: OptionsSectionData = {
        options: [{ ...optLocal1 }, { ...opt1Server, title: "Awaited Edit" }],
      };

      const expectedNew = [{ ...optLocal1 }];
      const expectedEdited = [{ ...opt1Server, title: "Awaited Edit" }];
      const expectedRemoved: string[] = [];

      const { save } = useOptionsSectionSaveOperation(experienceId);
      const savePromise = save(lastSavedOneOpt, currentDataForAwait);

      let promiseResolved = false;
      savePromise.then(() => {
        promiseResolved = true;
      });

      await vi.waitFor(() => expect(mockCreatePerformerBatchFn).toHaveBeenCalledWith(expectedNew));
      await vi.waitFor(() => expect(mockUpdatePerformerBatchFn).toHaveBeenCalledWith(expectedEdited));
      await vi.waitFor(() => expect(mockDeletePerformerBatchFn).toHaveBeenCalledWith(expectedRemoved));

      expect(promiseResolved).toBe(false);
      resolveCreate([]);
      await Promise.resolve(); // allow microtasks to run
      expect(promiseResolved).toBe(false);
      resolveUpdate([]);

      await expect(savePromise).resolves.toBeUndefined();
      expect(promiseResolved).toBe(true);
    });

    it("should propagate errors from performer batch operations", async () => {
      const currentDataForError: OptionsSectionData = { options: [{ ...optLocal1 }] };
      mockCreatePerformerBatchFn.mockRejectedValueOnce(new Error("Create failed in performer"));

      const { save } = useOptionsSectionSaveOperation(experienceId);
      await expect(save(lastSavedEmpty, currentDataForError)).rejects.toThrow("Create failed in performer");
    });
  });
});
