import { describe, it, expect, vi, beforeAll } from "vitest";
import { useDistributionAttributes } from "../useDistributionAttributes";

vi.stubGlobal("useNuxtApp", () => ({ $t: (s: string) => s }));

const mockedUseDistributionContentStore = {
  values: { curation_level: "DEDICATED", priority: 1 },
  save: vi.fn(),
  updateValues: vi.fn(),
};

vi.mock("@/features/experience-shared/stores/useDistributionContentStore", () => {
  return { useDistributionContentStore: () => mockedUseDistributionContentStore };
});

describe("useDistributionAttributes.vue", () => {
  beforeAll(() => {
    vi.resetAllMocks();
  });
  it("initializes with default values", () => {
    const { attributeValues, curationOptions, priorityOptions } = useDistributionAttributes();

    expect(attributeValues.value.curationLevel).toBe("DEDICATED");
    expect(attributeValues.value.priority).toBe(1);
    expect(curationOptions.value).toHaveLength(8);
    expect(priorityOptions.value).toHaveLength(4);
  });

  it("sets curation level and priority correctly", async () => {
    const { setCurationLevel, setPriority } = useDistributionAttributes();
    setCurationLevel("FULL_CURATION");
    setPriority(2);

    expect(mockedUseDistributionContentStore.updateValues).toHaveBeenNthCalledWith(1, {
      curation_level: "FULL_CURATION",
    });

    expect(mockedUseDistributionContentStore.updateValues).toHaveBeenNthCalledWith(2, {
      priority: 2,
    });
  });

  it("sets the initial values", async () => {
    const { setCurationLevel, setPriority, attributeValues } = useDistributionAttributes();
    setCurationLevel("DEDICATED");
    setPriority(1);

    expect(attributeValues.value.curationLevel).toBe("DEDICATED");
    expect(attributeValues.value.priority).toBe(1);
  });

  it("saveData calls the distribution content store", async () => {
    const { saveData, setCurationLevel, setPriority } = useDistributionAttributes();
    setCurationLevel("DEDICATED");
    setPriority(1);

    await saveData("test-experience-id");

    expect(mockedUseDistributionContentStore.save).toHaveBeenCalled();
  });
});
