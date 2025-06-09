import { describe, it, expect, vi, beforeEach, afterEach, type MockedFunction } from "vitest";
import { ref, readonly, type Ref } from "vue";
import { useCreateOptionsPerformer } from "./useCreateOptionsPerformer";
import * as mappers from "../../mappers/mappers";
import { PostOptionMutationPayload, usePostOptionMutation } from "../../mutations/usePostOptionMutation";
import { PutOptionPaxesMutationPayload, usePutOptionPaxesMutation } from "../../mutations/usePutOptionPaxesMutation";
import { Option } from "../../types";

// --- Mocks for external dependencies (not Vue core) ---
vi.mock("../../mappers/mappers", () => ({
  mapToNewOptionApiPayload: vi.fn(),
  mapToOptionPaxesApiPayload: vi.fn(),
}));

vi.mock("../../mutations/usePostOptionMutation", () => ({
  usePostOptionMutation: vi.fn(),
}));

vi.mock("../../mutations/usePutOptionPaxesMutation", () => ({
  usePutOptionPaxesMutation: vi.fn(),
}));

// --- Typed Mocks ---
const mockedToNewOptionApiResource = mappers.mapToNewOptionApiPayload as MockedFunction<
  typeof mappers.mapToNewOptionApiPayload
>;
const mockedToOptionPaxesApiResource = mappers.mapToOptionPaxesApiPayload as MockedFunction<
  typeof mappers.mapToOptionPaxesApiPayload
>;
const mockedUsePostOptionMutation = usePostOptionMutation as MockedFunction<typeof usePostOptionMutation>;
const mockedUsePutOptionPaxesMutation = usePutOptionPaxesMutation as MockedFunction<typeof usePutOptionPaxesMutation>;

// Define simple, non-realistic return values for mappers
const MOCKED_NEW_OPTION_PAYLOAD: PostOptionMutationPayload = {
  name: "Static Mocked Option Name",
  experience: "static_experience_id_123",
  multilanguage: true,
  capacity_type: "pax",
  code: "STATIC_CODE_001",
  duration: "PT1H30M",
  valid_for: "P14D",
  status: "draft",
  allowed_languages: [{ language: "en" }, { language: "fr" }],
  pricing_type_allowed: "person",
};
const MOCKED_OPTION_PAXES_PAYLOAD: PutOptionPaxesMutationPayload = {
  option_id: "static_option_id_for_paxes_XYZ",
  pax_list: [{ pax_code: "ADULT_STATIC" }, { pax_code: "CHILD_STATIC" }],
};

describe("useCreateOptionsPerformer", () => {
  let mockExperienceId: Readonly<Ref<string | undefined>>;
  let mockPostOptionMutationReturn: {
    mutateAsync: MockedFunction<any>;
    isPending: Ref<boolean>;
  };
  let mockPutOptionPaxesMutationReturn: {
    mutateAsync: MockedFunction<any>;
    isPending: Ref<boolean>;
  };

  const mockNewOption1: Option = {
    id: "temp-1",
    title: "Test Option 1",
    code: "OPT001",
    subchannels: ["web", "mobile"],
    paxTypes: ["adult", "child"],
    duration: 60,
  };

  const mockNewOption2: Option = {
    id: "temp-2",
    title: "Test Option 2",
    code: "OPT002",
    subchannels: "all",
    paxTypes: "all",
  };

  beforeEach(() => {
    const experienceIdRef = ref<string | undefined>("exp123");
    mockExperienceId = readonly(experienceIdRef);

    mockPostOptionMutationReturn = {
      mutateAsync: vi.fn(),
      isPending: ref(false),
    };
    mockedUsePostOptionMutation.mockReturnValue(mockPostOptionMutationReturn as any);

    mockPutOptionPaxesMutationReturn = {
      mutateAsync: vi.fn(),
      isPending: ref(false),
    };
    mockedUsePutOptionPaxesMutation.mockReturnValue(mockPutOptionPaxesMutationReturn as any);

    // Configure mappers to return simple, non-realistic objects
    mockedToNewOptionApiResource.mockReturnValue(MOCKED_NEW_OPTION_PAYLOAD);
    mockedToOptionPaxesApiResource.mockReturnValue(MOCKED_OPTION_PAXES_PAYLOAD);
  });

  afterEach(() => {
    vi.clearAllMocks();
    // Resetting mock implementations is good practice if they are set in beforeEach
    mockedToNewOptionApiResource.mockReset();
    mockedToOptionPaxesApiResource.mockReset();
    mockedUsePostOptionMutation.mockReset();
    mockedUsePutOptionPaxesMutation.mockReset();
  });

  it("should initialize with isPerforming as false", () => {
    const { isPerforming } = useCreateOptionsPerformer(mockExperienceId);
    expect(isPerforming.value).toBe(false);
  });

  it("performBatch should return early if newOptions is empty", async () => {
    const { performBatch } = useCreateOptionsPerformer(mockExperienceId);
    await performBatch([]);
    expect(mockedToNewOptionApiResource).not.toHaveBeenCalled();
    expect(mockPostOptionMutationReturn.mutateAsync).not.toHaveBeenCalled();
    expect(mockedToOptionPaxesApiResource).not.toHaveBeenCalled();
    expect(mockPutOptionPaxesMutationReturn.mutateAsync).not.toHaveBeenCalled();
  });

  it("performBatch should throw error if experienceId is undefined or null", async () => {
    const originalExperienceIdRef = ref<string | undefined>(undefined);
    const testExperienceId = readonly(originalExperienceIdRef);
    const { performBatch } = useCreateOptionsPerformer(testExperienceId);
    await expect(performBatch([mockNewOption1])).rejects.toThrow("no valid experience id");
  });

  it("performBatch should create options and update paxes successfully for a single option", async () => {
    const newServerOptionId = "opt999";
    mockPostOptionMutationReturn.mutateAsync.mockResolvedValue({
      headers: { location: `/api/options/${newServerOptionId}` },
    });
    mockPutOptionPaxesMutationReturn.mutateAsync.mockResolvedValue({});

    const { performBatch } = useCreateOptionsPerformer(mockExperienceId);
    await performBatch([mockNewOption1]);

    // Verify mappers are called with correct inputs
    expect(mockedToNewOptionApiResource).toHaveBeenCalledTimes(1);
    expect(mockedToNewOptionApiResource).toHaveBeenCalledWith(mockExperienceId.value, mockNewOption1);

    // Verify mutations are called with the output of mappers
    expect(mockPostOptionMutationReturn.mutateAsync).toHaveBeenCalledTimes(1);
    expect(mockPostOptionMutationReturn.mutateAsync).toHaveBeenCalledWith(MOCKED_NEW_OPTION_PAYLOAD);

    const expectedArgForPaxMapper = { ...mockNewOption1, id: newServerOptionId };
    expect(mockedToOptionPaxesApiResource).toHaveBeenCalledTimes(1);
    expect(mockedToOptionPaxesApiResource).toHaveBeenCalledWith(expectedArgForPaxMapper);

    expect(mockPutOptionPaxesMutationReturn.mutateAsync).toHaveBeenCalledTimes(1);
    expect(mockPutOptionPaxesMutationReturn.mutateAsync).toHaveBeenCalledWith(MOCKED_OPTION_PAXES_PAYLOAD);
  });

  it("performBatch should process multiple options", async () => {
    const newOptionId1 = "opt001";
    const newOptionId2 = "opt002";

    mockPostOptionMutationReturn.mutateAsync
      .mockResolvedValueOnce({ headers: { location: `some/path/to/${newOptionId1}` } })
      .mockResolvedValueOnce({ headers: { location: `other/path/${newOptionId2}` } });
    mockPutOptionPaxesMutationReturn.mutateAsync.mockResolvedValue({});

    const { performBatch } = useCreateOptionsPerformer(mockExperienceId);
    await performBatch([mockNewOption1, mockNewOption2]);

    expect(mockedToNewOptionApiResource).toHaveBeenCalledTimes(2);
    expect(mockPostOptionMutationReturn.mutateAsync).toHaveBeenCalledTimes(2);
    expect(mockPostOptionMutationReturn.mutateAsync).toHaveBeenNthCalledWith(1, MOCKED_NEW_OPTION_PAYLOAD);
    expect(mockPostOptionMutationReturn.mutateAsync).toHaveBeenNthCalledWith(2, MOCKED_NEW_OPTION_PAYLOAD);

    expect(mockedToOptionPaxesApiResource).toHaveBeenCalledTimes(2);
    expect(mockedToOptionPaxesApiResource).toHaveBeenNthCalledWith(1, { ...mockNewOption1, id: newOptionId1 });
    expect(mockedToOptionPaxesApiResource).toHaveBeenNthCalledWith(2, { ...mockNewOption2, id: newOptionId2 });

    expect(mockPutOptionPaxesMutationReturn.mutateAsync).toHaveBeenCalledTimes(2);
    expect(mockPutOptionPaxesMutationReturn.mutateAsync).toHaveBeenNthCalledWith(1, MOCKED_OPTION_PAXES_PAYLOAD);
    expect(mockPutOptionPaxesMutationReturn.mutateAsync).toHaveBeenNthCalledWith(2, MOCKED_OPTION_PAXES_PAYLOAD);
  });

  it("isPerforming should reactively update based on postOptionMutation.isPending", () => {
    const { isPerforming } = useCreateOptionsPerformer(mockExperienceId);
    expect(isPerforming.value).toBe(false);
    mockPostOptionMutationReturn.isPending.value = true;
    expect(isPerforming.value).toBe(true);
    mockPostOptionMutationReturn.isPending.value = false;
    expect(isPerforming.value).toBe(false);
  });

  it("isPerforming should reactively update based on putOptionPaxesMutation.isPending", () => {
    const { isPerforming } = useCreateOptionsPerformer(mockExperienceId);
    expect(isPerforming.value).toBe(false);
    mockPutOptionPaxesMutationReturn.isPending.value = true;
    expect(isPerforming.value).toBe(true);
    mockPutOptionPaxesMutationReturn.isPending.value = false;
    expect(isPerforming.value).toBe(false);
  });

  it("isPerforming should be true if both mutations are pending", () => {
    const { isPerforming } = useCreateOptionsPerformer(mockExperienceId);
    expect(isPerforming.value).toBe(false);
    mockPostOptionMutationReturn.isPending.value = true;
    mockPutOptionPaxesMutationReturn.isPending.value = true;
    expect(isPerforming.value).toBe(true);
    mockPostOptionMutationReturn.isPending.value = false;
    mockPutOptionPaxesMutationReturn.isPending.value = false;
    expect(isPerforming.value).toBe(false);
  });

  it("performBatch should handle errors from postOptionMutation", async () => {
    const postError = new Error("Failed to post option");
    mockPostOptionMutationReturn.mutateAsync.mockRejectedValue(postError);

    const { performBatch } = useCreateOptionsPerformer(mockExperienceId);

    await expect(performBatch([mockNewOption1])).rejects.toThrow("Failed to post option");
    expect(mockedToNewOptionApiResource).toHaveBeenCalledWith(mockExperienceId.value, mockNewOption1); // Mapper is called
    expect(mockPostOptionMutationReturn.mutateAsync).toHaveBeenCalledWith(MOCKED_NEW_OPTION_PAYLOAD); // Mutation is attempted
    // Subsequent calls should not happen
    expect(mockedToOptionPaxesApiResource).not.toHaveBeenCalled();
    expect(mockPutOptionPaxesMutationReturn.mutateAsync).not.toHaveBeenCalled();
  });

  it("performBatch should handle errors from putOptionPaxesMutation", async () => {
    const newServerOptionId = "opt777";
    mockPostOptionMutationReturn.mutateAsync.mockResolvedValue({
      headers: { location: `/api/options/${newServerOptionId}` },
    });
    const paxesError = new Error("Failed to update paxes");
    mockPutOptionPaxesMutationReturn.mutateAsync.mockRejectedValue(paxesError);

    const { performBatch } = useCreateOptionsPerformer(mockExperienceId);

    await expect(performBatch([mockNewOption1])).rejects.toThrow("Failed to update paxes");
    // Ensure prior steps were still called
    expect(mockedToNewOptionApiResource).toHaveBeenCalledTimes(1);
    expect(mockPostOptionMutationReturn.mutateAsync).toHaveBeenCalledWith(MOCKED_NEW_OPTION_PAYLOAD);
    expect(mockedToOptionPaxesApiResource).toHaveBeenCalledTimes(1);
    expect(mockedToOptionPaxesApiResource).toHaveBeenCalledWith({ ...mockNewOption1, id: newServerOptionId });
    expect(mockPutOptionPaxesMutationReturn.mutateAsync).toHaveBeenCalledWith(MOCKED_OPTION_PAXES_PAYLOAD); // Pax mutation is attempted
  });

  it("performBatch should correctly extract optionId from location header", async () => {
    const newOptionId = "id-123-alpha-beta";
    mockPostOptionMutationReturn.mutateAsync.mockResolvedValue({
      headers: { location: `https://api.example.com/v1/tenant/xyz/options/${newOptionId}` },
    });
    mockPutOptionPaxesMutationReturn.mutateAsync.mockResolvedValue({});

    const { performBatch } = useCreateOptionsPerformer(mockExperienceId);
    await performBatch([mockNewOption1]);

    // toOptionPaxesApiResource is called with the correctly extracted ID
    expect(mockedToOptionPaxesApiResource).toHaveBeenCalledWith(expect.objectContaining({ id: newOptionId }));
    // And subsequently, the putOptionPaxesMutation is called with the (non-realistic) mocked payload
    expect(mockPutOptionPaxesMutationReturn.mutateAsync).toHaveBeenCalledWith(MOCKED_OPTION_PAXES_PAYLOAD);
  });
});
