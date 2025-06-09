import { config, mount } from "@vue/test-utils";
import { describe, it, beforeEach, afterEach, vi, expect } from "vitest";
import AllotmentTable from "../AllotmentTable.vue";

const addNewAllotment = vi.fn();
const duplicateAllotment = vi.fn();
const removeAllotment = vi.fn();
const getSelectedOptionValue = vi.fn(() => "opt1");
const handleUpdateOption = vi.fn();

const optionListWithExperience = [{ label: "Option 1", value: "opt1" }];
config.global.mocks = {
  $t: (text: string) => text,
};

vi.stubGlobal("useNuxtApp", () => ({
  $t: (s: string) => s,
}));

vi.mock("../useAllotmentTable", () => ({
  useAllotmentTable: () => ({
    optionListWithExperience,
    addNewAllotment,
    duplicateAllotment,
    removeAllotment,
    getSelectedOptionValue,
    handleUpdateOption,
  }),
}));

vi.mock("@/features/experience-calendar/utils/option-language-utils", () => ({
  mapMasterdataLanguagesToBaseOptions: vi.fn(() => [
    { label: "Italian", value: "it" },
    { label: "English", value: "en" },
  ]),
}));

vi.mock("@/stores/master-data", () => ({
  useMasterData: () => ({ availableLanguages: ["it", "en"] }),
}));

describe("AllotmentTable.vue (full mount)", () => {
  const allotments = [
    {
      dates: [],
      languages: [],
      monday: 0,
      tuesday: 0,
      wednesday: 0,
      thursday: 0,
      friday: 0,
      saturday: 0,
      sunday: 0,
    },
    {
      dates: [],
      languages: [],
      monday: 0,
      tuesday: 0,
      wednesday: 0,
      thursday: 0,
      friday: 0,
      saturday: 0,
      sunday: 0,
    },
  ];
  const experienceId = "exp123";

  let wrapper: ReturnType<typeof mount>;

  beforeEach(() => {
    wrapper = mount(AllotmentTable, {
      props: { allotments, experienceId },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders one row per allotment", () => {
    const rows = wrapper.findAll("tbody tr");
    expect(rows).toHaveLength(allotments.length);
  });

  it('calls addNewAllotment when "new line" button is clicked', async () => {
    await wrapper.find('[data-testid="button-new-line"]').trigger("click");
    expect(addNewAllotment).toHaveBeenCalledTimes(1);
  });

  it("calls duplicateAllotment with correct allotment when duplicate button is clicked", async () => {
    const dupButtons = wrapper.findAll('[data-testid="button-duplicate-allotment"]');
    await dupButtons[1].trigger("click");
    expect(duplicateAllotment).toHaveBeenCalledWith(allotments[1]);
  });

  it("calls removeAllotment with correct allotment when delete button is clicked", async () => {
    const delButtons = wrapper.findAll('[data-testid="button-delete-allotment"]');
    await delButtons[0].trigger("click");
    expect(removeAllotment).toHaveBeenCalledWith(allotments[0]);
  });
});
