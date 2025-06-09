import { describe, expect, it, vi } from "vitest";
import RawDocumentBar from "../RawDocumentBar.vue";
import { config, shallowMount } from "@vue/test-utils";
import { ExperienceStatusCode } from "@/types/DocumentStatuses";
import DocumentSidebar, { FilteredCategories } from "@/components/Document/DocumentSidebar/DocumentSidebar.vue";
import ExperienceStatusBadge from "@/features/experience-shared/components/ExperienceStatusBadge.vue";
import { ExperienceDocuments } from "@/features/opinoia/shared/types";
import DocumentNavigationSelect from "@/features/opinoia/shared/ExperienceSidebar/DocumentNavigationSelect/DocumentNavigationSelect.vue";
import DocumentStateBadge from "@/features/opinoia/shared/ExperienceSidebar/DocumentStateBadge/DocumentStateBadge.vue";

vi.mock("#app", () => ({
  useNuxtApp: () => ({
    $t: (text: string) => text,
  }),
}));

// Mock translations globally
vi.stubGlobal("useNuxtApp", () => ({
  $t: (s: string) => s,
}));

config.global.mocks = {
  $t: (s: string) => s,
};

// Define global stubs for child components
config.global.stubs = {
  DocumentSidebar: {
    template: "<div><slot name='open' /></div>",
  },
};

describe("DocumentSidebarComponent", () => {
  const defaultProps = {
    referenceCode: "REF12345",
    sidebarCategories: "test" as any as FilteredCategories,
    statusCode: "IN_CREATION" as ExperienceStatusCode, // Example ExperienceStatusCode
    id: "123",
    isOpinoia: false,
    experienceDocuments: {
      RAW_COMMERCIAL: {
        type: "RAW_COMMERCIAL",
        state: "IN_CREATION",
      },
      OPERATIONAL: {
        type: "OPERATIONAL",
        state: "IN_CREATION",
      },
    } as ExperienceDocuments,
  };

  it("renders the reference code with correct format", () => {
    const wrapper = shallowMount(RawDocumentBar, {
      props: defaultProps,
    });
    const refCodeElement = wrapper.find('[data-testid="document-sidebar-refcode"]');
    expect(refCodeElement.exists()).toBe(true);
    expect(refCodeElement.text()).toContain(`experience.common.ref_code REF12345`);
  });

  it("passes the correct props to ExperienceStatusBadge", () => {
    const wrapper = shallowMount(RawDocumentBar, {
      props: defaultProps,
    });
    const badgeComponent = wrapper.findComponent(ExperienceStatusBadge);

    expect(badgeComponent.exists()).toBe(true);
    expect(badgeComponent.props("flowCode")).toBe("BASE");
    expect(badgeComponent.props("statusCode")).toBe(defaultProps.statusCode);
  });

  it("passes the correct props to DocumentSidebar", () => {
    const wrapper = shallowMount(RawDocumentBar, {
      props: defaultProps,
    });
    const sidebarComponent = wrapper.findComponent(DocumentSidebar);

    // sidebarComponent.props() does not work here, so I'm testing strings.
    expect(sidebarComponent.exists()).toBe(true);
    expect(sidebarComponent.html()).toContain("show-input-text");
    expect(sidebarComponent.html()).toContain('sidebar-categories="test');
  });

  it("does not show the select if it is not an opinoia experience", () => {
    const wrapper = shallowMount(RawDocumentBar, {
      props: defaultProps,
    });

    const selectComponent = wrapper.findComponent(DocumentNavigationSelect);

    expect(selectComponent.exists()).toBe(false);
  });

  it("shows the select if it is an opinoia experience", () => {
    const wrapper = shallowMount(RawDocumentBar, {
      props: {
        ...defaultProps,
        isOpinoia: true,
      },
    });

    const selectComponent = wrapper.findComponent(DocumentNavigationSelect);

    expect(selectComponent.exists()).toBe(true);
  });

  it("shows the single experience badge if is not an opinoia experience", () => {
    const wrapper = shallowMount(RawDocumentBar, {
      props: {
        ...defaultProps,
        isOpinoia: false,
      },
    });

    const singleExperienceBadge = wrapper.findComponent(ExperienceStatusBadge);
    const documentExperienceBadge = wrapper.findAllComponents(DocumentStateBadge);
    expect(singleExperienceBadge.exists()).toBe(true);
    expect(documentExperienceBadge.length).toBe(0);
  });

  it("shows the document experience badge if is an opinoia experience", () => {
    const wrapper = shallowMount(RawDocumentBar, {
      props: {
        ...defaultProps,
        isOpinoia: true,
      },
    });

    const singleExperienceBadge = wrapper.findComponent(ExperienceStatusBadge);
    const documentExperienceBadge = wrapper.findAllComponents(DocumentStateBadge);
    expect(singleExperienceBadge.exists()).toBe(false);
    expect(documentExperienceBadge.length).toBe(2);
  });
});
