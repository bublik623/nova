import { ref, Ref } from "vue";
import { describe, it, expect, beforeEach, vi, Mock } from "vitest";

import { useConfigurationSectionSaveOperation } from "./useConfigurationSectionSaveOperation";
import { useUpdateExperienceCodeMutation } from "./mutations/useUpdateExperienceCodeMutation";
import { useUpdateLanguagesMutation } from "./mutations/useUpdateLanguagesMutation";
import { usePaxesStore } from "@/features/experience-raw/stores/usePaxesStore";
import { useRefundPoliciesStore } from "@/features/experience-shared/stores/useRefundPoliciesStore";
import { getChangedKeys } from "@/features/core-shared/utils/get-changed-keys/getChangedKeys";
import type { ConfigurationSectionData } from "./types";

type Mocks = {
  expCodePending: Ref<boolean>;
  mockUpdateExperienceCodeMutation: any;
  languagesPending: Ref<boolean>;
  mockUpdateLanguagesMutation: any;
  paxesSaving: Ref<boolean>;
  mockPaxesStore: any;
  refundSaving: Ref<boolean>;
  mockRefundPoliciesStore: any;
};

vi.mock("./mutations/useUpdateExperienceCodeMutation");
vi.mock("./mutations/useUpdateLanguagesMutation");
vi.mock("@/features/experience-raw/stores/usePaxesStore");
vi.mock("@/features/experience-shared/stores/useRefundPoliciesStore");
vi.mock("@/features/core-shared/utils/get-changed-keys/getChangedKeys");

describe("useConfigurationSectionSaveOperation", () => {
  let mocks: Mocks;
  let lastData: ConfigurationSectionData;
  let currentData: ConfigurationSectionData;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock updateExperienceCodeMutation
    mocks = {} as Mocks;
    mocks.expCodePending = ref(false);
    mocks.mockUpdateExperienceCodeMutation = {
      isPending: mocks.expCodePending,
      mutateAsync: vi.fn().mockResolvedValue(undefined),
    };
    (useUpdateExperienceCodeMutation as Mock).mockReturnValue(mocks.mockUpdateExperienceCodeMutation);

    // Mock updateLanguagesMutation
    mocks.languagesPending = ref(false);
    mocks.mockUpdateLanguagesMutation = {
      isPending: mocks.languagesPending,
      mutateAsync: vi.fn().mockResolvedValue(undefined),
    };
    (useUpdateLanguagesMutation as Mock).mockReturnValue(mocks.mockUpdateLanguagesMutation);

    // Mock paxesStore
    mocks.paxesSaving = ref(false);
    mocks.mockPaxesStore = {
      isSaving: mocks.paxesSaving,
      setPaxes: vi.fn(),
      setHasChanges: vi.fn(),
      save: vi.fn().mockResolvedValue(undefined),
    };
    (usePaxesStore as Mock).mockReturnValue(mocks.mockPaxesStore);

    // Mock refundPoliciesStore
    mocks.refundSaving = ref(false);
    mocks.mockRefundPoliciesStore = {
      isSaving: mocks.refundSaving,
      field: { value: null },
      saveRefundPolicies: vi.fn().mockResolvedValue(undefined),
    };
    (useRefundPoliciesStore as Mock).mockReturnValue(mocks.mockRefundPoliciesStore);

    // Default data objects
    lastData = {
      configuration: {
        experienceCode: { value: "oldCode" },
        languages: { value: ["en"] },
        paxes: { value: [1] },
        refundPolicies: { value: ["policy1"] },
      },
    };
    currentData = {
      configuration: {
        experienceCode: { value: "newCode" },
        languages: { value: ["en", "it"] },
        paxes: { value: [2] },
        refundPolicies: { value: ["policy2"] },
      },
    };
  });

  it("should have isSaving false when nothing is saving", () => {
    mocks.expCodePending.value = false;
    mocks.languagesPending.value = false;
    mocks.paxesSaving.value = false;
    mocks.refundSaving.value = false;

    const { isSaving } = useConfigurationSectionSaveOperation(ref("exp1"));
    expect(isSaving.value.value).toBe(false);
  });

  it("should not invoke any save operations when no keys changed", async () => {
    (getChangedKeys as Mock).mockReturnValue([]);
    const { save } = useConfigurationSectionSaveOperation(ref("exp1"));

    await save(lastData, currentData);

    expect(mocks.mockUpdateExperienceCodeMutation.mutateAsync).not.toHaveBeenCalled();
    expect(mocks.mockUpdateLanguagesMutation.mutateAsync).not.toHaveBeenCalled();
    expect(mocks.mockPaxesStore.setPaxes).not.toHaveBeenCalled();
    expect(mocks.mockPaxesStore.setHasChanges).not.toHaveBeenCalled();
    expect(mocks.mockPaxesStore.save).not.toHaveBeenCalled();
    expect(mocks.mockRefundPoliciesStore.saveRefundPolicies).not.toHaveBeenCalled();
  });

  it("should save experienceCode when changed", async () => {
    (getChangedKeys as Mock).mockReturnValue(["experienceCode"]);
    const { save } = useConfigurationSectionSaveOperation(ref("exp1"));

    await save(lastData, currentData);

    expect(mocks.mockUpdateExperienceCodeMutation.mutateAsync).toHaveBeenCalledWith("newCode");
    expect(mocks.mockUpdateLanguagesMutation.mutateAsync).not.toHaveBeenCalled();
    expect(mocks.mockPaxesStore.setPaxes).not.toHaveBeenCalled();
    expect(mocks.mockRefundPoliciesStore.saveRefundPolicies).not.toHaveBeenCalled();
  });

  it("should save languages when changed", async () => {
    (getChangedKeys as Mock).mockReturnValue(["languages"]);
    const { save } = useConfigurationSectionSaveOperation(ref("exp1"));

    await save(lastData, currentData);

    expect(mocks.mockUpdateLanguagesMutation.mutateAsync).toHaveBeenCalledWith(
      currentData.configuration.languages.value
    );
    expect(mocks.mockUpdateExperienceCodeMutation.mutateAsync).not.toHaveBeenCalled();
  });

  it("should save paxes when changed", async () => {
    (getChangedKeys as Mock).mockReturnValue(["paxes"]);
    const { save } = useConfigurationSectionSaveOperation(ref("exp1"));

    await save(lastData, currentData);

    expect(mocks.mockPaxesStore.setPaxes).toHaveBeenCalledWith(currentData.configuration.paxes.value);
    expect(mocks.mockPaxesStore.setHasChanges).toHaveBeenCalledWith(true);
    expect(mocks.mockPaxesStore.save).toHaveBeenCalled();
  });

  it("should save refundPolicies when changed", async () => {
    (getChangedKeys as Mock).mockReturnValue(["refundPolicies"]);
    const { save } = useConfigurationSectionSaveOperation(ref("exp1"));

    await save(lastData, currentData);

    expect(mocks.mockRefundPoliciesStore.field.value).toEqual(currentData.configuration.refundPolicies.value);
    expect(mocks.mockRefundPoliciesStore.saveRefundPolicies).toHaveBeenCalledTimes(1);
  });

  it("should save multiple changed keys", async () => {
    (getChangedKeys as Mock).mockReturnValue(["experienceCode", "paxes"]);
    const { save } = useConfigurationSectionSaveOperation(ref("exp1"));

    await save(lastData, currentData);

    expect(mocks.mockUpdateExperienceCodeMutation.mutateAsync).toHaveBeenCalledWith("newCode");
    expect(mocks.mockPaxesStore.setPaxes).toHaveBeenCalledWith(currentData.configuration.paxes.value);
    expect(mocks.mockPaxesStore.save).toHaveBeenCalled();
  });
});
