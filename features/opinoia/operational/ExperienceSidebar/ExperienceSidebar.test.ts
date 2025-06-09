import { describe, expect, Mock, test, vi, beforeEach } from "vitest";
import { ref, Ref, readonly } from "vue";
import { shallowMount } from "@vue/test-utils";

import OperationalSidebarWrapper from "./ExperienceSidebar.vue"; // Component wrapper

import { OpinoiaExperience } from "../../shared/types";
import { DocumentSidebarSection } from "../../shared/ExperienceSidebar/types";

// Mock the composable
const useOperationalSidebarMock: Mock = vi.hoisted(() => vi.fn());

vi.mock("./useOperationalSidebar", () => ({
  useOperationalSidebar: useOperationalSidebarMock,
}));

// Keep other necessary mocks
vi.mock("#app", () => ({
  useNuxtApp: () => ({
    $t: (text: string) => text,
  }),
}));

// --- Test Suite ---

type ExperienceSidebarProps = {
  experienceId: string;
};

const experienceId = "exp-id-123";

describe("Operational ExperienceSidebar Wrapper", () => {
  let mockExperienceRef: Ref<OpinoiaExperience>;
  let mockDocumentSectionsRef: Ref<DocumentSidebarSection[]>;

  const getProps = (): ExperienceSidebarProps => ({ experienceId });

  beforeEach(() => {
    vi.clearAllMocks(); // Use clear or reset

    // Create mock data and refs
    mockExperienceRef = ref<OpinoiaExperience>({
      id: experienceId,
      referenceCode: "EXP-MOCK-01",
      title: "Mock Opinoia Experience",
      experienceState: "DRAFT" as any,
      documents: {},
    });

    mockDocumentSectionsRef = ref<DocumentSidebarSection[]>([
      {
        key: "options",
        url: `opinoia/${experienceId}/operational/options`,
        isRequired: true,
        isValid: true,
        icon: "options" as any,
        fields: [{ key: "options", isRequired: false, isValid: true, isHidden: false }],
        showFields: false,
      },
      {
        key: "details",
        url: `opinoia/${experienceId}/operational/details`,
        isRequired: true,
        isValid: false,
        icon: "settings" as any,
        fields: [{ key: "title", isRequired: true, isValid: false, isHidden: false }],
        showFields: false,
      },
    ]);

    // Configure mock return value (using readonly refs to match signature)
    useOperationalSidebarMock.mockReturnValue(
      readonly({
        experience: readonly(mockExperienceRef),
        documentSections: readonly(mockDocumentSectionsRef),
      })
    );
  });

  test("it calls useOperationalSidebar and passes unwrapped data to child component props", () => {
    // Arrange & Act
    const wrapper = shallowMount(OperationalSidebarWrapper, { props: getProps() });
    // Get the inner child component (assuming its name is 'ExperienceSidebar')
    const childSidebar = wrapper.getComponent({ name: "ExperienceSidebar" });

    // Assert: Check composable call
    expect(useOperationalSidebarMock).toHaveBeenCalledTimes(1);
    expect(useOperationalSidebarMock).toHaveBeenCalledWith(
      expect.objectContaining({
        value: experienceId,
      })
    );

    // Assert: Check props passed to the child component
    const childProps = childSidebar.props();
    // --- Use toEqual and .value to check unwrapped data ---
    expect(childProps.experience).toEqual(mockExperienceRef.value);
    expect(childProps.activeDocumentSections).toEqual(mockDocumentSectionsRef.value);
    // --- Check other static props ---
    expect(childProps.activeDocumentType).toBe("OPERATIONAL");
  });
});
