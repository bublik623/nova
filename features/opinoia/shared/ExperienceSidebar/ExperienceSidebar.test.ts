import { beforeEach, describe, expect, test, vi } from "vitest";
import { mount, config, RouterLinkStub, VueWrapper } from "@vue/test-utils";
import ExperienceSidebar from "./ExperienceSidebar.vue";
import { OpinoiaExperience } from "@/features/opinoia/shared/types";
import { DocumentSidebarSection } from "@/features/opinoia/shared/ExperienceSidebar/types";
import { FilteredCategories } from "@/components/Document/DocumentSidebar/DocumentSidebar.vue";
import { Icon } from "@/ui-kit/NovaIcon/NovaIcon.vue";
import { ExperienceState } from "@/features/experience-shared/utils/get-experience-state";

// --- Mocks and Stubs Setup ---
vi.mock("#app", () => ({
  useNuxtApp: () => ({
    $t: (text: string) => text,
  }),
}));

config.global.mocks = {
  $t: (text: string) => text,
  $route: { path: "current-path" },
};

config.global.stubs = {
  NuxtLink: RouterLinkStub,
};

const routerMock = { push: vi.fn() };
vi.stubGlobal("useRouter", () => routerMock);

const routeMock = {};
vi.stubGlobal("useRoute", () => routeMock);

// --- Test Data ---
const experienceId = "exp-id-shared";
const experienceTitle = "Shared Exp Title";
const experienceReferenceCode = "EXP-SHARED-01";
const mockExperienceState: ExperienceState = "PUBLISHED" as any;

// --- Helper Functions ---
function getProps(): any {
  const mockExperience: OpinoiaExperience = {
    id: experienceId,
    referenceCode: experienceReferenceCode,
    title: experienceTitle,
    experienceState: mockExperienceState,
    documents: {
      RAW_COMMERCIAL: { type: "RAW_COMMERCIAL", state: "IN_CREATION" },
      OPERATIONAL: { type: "OPERATIONAL", state: "IN_CREATION" },
    },
  };
  const inputSections: DocumentSidebarSection[] = [
    {
      key: "options",
      url: "/exp-id-shared/options",
      isRequired: true,
      isValid: true,
      icon: "options" as Icon,
      fields: [
        { key: "city", isRequired: true, isValid: true, isHidden: false },
        { key: "country", isRequired: false, isValid: true, isHidden: false },
      ],
      showFields: true,
    },
    {
      key: "settings",
      url: "/exp-id-shared/settings",
      isRequired: true,
      isValid: false,
      icon: "settings" as Icon,
      fields: [
        { key: "title", isRequired: true, isValid: false, isHidden: false },
        { key: "supplier", isRequired: true, isValid: true, isHidden: false },
      ],
      showFields: false,
    },
  ];
  return {
    experience: mockExperience,
    activeDocumentType: "OPERATIONAL",
    activeDocumentSections: inputSections,
  };
}

function getExpectedMappedCategories(inputSections: DocumentSidebarSection[]): FilteredCategories {
  const categories: FilteredCategories = {};
  const mockTranslate = (fieldKey: string) => `experience.${fieldKey}.title`;

  inputSections.forEach((section) => {
    categories[section.key] = {
      id: section.key,
      url: section.url,
      icon: section.icon,
      required: section.isRequired,
      completed: section.isValid,
      disabled: false,
      dropdown: section.key !== "settings",
      disabledBy: "",
      fields: section.fields.map((field) => ({
        id: field.key,
        required: field.isRequired,
        hide: field.isHidden,
        filled: field.isValid,
        title: mockTranslate(field.key),
      })),
    };
  });
  return categories;
}

// --- Test Suite ---
describe("Shared ExperienceSidebar Component", () => {
  let wrapper: VueWrapper<any>;
  let props = getProps();

  beforeEach(() => {
    props = getProps();
    wrapper = mount(ExperienceSidebar, {
      props,
      global: {
        // Pass mocks/stubs if component relies on them during mount/render
        mocks: config.global.mocks,
        stubs: config.global.stubs,
      },
    });
  });

  describe("Header Section (Experience Info)", () => {
    test("it displays the experience title", () => {
      const title = wrapper.get("[data-testid='experience-title']");
      expect(title.text()).equal(props.experience.title);
    });

    test("it displays the experience reference code", () => {
      const refCode = wrapper.get("[data-testid='experience-reference-code']");
      expect(refCode.text()).equal(props.experience.referenceCode);
    });

    test("it displays a state badge for each experience document", () => {
      const stateBadges = wrapper.findAllComponents({ name: "DocumentStateBadge" });
      expect(stateBadges.length).toBe(Object.keys(props.experience.documents).length);
      expect(stateBadges[0].props().documentType).toBe("RAW_COMMERCIAL");
      expect(stateBadges[1].props().documentType).toBe("OPERATIONAL");
    });

    test("it passes correct props to DocumentNavigationSelect", () => {
      const navigationSelect = wrapper.getComponent({ name: "DocumentNavigationSelect" });
      expect(navigationSelect.props()).toEqual(
        expect.objectContaining({
          experienceId: props.experience.id,
          activeDocumentType: props.activeDocumentType,
          experienceDocuments: props.experience.documents,
        })
      );
    });
  });

  describe("Sidebar Sections (Mapping Test)", () => {
    test("it maps input sections and passes correct structure to DocumentSidebar", () => {
      const expectedMapped = getExpectedMappedCategories(props.activeDocumentSections);
      const documentSidebar = wrapper.getComponent({ name: "DocumentSidebar" });

      expect(documentSidebar.props().sidebarCategories).toEqual(expectedMapped);
      expect(documentSidebar.props().showInputText).toBe(true);
    });

    test("it renders the correct number of sections based on mapped data", () => {
      const expectedMapped = getExpectedMappedCategories(props.activeDocumentSections);
      const documentSidebar = wrapper.getComponent({ name: "DocumentSidebar" });
      // Assumes DocumentSidebar renders SidebarSection components
      const sectionsRendered = documentSidebar.findAllComponents({ name: "SidebarSection" });
      expect(sectionsRendered.length).toBe(Object.keys(expectedMapped).length);
    });
  });
});
