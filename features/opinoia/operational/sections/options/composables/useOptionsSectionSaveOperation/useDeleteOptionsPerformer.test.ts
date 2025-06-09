import { describe, it, expect, vi, beforeEach, afterEach, type MockedFunction } from "vitest";
import { ref, readonly, type Ref } from "vue";
import { useDeleteOptionsPerformer } from "./useDeleteOptionsPerformer";
import { useDeleteOptionMutation } from "../../mutations/useDeleteOptionMutation";

// --- Mocks ---
vi.mock("../../mutations/useDeleteOptionMutation", () => ({
  useDeleteOptionMutation: vi.fn(),
}));

// --- Typed Mocks ---
const mockedUseDeleteOptionMutation = useDeleteOptionMutation as MockedFunction<typeof useDeleteOptionMutation>;

describe("useDeleteOptionsPerformer", () => {
  let mockExperienceId: Readonly<Ref<string | undefined>>;
  let mockDeleteOptionMutationReturn: {
    mutateAsync: MockedFunction<(optionId: string) => Promise<void>>;
    isPending: Ref<boolean>;
  };

  const optionId1 = "opt_id_123";
  const optionId2 = "opt_id_456";
  const optionId3 = "opt_id_789";

  beforeEach(() => {
    const experienceIdRef = ref<string | undefined>("exp_delete_789");
    mockExperienceId = readonly(experienceIdRef);

    mockDeleteOptionMutationReturn = {
      mutateAsync: vi.fn().mockResolvedValue(undefined),
      isPending: ref(false),
    };
    mockedUseDeleteOptionMutation.mockReturnValue(mockDeleteOptionMutationReturn as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
    mockedUseDeleteOptionMutation.mockReset();
  });

  it("should initialize with useDeleteOptionMutation called with experienceId", () => {
    useDeleteOptionsPerformer(mockExperienceId);
    expect(mockedUseDeleteOptionMutation).toHaveBeenCalledTimes(1);
    expect(mockedUseDeleteOptionMutation).toHaveBeenCalledWith(mockExperienceId);
  });

  it("should initialize with isPerforming as false", () => {
    const { isPerforming } = useDeleteOptionsPerformer(mockExperienceId);
    expect(isPerforming.value).toBe(false);
  });

  it("performBatch should not call mutation and resolve if removedOptionIds is empty", async () => {
    const { performBatch } = useDeleteOptionsPerformer(mockExperienceId);
    await performBatch([]); // Await to ensure it resolves
    expect(mockDeleteOptionMutationReturn.mutateAsync).not.toHaveBeenCalled();
  });

  it("performBatch should delete a single optionId and resolve", async () => {
    const { performBatch } = useDeleteOptionsPerformer(mockExperienceId);
    await performBatch([optionId1]); // Await to ensure it resolves

    expect(mockDeleteOptionMutationReturn.mutateAsync).toHaveBeenCalledTimes(1);
    expect(mockDeleteOptionMutationReturn.mutateAsync).toHaveBeenCalledWith(optionId1);
  });

  it("performBatch should delete multiple optionIds and resolve", async () => {
    const { performBatch } = useDeleteOptionsPerformer(mockExperienceId);
    const idsToDelete = [optionId1, optionId2, optionId3];
    await performBatch(idsToDelete); // Await to ensure it resolves

    expect(mockDeleteOptionMutationReturn.mutateAsync).toHaveBeenCalledTimes(idsToDelete.length);
    expect(mockDeleteOptionMutationReturn.mutateAsync).toHaveBeenCalledWith(optionId1);
    expect(mockDeleteOptionMutationReturn.mutateAsync).toHaveBeenCalledWith(optionId2);
    expect(mockDeleteOptionMutationReturn.mutateAsync).toHaveBeenCalledWith(optionId3);
  });

  it("performBatch should handle errors from deleteOptionMutation.mutateAsync", async () => {
    const deleteError = new Error("Failed to delete option");
    mockDeleteOptionMutationReturn.mutateAsync.mockResolvedValueOnce(undefined).mockRejectedValueOnce(deleteError); // Second call fails

    const { performBatch } = useDeleteOptionsPerformer(mockExperienceId);
    const idsToDelete = [optionId1, optionId2, optionId3];

    await expect(performBatch(idsToDelete)).rejects.toThrow(deleteError);

    expect(mockDeleteOptionMutationReturn.mutateAsync).toHaveBeenCalledWith(optionId1);
    expect(mockDeleteOptionMutationReturn.mutateAsync).toHaveBeenCalledWith(optionId2);
    expect(mockDeleteOptionMutationReturn.mutateAsync).toHaveBeenCalledWith(optionId3);
    expect(mockDeleteOptionMutationReturn.mutateAsync).toHaveBeenCalledTimes(idsToDelete.length);
  });

  it("isPerforming should reactively update based on deleteOptionMutation.isPending", () => {
    const { isPerforming } = useDeleteOptionsPerformer(mockExperienceId);
    expect(isPerforming.value).toBe(false);

    mockDeleteOptionMutationReturn.isPending.value = true;
    expect(isPerforming.value).toBe(true);

    mockDeleteOptionMutationReturn.isPending.value = false;
    expect(isPerforming.value).toBe(false);
  });
});
