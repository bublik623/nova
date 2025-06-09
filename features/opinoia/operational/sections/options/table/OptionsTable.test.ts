import { describe, it, expect, vi, beforeEach } from "vitest";
import { shallowMount, VueWrapper } from "@vue/test-utils";
import { ref, readonly, nextTick, Ref } from "vue";
import OptionsTable from "./OptionsTable.vue";
import { useOptionsTable } from "./useOptionsTable";
import { Option } from "../types";

// Mock the composable
vi.mock("./useOptionsTable");
// Get a typed handle to the mocked composable function
const mockUseOptionsTable = vi.mocked(useOptionsTable);

// Define return type and mock data structure
type UseOptionsTableReturn = ReturnType<typeof useOptionsTable>;

// Helper to create mock data
const createMockOptionRow = (id: string, title: string, code?: string): Option => ({
  id,
  title,
  code: code ?? `CODE_${id.toUpperCase()}`,
  duration: 60,
  subchannels: ["WEB"],
  paxTypes: ["ADT"],
});

// Mock i18n globally for this suite
const mockT = vi.fn((key) => key);

// --- Test Suite ---
describe("OptionsTable.vue", () => {
  let composableMock: UseOptionsTableReturn;
  let mockOptionsModelRef: Ref<Option[]>;

  // Central Mounting Helper
  const mountWithOptions = (
    optionsData: Option[] = [
      createMockOptionRow("id1", "Option Alpha", "CODEA"),
      createMockOptionRow("id2", "Option Beta", "CODEB"),
    ],
    props = {}
  ) => {
    mockUseOptionsTable.mockClear();
    mockOptionsModelRef = ref([...optionsData]);
    mockUseOptionsTable.mockReturnValue(composableMock);

    const wrapper: VueWrapper<InstanceType<typeof OptionsTable>> = shallowMount(OptionsTable, {
      props: {
        experienceId: "exp123",
        invalidOptionsId: [],
        options: mockOptionsModelRef.value,
        "onUpdate:options": (newOptions: Option[]) => {
          mockOptionsModelRef.value = newOptions;
        },
        ...props,
      },
      global: {
        mocks: { $t: mockT },
        stubs: {
          SimpleTable: { template: "<table><slot /></table>" },
        },
      },
    });
    return { wrapper, modelRef: mockOptionsModelRef };
  };

  // Setup default composable mock return value before each test
  beforeEach(() => {
    composableMock = {
      sortColumn: readonly(ref("title")),
      sortDirection: readonly(ref("asc")),
      canEditOptionsCode: vi.fn(() => true),
      sortBy: vi.fn(),
      addNewOption: vi.fn(async () => {
        if (mockOptionsModelRef) {
          mockOptionsModelRef.value.push(createMockOptionRow(`new-${Date.now()}`, "New", undefined));
          await nextTick();
        }
      }),
      duplicateOption: vi.fn(async (opt: Option) => {
        if (mockOptionsModelRef) {
          const index = mockOptionsModelRef.value.findIndex((o) => o.id === opt.id);
          if (index > -1) {
            mockOptionsModelRef.value.splice(index + 1, 0, { ...opt, id: `dup-${Date.now()}` });
            await nextTick();
          }
        }
      }),
      removeOption: vi.fn(async (opt: Option) => {
        if (mockOptionsModelRef) {
          const index = mockOptionsModelRef.value.findIndex((o) => o.id === opt.id);
          if (index > -1) {
            mockOptionsModelRef.value.splice(index, 1);
            await nextTick();
          }
        }
      }),
    };
  });

  // --- Initialization and Rendering ---
  describe("Initialization and Rendering", () => {
    it("should initialize table logic using the options data", () => {
      mountWithOptions();
      expect(mockUseOptionsTable).toHaveBeenCalledTimes(1);

      const actualArgs = mockUseOptionsTable.mock.calls[0];
      expect(actualArgs).toBeDefined();
      const actualRefArg = actualArgs[0];
      expect(actualRefArg.value).toEqual(mockOptionsModelRef.value);
    });

    it("should display a row for each option provided", () => {
      const initialData = [
        createMockOptionRow("r1", "R1", "C1"),
        createMockOptionRow("r2", "R2", "C2"),
        createMockOptionRow("r3", "R3", "C3"),
      ];
      const { wrapper } = mountWithOptions(initialData);
      const rows = wrapper.findAll("tbody tr");
      expect(rows).toHaveLength(initialData.length);
    });

    it("should display an input for the option title in each row", () => {
      const { wrapper } = mountWithOptions();
      const firstRow = wrapper.findAll("tbody tr").at(0);
      expect(firstRow, "First row should exist").toBeDefined();
      const titleInput = firstRow!.findAllComponents({ name: "NovaInputText" }).at(0);
      expect(titleInput?.exists(), "Title input should exist").toBe(true);
    });

    it("should display an input for the option code in each row", () => {
      const { wrapper } = mountWithOptions();
      const firstRow = wrapper.findAll("tbody tr").at(0);
      expect(firstRow, "First row should exist").toBeDefined();
      const codeInput = firstRow!.findAllComponents({ name: "NovaInputText" }).at(1);
      expect(codeInput?.exists(), "Code input should exist").toBe(true);
    });

    it("should display an input for the option duration in each row", () => {
      const { wrapper } = mountWithOptions();
      const firstRow = wrapper.findAll("tbody tr").at(0);
      expect(firstRow, "First row should exist").toBeDefined();
      const durationInput = firstRow!.findComponent({ name: "NovaInputNumber" });
      expect(durationInput?.exists()).toBe(true);
    });

    it("should NOT display a selector for subchannels in each row", () => {
      const { wrapper } = mountWithOptions();
      const firstRow = wrapper.findAll("tbody tr").at(0);
      expect(firstRow, "First row should exist").toBeDefined();
      const subchannelSelect = firstRow!.findComponent({ name: "ExperienceSubchannelsSelect" });
      // Once the subchannel select will be re-introduced, uncomment also the test
      // "should provide the experience context to the subchannel selector"
      // and the expect lines in "should bind the option data to the corresponding inputs" test
      expect(subchannelSelect?.exists()).toBe(false);
    });

    it("should display a selector for pax types in each row", () => {
      const { wrapper } = mountWithOptions();
      const firstRow = wrapper.findAll("tbody tr").at(0);
      expect(firstRow, "First row should exist").toBeDefined();
      const paxSelect = firstRow!.findComponent({ name: "ExperiencePaxTypesSelect" });
      expect(paxSelect?.exists()).toBe(true);
    });

    it("should display action buttons (duplicate, remove) for each row", () => {
      const { wrapper } = mountWithOptions();
      const firstRow = wrapper.findAll("tbody tr").at(0);
      expect(firstRow, "First row should exist").toBeDefined();
      const actionButtons = firstRow!.findAllComponents({ name: "NovaButtonIcon" });
      expect(actionButtons?.length).toBe(2);
      expect(actionButtons[0].props("name")).toBe("duplicate");
      expect(actionButtons[1].props("name")).toBe("trash");
    });
  }); // End describe 'Initialization and Rendering'

  // --- Data Binding and Context ---
  describe("Data Binding and Context", () => {
    // it("should provide the experience context to the subchannel selector", () => {
    //   const { wrapper } = mountWithOptions();
    //   const firstRow = wrapper.findAll("tbody tr").at(0);
    //   expect(firstRow, "First row should exist").toBeDefined();
    //   const subchannelsSelect = firstRow!.findComponent({ name: "ExperienceSubchannelsSelect" });
    //   expect(subchannelsSelect.props("experienceId")).toBe("exp123");
    // });

    it("should provide the experience context to the pax type selector", () => {
      const { wrapper } = mountWithOptions();
      const firstRow = wrapper.findAll("tbody tr").at(0);
      expect(firstRow, "First row should exist").toBeDefined();
      const paxTypesSelect = firstRow!.findComponent({ name: "ExperiencePaxTypesSelect" });
      expect(paxTypesSelect.props("experienceId")).toBe("exp123");
    });

    it("should make the code input readonly when option cannot be edited", () => {
      const testOption = createMockOptionRow("id-noedit", "Test NoEdit", "CODE_NOEDIT");
      vi.mocked(composableMock.canEditOptionsCode).mockReturnValue(false);
      const { wrapper } = mountWithOptions([testOption]);
      const codeInput = wrapper.findAllComponents({ name: "NovaInputText" }).at(1);
      expect(codeInput, "Code input should exist").toBeDefined();
      expect(codeInput!.props("readonly")).toBe(true);
      expect(composableMock.canEditOptionsCode).toHaveBeenCalledWith(expect.objectContaining({ id: "id-noedit" }));
    });

    it("should make the code input editable when option can be edited", () => {
      const testOption = createMockOptionRow("id-edit", "Test Edit", "CODE_EDIT");
      vi.mocked(composableMock.canEditOptionsCode).mockReturnValue(true);
      const { wrapper } = mountWithOptions([testOption]);
      const codeInput = wrapper.findAllComponents({ name: "NovaInputText" }).at(1);
      expect(codeInput, "Code input should exist").toBeDefined();
      expect(codeInput!.props("readonly")).toBe(false);
      expect(composableMock.canEditOptionsCode).toHaveBeenCalledWith(expect.objectContaining({ id: "id-edit" }));
    });

    it("should assign unique IDs to input fields based on option ID", () => {
      const testData = [createMockOptionRow("option-abc", "Test", "CODE")];
      const { wrapper } = mountWithOptions(testData);
      const firstRow = wrapper.find("tbody tr");
      const titleInput = firstRow.findAllComponents({ name: "NovaInputText" }).at(0);
      expect(titleInput, "Title input should exist").toBeDefined();
      const codeInput = firstRow.findAllComponents({ name: "NovaInputText" }).at(1);
      expect(codeInput, "Code input should exist").toBeDefined();
      const durationInput = firstRow.findComponent({ name: "NovaInputNumber" });

      expect(titleInput!.props("id")).toBe("option-option-abc-title");
      expect(codeInput!.props("id")).toBe("option-option-abc-code");
      expect(durationInput.props("id")).toBe("option-option-abc-duration");
    });

    it("should bind the option data to the corresponding inputs", () => {
      const testOption = createMockOptionRow("optBind", "Binding Test", "CODEBIND");
      testOption.duration = 120;
      testOption.subchannels = ["S1", "S2"];
      testOption.paxTypes = ["P1"];
      const { wrapper } = mountWithOptions([testOption]);
      const firstRow = wrapper.find("tbody tr");

      const titleInput = firstRow.findAllComponents({ name: "NovaInputText" }).at(0);
      expect(titleInput, "Title input should exist").toBeDefined();
      const codeInput = firstRow.findAllComponents({ name: "NovaInputText" }).at(1);
      expect(codeInput, "Code input should exist").toBeDefined();
      const durationInput = firstRow.findComponent({ name: "NovaInputNumber" });
      // const subchannelsSelect = firstRow.findComponent({ name: "ExperienceSubchannelsSelect" });
      const paxTypesSelect = firstRow.findComponent({ name: "ExperiencePaxTypesSelect" });

      expect(titleInput!.props("modelValue")).toBe(testOption.title);
      expect(codeInput!.props("modelValue")).toBe(testOption.code);
      expect(durationInput.props("modelValue")).toBe(testOption.duration);
      // expect(subchannelsSelect.props("selected")).toEqual(testOption.subchannels);
      expect(paxTypesSelect.props("selected")).toEqual(testOption.paxTypes);
    });
  }); // End describe 'Data Binding and Context'

  // --- Styling ---
  describe("Styling", () => {
    it("should highlight rows corresponding to invalid options", () => {
      const testData = [
        createMockOptionRow("id1", "Valid", "CODEA"),
        createMockOptionRow("id2", "Invalid", "CODEB"),
        createMockOptionRow("id3", "Valid Too", "CODEC"),
      ];
      const invalidId = "id2";
      const { wrapper } = mountWithOptions(testData, { invalidOptionsId: [invalidId] });
      const rows = wrapper.findAll("tbody tr");
      const firstRow = rows.at(0);
      const secondRow = rows.at(1);
      const thirdRow = rows.at(2);
      expect(firstRow, "First row should exist").toBeDefined();
      expect(secondRow, "Second row should exist").toBeDefined();
      expect(thirdRow, "Third row should exist").toBeDefined();

      expect(firstRow!.classes()).not.toContain("error");
      expect(secondRow!.classes()).toContain("error");
      expect(thirdRow!.classes()).not.toContain("error");
    });
  }); // End describe 'Styling'

  // --- User Actions ---
  describe("User Actions", () => {
    it('should allow adding a new option row via the "New Line" button', async () => {
      const { wrapper } = mountWithOptions();
      const addButton = wrapper.findComponent({ name: "NovaButton" });
      expect(addButton?.exists()).toBe(true);
      await addButton.trigger("click");
      expect(composableMock.addNewOption).toHaveBeenCalledTimes(1);
    });

    it("should allow duplicating an option row via the duplicate button", async () => {
      const initialData = [createMockOptionRow("id1", "Alpha", "A")];
      const { wrapper } = mountWithOptions(initialData);
      const firstRow = wrapper.find("tbody tr");
      const duplicateButton = firstRow
        .findAllComponents({ name: "NovaButtonIcon" })
        .find((btn) => btn.props("name") === "duplicate");
      expect(duplicateButton, "Duplicate button should exist").toBeDefined();
      await duplicateButton!.trigger("click");
      expect(composableMock.duplicateOption).toHaveBeenCalledTimes(1);
      expect(composableMock.duplicateOption).toHaveBeenCalledWith(expect.objectContaining(initialData[0]));
    });

    it("should allow removing an option row via the trash button", async () => {
      const initialData = [createMockOptionRow("id1", "Alpha", "A"), createMockOptionRow("id2", "Beta", "B")];
      const optionToRemove = initialData[1];
      const { wrapper } = mountWithOptions(initialData);
      const secondRow = wrapper.findAll("tbody tr").at(1);
      expect(secondRow, "Second row should exist").toBeDefined();
      const removeButton = secondRow!
        .findAllComponents({ name: "NovaButtonIcon" })
        .find((btn) => btn.props("name") === "trash");
      expect(removeButton, "Remove button should exist").toBeDefined();
      expect(optionToRemove?.id).toBe("id2"); // Sanity check

      await removeButton!.trigger("click");
      expect(composableMock.removeOption).toHaveBeenCalledTimes(1);
      expect(composableMock.removeOption).toHaveBeenCalledWith(expect.objectContaining(optionToRemove));
    });
  }); // End describe 'User Actions'

  // --- Sorting Actions ---
  describe("Sorting Actions", () => {
    it("should allow sorting options by title via the title column header", async () => {
      const { wrapper } = mountWithOptions();
      const sortButtons = wrapper.findAllComponents({ name: "NovaSortButton" });
      const titleSortButton = sortButtons.at(0);
      expect(titleSortButton, "Title sort button should exist").toBeDefined();

      await titleSortButton!.trigger("click");
      expect(composableMock.sortBy).toHaveBeenCalledWith("title");
      await titleSortButton!.trigger("click");
      expect(composableMock.sortBy).toHaveBeenCalledWith("title");
      expect(composableMock.sortBy).toHaveBeenCalledTimes(2);
    });

    it("should allow sorting options by code via the code column header", async () => {
      const { wrapper } = mountWithOptions();
      const sortButtons = wrapper.findAllComponents({ name: "NovaSortButton" });
      const codeSortButton = sortButtons.at(1);
      expect(codeSortButton, "Code sort button should exist").toBeDefined();

      await codeSortButton!.trigger("click");
      expect(composableMock.sortBy).toHaveBeenCalledWith("code");
      expect(composableMock.sortBy).toHaveBeenCalledTimes(1);
    });
  }); // End describe 'Sorting Actions'
}); // End describe 'OptionsTable.vue'
