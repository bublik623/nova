import { describe, it, expect, vi, beforeEach, afterEach, type MockedFunction } from "vitest";
import { ref, readonly, type Ref } from "vue";
import { useUpdateOptionsPerformer } from "./useUpdateOptionsPerformer";
import * as mappers from "../../mappers/mappers";
import { PutOptionMutationPayload, usePutOptionMutation } from "../../mutations/usePutOptionMutation";
import { PutOptionPaxesMutationPayload, usePutOptionPaxesMutation } from "../../mutations/usePutOptionPaxesMutation";
import { Option } from "../../types";

// --- Mocks ---
vi.mock("../../mappers/mappers", () => ({
  mapToExistingOptionApiPayload: vi.fn(),
  mapToOptionPaxesApiPayload: vi.fn(),
}));

vi.mock("../../mutations/usePutOptionMutation", () => ({
  usePutOptionMutation: vi.fn(),
}));

vi.mock("../../mutations/usePutOptionPaxesMutation", () => ({
  usePutOptionPaxesMutation: vi.fn(),
}));

// --- Typed Mocks ---
const mockedToExistingOptionApiResource = mappers.mapToExistingOptionApiPayload as MockedFunction<
  typeof mappers.mapToExistingOptionApiPayload
>;
const mockedToOptionPaxesApiResource = mappers.mapToOptionPaxesApiPayload as MockedFunction<
  typeof mappers.mapToOptionPaxesApiPayload
>;
const mockedUsePutOptionMutation = usePutOptionMutation as MockedFunction<typeof usePutOptionMutation>;
const mockedUsePutOptionPaxesMutation = usePutOptionPaxesMutation as MockedFunction<typeof usePutOptionPaxesMutation>;

const MOCKED_EXISTING_OPTION_PAYLOAD: PutOptionMutationPayload = {
  id: "opt_existing_1",
  name: "Updated Adventure Tour Payload",
  experience: "static_experience_id_from_payload",
  multilanguage: true,
  capacity_type: "pax",
  code: "PAYLOAD_CODE_001",
  duration: "PT2H",
  valid_for: "P30D",
  status: "active",
  allowed_languages: [{ language: "de" }],
  pricing_type_allowed: "group",
};
const MOCKED_OPTION_PAXES_PAYLOAD: PutOptionPaxesMutationPayload = {
  option_id: "static_pax_option_id_from_payload",
  pax_list: [{ pax_code: "SENIOR_MOCK" }, { pax_code: "YOUTH_MOCK" }],
};

describe("useUpdateOptionsPerformer", () => {
  let mockExperienceId: Readonly<Ref<string | undefined>>;
  let mockPutOptionMutationReturn: {
    mutateAsync: MockedFunction<(payload: PutOptionMutationPayload) => Promise<void>>;
    isPending: Ref<boolean>;
  };
  let mockPutOptionPaxesMutationReturn: {
    mutateAsync: MockedFunction<(payload: PutOptionPaxesMutationPayload) => Promise<void>>;
    isPending: Ref<boolean>;
  };

  const editedOption1: Option = {
    id: "opt_existing_1",
    title: "Updated Adventure Tour",
    code: "ADV001_UPD",
    duration: 100,
    subchannels: ["web"],
    paxTypes: ["adult"],
  };

  const editedOption2: Option = {
    id: "opt_existing_2",
    title: "Revised City Highlights",
    code: "CITY002_REV",
    duration: 130,
    subchannels: "all",
    paxTypes: "all",
  };

  beforeEach(() => {
    const experienceIdRef = ref<string | undefined>("exp_update_456");
    mockExperienceId = readonly(experienceIdRef);

    mockPutOptionMutationReturn = {
      mutateAsync: vi.fn().mockResolvedValue(undefined),
      isPending: ref(false),
    };
    mockedUsePutOptionMutation.mockReturnValue(mockPutOptionMutationReturn as any);

    mockPutOptionPaxesMutationReturn = {
      mutateAsync: vi.fn().mockResolvedValue(undefined),
      isPending: ref(false),
    };
    mockedUsePutOptionPaxesMutation.mockReturnValue(mockPutOptionPaxesMutationReturn as any);

    mockedToExistingOptionApiResource.mockReturnValue(MOCKED_EXISTING_OPTION_PAYLOAD);
    mockedToOptionPaxesApiResource.mockReturnValue(MOCKED_OPTION_PAXES_PAYLOAD);
  });

  afterEach(() => {
    vi.clearAllMocks();
    mockedToExistingOptionApiResource.mockReset();
    mockedToOptionPaxesApiResource.mockReset();
    mockedUsePutOptionMutation.mockReset();
    mockedUsePutOptionPaxesMutation.mockReset();
  });

  it("should initialize mutation hooks, with usePutOptionMutation getting experienceId", () => {
    useUpdateOptionsPerformer(mockExperienceId);
    expect(mockedUsePutOptionMutation).toHaveBeenCalledTimes(1);
    expect(mockedUsePutOptionMutation).toHaveBeenCalledWith(mockExperienceId);
    expect(mockedUsePutOptionPaxesMutation).toHaveBeenCalledTimes(1);
  });

  it("should initialize with isPerforming as false", () => {
    const { isPerforming } = useUpdateOptionsPerformer(mockExperienceId);
    expect(isPerforming.value).toBe(false);
  });

  it("performBatch should not call mappers or mutations and resolve if editedOptions is empty", async () => {
    const { performBatch } = useUpdateOptionsPerformer(mockExperienceId);
    await performBatch([]); // Await for completion, implicitly resolves to undefined

    expect(mockedToExistingOptionApiResource).not.toHaveBeenCalled();
    expect(mockedToOptionPaxesApiResource).not.toHaveBeenCalled();
    expect(mockPutOptionMutationReturn.mutateAsync).not.toHaveBeenCalled();
    expect(mockPutOptionPaxesMutationReturn.mutateAsync).not.toHaveBeenCalled();
  });

  it("performBatch should throw error if experienceId is undefined when editedOptions are provided", async () => {
    const experienceIdRef = ref<string | undefined>(undefined);
    const performer = useUpdateOptionsPerformer(readonly(experienceIdRef));

    await expect(performer.performBatch([editedOption1])).rejects.toThrow("no valid experience id for update");
    expect(mockedToExistingOptionApiResource).not.toHaveBeenCalled();
  });

  it("performBatch should update a single option and resolve", async () => {
    const { performBatch } = useUpdateOptionsPerformer(mockExperienceId);
    await performBatch([editedOption1]);

    expect(mockedToExistingOptionApiResource).toHaveBeenCalledTimes(1);
    expect(mockedToExistingOptionApiResource).toHaveBeenCalledWith(mockExperienceId.value, editedOption1);
    expect(mockedToOptionPaxesApiResource).toHaveBeenCalledTimes(1);
    expect(mockedToOptionPaxesApiResource).toHaveBeenCalledWith(editedOption1);

    expect(mockPutOptionMutationReturn.mutateAsync).toHaveBeenCalledTimes(1);
    expect(mockPutOptionMutationReturn.mutateAsync).toHaveBeenCalledWith(MOCKED_EXISTING_OPTION_PAYLOAD);
    expect(mockPutOptionPaxesMutationReturn.mutateAsync).toHaveBeenCalledTimes(1);
    expect(mockPutOptionPaxesMutationReturn.mutateAsync).toHaveBeenCalledWith(MOCKED_OPTION_PAXES_PAYLOAD);
  });

  it("performBatch should update multiple options and resolve", async () => {
    const { performBatch } = useUpdateOptionsPerformer(mockExperienceId);
    const optionsToUpdate = [editedOption1, editedOption2];
    await performBatch(optionsToUpdate);

    expect(mockedToExistingOptionApiResource).toHaveBeenCalledTimes(optionsToUpdate.length);
    expect(mockedToExistingOptionApiResource).toHaveBeenCalledWith(mockExperienceId.value, editedOption1);
    expect(mockedToExistingOptionApiResource).toHaveBeenCalledWith(mockExperienceId.value, editedOption2);

    expect(mockedToOptionPaxesApiResource).toHaveBeenCalledTimes(optionsToUpdate.length);
    expect(mockedToOptionPaxesApiResource).toHaveBeenCalledWith(editedOption1);
    expect(mockedToOptionPaxesApiResource).toHaveBeenCalledWith(editedOption2);

    expect(mockPutOptionMutationReturn.mutateAsync).toHaveBeenCalledTimes(optionsToUpdate.length);
    expect(mockPutOptionMutationReturn.mutateAsync).toHaveBeenNthCalledWith(1, MOCKED_EXISTING_OPTION_PAYLOAD);
    expect(mockPutOptionMutationReturn.mutateAsync).toHaveBeenNthCalledWith(2, MOCKED_EXISTING_OPTION_PAYLOAD);

    expect(mockPutOptionPaxesMutationReturn.mutateAsync).toHaveBeenCalledTimes(optionsToUpdate.length);
    expect(mockPutOptionPaxesMutationReturn.mutateAsync).toHaveBeenNthCalledWith(1, MOCKED_OPTION_PAXES_PAYLOAD);
    expect(mockPutOptionPaxesMutationReturn.mutateAsync).toHaveBeenNthCalledWith(2, MOCKED_OPTION_PAXES_PAYLOAD);
  });

  it("performBatch should handle errors from putOptionMutation", async () => {
    const updateError = new Error("Failed to update option details");
    mockPutOptionMutationReturn.mutateAsync.mockRejectedValueOnce(updateError);

    const { performBatch } = useUpdateOptionsPerformer(mockExperienceId);
    const optionsToUpdate = [editedOption1, editedOption2];

    await expect(performBatch(optionsToUpdate)).rejects.toThrow(updateError);

    expect(mockedToExistingOptionApiResource).toHaveBeenCalledWith(mockExperienceId.value, editedOption1);
    expect(mockedToOptionPaxesApiResource).toHaveBeenCalledWith(editedOption1);
    expect(mockPutOptionMutationReturn.mutateAsync).toHaveBeenCalledWith(MOCKED_EXISTING_OPTION_PAYLOAD);
    expect(mockPutOptionPaxesMutationReturn.mutateAsync).toHaveBeenCalledWith(MOCKED_OPTION_PAXES_PAYLOAD);

    expect(mockedToExistingOptionApiResource).toHaveBeenCalledWith(mockExperienceId.value, editedOption2);
    expect(mockedToOptionPaxesApiResource).toHaveBeenCalledWith(editedOption2);
    expect(mockPutOptionMutationReturn.mutateAsync).toHaveBeenCalledTimes(optionsToUpdate.length);
    expect(mockPutOptionPaxesMutationReturn.mutateAsync).toHaveBeenCalledTimes(optionsToUpdate.length);
  });

  it("performBatch should handle errors from putOptionPaxesMutation", async () => {
    const paxesError = new Error("Failed to update option paxes");
    mockPutOptionPaxesMutationReturn.mutateAsync.mockRejectedValueOnce(paxesError);

    const { performBatch } = useUpdateOptionsPerformer(mockExperienceId);
    const optionsToUpdate = [editedOption1, editedOption2];

    await expect(performBatch(optionsToUpdate)).rejects.toThrow(paxesError);

    expect(mockedToExistingOptionApiResource).toHaveBeenCalledWith(mockExperienceId.value, editedOption1);
    expect(mockedToOptionPaxesApiResource).toHaveBeenCalledWith(editedOption1);
    expect(mockPutOptionMutationReturn.mutateAsync).toHaveBeenCalledWith(MOCKED_EXISTING_OPTION_PAYLOAD);
    expect(mockPutOptionPaxesMutationReturn.mutateAsync).toHaveBeenCalledWith(MOCKED_OPTION_PAXES_PAYLOAD);

    expect(mockPutOptionMutationReturn.mutateAsync).toHaveBeenCalledTimes(optionsToUpdate.length);
    expect(mockPutOptionPaxesMutationReturn.mutateAsync).toHaveBeenCalledTimes(optionsToUpdate.length);
  });

  it("isPerforming should be true if putOptionMutation is pending", () => {
    const { isPerforming } = useUpdateOptionsPerformer(mockExperienceId);
    mockPutOptionMutationReturn.isPending.value = true;
    expect(isPerforming.value).toBe(true);
  });

  it("isPerforming should be true if putOptionPaxesMutation is pending", () => {
    const { isPerforming } = useUpdateOptionsPerformer(mockExperienceId);
    mockPutOptionPaxesMutationReturn.isPending.value = true;
    expect(isPerforming.value).toBe(true);
  });

  it("isPerforming should be false if no mutations are pending", () => {
    const { isPerforming } = useUpdateOptionsPerformer(mockExperienceId);
    mockPutOptionMutationReturn.isPending.value = false;
    mockPutOptionPaxesMutationReturn.isPending.value = false;
    expect(isPerforming.value).toBe(false);
  });
});
