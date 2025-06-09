import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref, computed, Ref, readonly, ComputedRef, nextTick } from "vue";
import { useOperationalSidebar } from "./useOperationalSidebar";
import { OpinoiaExperience, ExperienceDocuments } from "../../shared/types";
import { useOpinoiaExperience } from "../../shared/useOpinoiaExperience";
import { useOperationalSidebarSections } from "./useOperationalSidebarSections";
import { ExperienceState } from "@/features/experience-shared/utils/get-experience-state";
import { Icon } from "@/ui-kit/NovaIcon/NovaIcon.vue";
import { DocumentSidebarSection } from "../../shared/ExperienceSidebar/types";

// --- Mock Dependencies ---
vi.mock("../../shared/useOpinoiaExperience", () => ({
  useOpinoiaExperience: vi.fn(),
}));
vi.mock("./useOperationalSidebarSections", () => ({
  useOperationalSidebarSections: vi.fn(),
}));

describe("useOperationalSidebar", () => {
  // --- Test Setup Variables ---
  let experienceId: Readonly<Ref<string>>;
  let mockExperienceRef: ComputedRef<OpinoiaExperience>;
  let mockSectionsRef: Readonly<ComputedRef<DocumentSidebarSection[]>>;
  let sourceMockExperienceData: Ref<OpinoiaExperience>;
  let sourceMockSectionsData: Ref<DocumentSidebarSection[]>;

  // --- Mock Data ---
  const mockExperienceState: ExperienceState = "PUBLISHED" as any;
  const initialMockDocuments: ExperienceDocuments = {}; // Provide minimal structure

  beforeEach(() => {
    vi.resetAllMocks();

    experienceId = readonly(ref("exp-main-1"));

    // Setup Mock for useOpinoiaExperience
    sourceMockExperienceData = ref<OpinoiaExperience>({
      id: experienceId.value,
      title: "Mock Experience Title",
      referenceCode: "Mock-Ref-01",
      experienceState: mockExperienceState,
      documents: initialMockDocuments,
    });
    mockExperienceRef = computed(() => sourceMockExperienceData.value);
    vi.mocked(useOpinoiaExperience).mockReturnValue(mockExperienceRef);

    // Setup Mock for useOperationalSidebarSections
    sourceMockSectionsData = ref<DocumentSidebarSection[]>([
      {
        key: "options",
        url: `opinoia/${experienceId.value}/operational/options`,
        isRequired: true,
        isValid: true,
        icon: "options" as Icon,
        fields: [{ key: "options", isRequired: false, isValid: true, isHidden: false }],
        showFields: false,
      },
    ]);
    mockSectionsRef = computed(() => sourceMockSectionsData.value);
    vi.mocked(useOperationalSidebarSections).mockReturnValue(readonly(mockSectionsRef));
  });

  // --- Tests ---

  it("should call useOpinoiaExperience with the experienceId", () => {
    useOperationalSidebar(experienceId);
    expect(useOpinoiaExperience).toHaveBeenCalledTimes(1);
    expect(useOpinoiaExperience).toHaveBeenCalledWith(experienceId);
  });

  it("should call useOperationalSidebarSections with the experienceId", () => {
    useOperationalSidebar(experienceId);
    expect(useOperationalSidebarSections).toHaveBeenCalledTimes(1);
    expect(useOperationalSidebarSections).toHaveBeenCalledWith(experienceId);
  });

  it("should return an object containing the refs from dependencies", () => {
    const result = useOperationalSidebar(experienceId);

    expect(result).toBeDefined();
    expect(result).toHaveProperty("experience");
    expect(result).toHaveProperty("documentSections");

    expect(result.experience).toBe(mockExperienceRef);
    expect(result.documentSections).toBe(readonly(mockSectionsRef));

    expect(result.experience.value.id).toBe("exp-main-1");
    expect(result.documentSections.value[0].key).toBe("options");
  });

  // REMOVED: it("returned object should be readonly", ...);

  it("should allow consumers to react to changes in the underlying experience ref", async () => {
    const result = useOperationalSidebar(experienceId);
    expect(result.experience.value.title).toBe("Mock Experience Title");

    sourceMockExperienceData.value = { ...sourceMockExperienceData.value, title: "New Title" };
    await nextTick();

    expect(result.experience.value.title).toBe("New Title");
  });

  it("should allow consumers to react to changes in the underlying sections ref", async () => {
    const result = useOperationalSidebar(experienceId);
    expect(result.documentSections.value.length).toBe(1);
    expect(result.documentSections.value[0].isValid).toBe(true);

    const updatedSection = { ...sourceMockSectionsData.value[0], isValid: false };
    sourceMockSectionsData.value = [updatedSection];
    await nextTick();

    expect(result.documentSections.value.length).toBe(1);
    expect(result.documentSections.value[0].isValid).toBe(false);
  });
});
