import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref, Ref, readonly } from "vue";

// Import the DIRECT dependency to mock
import { useSidebarOptionsSection } from "../sections/options/sidebar/useSidebarOptionsSection"; // Adjust path

// Import types needed for mock data
import { Icon } from "@/ui-kit/NovaIcon/NovaIcon.vue"; // Adjust path as needed
import type { DocumentSidebarSection } from "@/features/opinoia/shared/ExperienceSidebar/types";
import { useSidebarConfigurationSection } from "../sections/configuration/sidebar/useSidebarConfigurationSection";
import { useOperationalSidebarSections } from "./useOperationalSidebarSections";
import { useSidebarPriceSection } from "../sections/price/sidebar/useSidebarPriceSection";

vi.mock("../sections/options/sidebar/useSidebarOptionsSection", () => ({
  useSidebarOptionsSection: vi.fn(),
}));

vi.mock("../sections/configuration/sidebar/useSidebarConfigurationSection", () => ({
  useSidebarConfigurationSection: vi.fn(),
}));

vi.mock("../sections/price/sidebar/useSidebarPriceSection", () => ({
  useSidebarPriceSection: vi.fn(),
}));

describe("useOperationalSidebarSections", () => {
  // --- Test Setup Variables ---
  let experienceId: Readonly<Ref<string>>;
  // Ref to hold the data *inside* the mock useSidebarOptionsSection ref
  let mockOptionsSectionData: Ref<DocumentSidebarSection>;
  // No separate readonly ref needed for the mock return value
  let mockConfigurationSectionData: Ref<DocumentSidebarSection>;
  let mockPriceSectionData: Ref<DocumentSidebarSection>;
  beforeEach(() => {
    vi.clearAllMocks();
    experienceId = readonly(ref("exp-test-789"));

    // --- Setup Mock for useSidebarOptionsSection ---
    // 1. Create the data object that the section ref will contain
    mockOptionsSectionData = ref({
      key: "options",
      url: `opinoia/${experienceId.value}/operational/options`,
      isRequired: true,
      isValid: true, // Initial valid state
      icon: "options" as Icon,
      // Ensure this inner array matches DocumentSidebarSectionField[] (mutable)
      fields: [{ key: "options", isRequired: false, isValid: true, isHidden: false }],
      showFields: false,
    });

    mockConfigurationSectionData = ref({
      key: "configuration",
      url: `opinoia/${experienceId.value}/operational/configuration`,
      isRequired: true,
      isValid: true,
      icon: "options" as Icon,
      // Ensure this inner array matches DocumentSidebarSectionField[] (mutable)
      fields: [{ key: "configuration", isRequired: false, isValid: true, isHidden: false }],
      showFields: false,
    });

    mockPriceSectionData = ref({
      key: "price",
      url: `opinoia/${experienceId.value}/operational/price`,
      isRequired: true,
      isValid: true,
      icon: "ticket",
      fields: [{ key: "price", isRequired: true, isValid: true, isHidden: false }],
      showFields: false,
    });

    // 2. Configure the mock function to return the *mutable* ref
    // This avoids the readonly type conflict for the 'fields' array
    vi.mocked(useSidebarOptionsSection).mockReturnValue(mockOptionsSectionData);
    vi.mocked(useSidebarConfigurationSection).mockReturnValue(mockConfigurationSectionData);
    vi.mocked(useSidebarPriceSection).mockReturnValue(mockPriceSectionData);
    // NO setup related to useOptionsSection (the store) needed here
  });

  // --- Tests ---

  // Add similar test cases when more section composables are added
  it("should call useSidebarOptionsSection with the experienceId", () => {
    useOperationalSidebarSections(experienceId); // Call the composable
    expect(vi.mocked(useSidebarOptionsSection)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(useSidebarOptionsSection)).toHaveBeenCalledWith(experienceId);
  });

  it("should call useSidebarConfigurationSection with the experienceId", () => {
    useOperationalSidebarSections(experienceId); // Call the composable
    expect(vi.mocked(useSidebarConfigurationSection)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(useSidebarConfigurationSection)).toHaveBeenCalledWith(experienceId);
  });

  it("should return a computed array containing the value from the section composable", () => {
    const sections = useOperationalSidebarSections(experienceId);

    expect(Array.isArray(sections.value)).toBe(true);
    expect(sections.value.length).toBe(4);

    // Check that the object in the array matches the *value* inside the mock ref
    expect(sections.value[0]).toEqual(mockConfigurationSectionData.value);
    expect(sections.value[0].key).toBe("configuration");
    expect(sections.value[1]).toEqual(mockOptionsSectionData.value);
    expect(sections.value[1].key).toBe("options");
    expect(sections.value[2]).toEqual(mockPriceSectionData.value);
    expect(sections.value[2].key).toBe("price");
  });

  it("should reactively update when the value inside a section ref changes", () => {
    // Arrange: Call composable first
    const sections = useOperationalSidebarSections(experienceId);
    // Check initial state based on mock data
    expect(sections.value[1].isValid).toBe(true);

    // Act: Change the data *inside* the ref that the mocked dependency returned
    mockOptionsSectionData.value = {
      ...mockOptionsSectionData.value,
      isValid: false,
      fields: [{ ...mockOptionsSectionData.value.fields[0], isValid: false }],
    };

    // Assert: Check if the computed array reflects the updated value
    expect(sections.value.length).toBe(4);
    expect(sections.value[1].isValid).toBe(false);
    expect(sections.value[1].fields[0].isValid).toBe(false);
  });
});
