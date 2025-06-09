vi.mock("nanoid", () => ({ nanoid: () => "mocked-id" }));
vi.mock("lodash", () => ({ cloneDeep: (obj: any) => JSON.parse(JSON.stringify(obj)) }));

const mockExperience = { data: { value: { configuration: { experienceCode: { value: "Experience Title" } } } } };
const mockOptions = [
  { id: "opt1", code: "Option 1" },
  { id: "opt2", code: "Option 2" },
];

vi.mock("@/features/opinoia/operational/sections/options/composables/useLastSavedOptionsSectionData", () => ({
  useLastSavedOptionsSectionData: () => ({
    data: { value: { options: mockOptions } },
  }),
}));

vi.mock("@/features/opinoia/operational/sections/configuration/useLastSavedConfigurationSectionData", () => ({
  useLastSavedConfigurationSectionData: () => mockExperience,
}));

import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import { createPinia, setActivePinia } from "pinia";
import { useAllotmentTable } from "../useAllotmentTable";
import { AllotmentData } from "../../types";
import { ALLOTMENT_AT_EXPERIENCE_LEVEL } from "../useAllotmentTable";
describe("useAllotmentTable", () => {
  let allotments: ReturnType<typeof ref<AllotmentData[]>>;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    allotments = ref<AllotmentData[]>([
      {
        id: "a1",
        isAtExperienceLevel: false,
        optionId: "opt1",
        dates: undefined,
        languages: [],
        monday: undefined,
        tuesday: undefined,
        wednesday: undefined,
        thursday: undefined,
        friday: undefined,
        saturday: undefined,
        sunday: undefined,
      },
    ]);
  });

  it("adds a new allotment", () => {
    const { addNewAllotment } = useAllotmentTable({ allotments, experienceId: "exp1" });
    addNewAllotment();
    expect(allotments.value.length).toBe(2);
    expect(allotments.value[1].id).toBe("mocked-id");
    expect(allotments.value[1].isAtExperienceLevel).toBe(false);
  });

  it("duplicates an allotment", () => {
    const { duplicateAllotment } = useAllotmentTable({ allotments, experienceId: "exp1" });
    duplicateAllotment(allotments.value[0]);
    expect(allotments.value.length).toBe(2);
    expect(allotments.value[1].id).toBe("mocked-id");
    expect(allotments.value[1].optionId).toBe("opt1");
    expect(allotments.value[1]).not.toBe(allotments.value[0]);
  });

  it("removes an allotment", () => {
    const { removeAllotment } = useAllotmentTable({ allotments, experienceId: "exp1" });
    removeAllotment(allotments.value[0]);
    expect(allotments.value.length).toBe(0);
  });

  it("returns correct options", () => {
    const { optionListWithExperience } = useAllotmentTable({ allotments, experienceId: "exp1" });
    expect(optionListWithExperience.value[0]).toEqual({
      value: ALLOTMENT_AT_EXPERIENCE_LEVEL,
      label: "Experience Title(Exp)",
    });
    expect(optionListWithExperience.value[1]).toEqual({
      value: "opt1",
      label: "Option 1",
    });
  });

  it("getSelectedOptionValue returns experience level if isAtExperienceLevel", () => {
    const { getSelectedOptionValue } = useAllotmentTable({ allotments, experienceId: "exp1" });
    const allotment = { ...allotments.value[0], isAtExperienceLevel: true };
    expect(getSelectedOptionValue(allotment)).toBe(ALLOTMENT_AT_EXPERIENCE_LEVEL);
  });

  it("getSelectedOptionValue returns option value if not at experience level", () => {
    const { getSelectedOptionValue } = useAllotmentTable({ allotments, experienceId: "exp1" });
    expect(getSelectedOptionValue(allotments.value[0])).toBe("opt1");
  });

  it("handleUpdateOption sets isAtExperienceLevel and clears option", () => {
    const { handleUpdateOption } = useAllotmentTable({ allotments, experienceId: "exp1" });
    const allotment = { ...allotments.value[0] };
    handleUpdateOption(ALLOTMENT_AT_EXPERIENCE_LEVEL, allotment);
    expect(allotment.isAtExperienceLevel).toBe(true);
    expect(allotment.optionId).toBeUndefined();
  });

  it("handleUpdateOption sets option and unsets isAtExperienceLevel", () => {
    const { handleUpdateOption } = useAllotmentTable({ allotments, experienceId: "exp1" });
    const allotment = { ...allotments.value[0], isAtExperienceLevel: true, optionId: undefined };
    handleUpdateOption("opt2", allotment);
    expect(allotment.isAtExperienceLevel).toBe(false);
    expect(allotment.optionId).toBe("opt2");
  });
});
