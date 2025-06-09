// File: OpinoiaOperationalDocument.spec.ts

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { shallowMount, VueWrapper } from "@vue/test-utils"; // Using shallowMount
import { ref, computed } from "vue";
import OpinoiaOperationalDocument from "./OpinoiaOperationalDocument.vue"; // Adjust path
import { type DocumentTab } from "@/stores/document-tabs"; // Adjust path & import types
import DocumentTabs from "@/features/opinoia/shared/document-tabs/DocumentTabs.vue";

// --- Mocks ---

// Mock Nuxt context/composables used implicitly or explicitly
vi.mock("#app", () => ({
  useNuxtApp: vi.fn(() => ({
    $t: (text: string) => text, // Mock $t or other NuxtApp properties needed
  })),
}));

const mockRouterPush = vi.fn();
vi.stubGlobal(
  "useRouter",
  vi.fn(() => ({
    // Mock auto-imported useRouter
    push: mockRouterPush,
  }))
);

const mockIsLoading = ref(false); // Mock for useOpinoiaOperationalDocument state
const mockIsSaving = ref(false); // Mock for useOpinoiaOperationalDocument state
vi.mock("./useOpinoiaOperationalDocument", () => ({
  useOpinoiaOperationalDocument: vi.fn(() => ({
    isLoading: computed(() => mockIsLoading.value),
    isSaving: computed(() => mockIsSaving.value),
  })),
}));

// Mocking useDocumentTabs Store
const mockTabs = ref<DocumentTab[]>([]); // Ref to control tabs state in tests
const mockGetActiveTab = vi.fn();
const mockCloseTabAndGetNextRoutePath = vi.fn();

vi.mock("@/stores/document-tabs", () => ({
  useDocumentTabs: vi.fn(() => ({
    // Use a getter for 'tabs' to return the array value, avoiding prop type warnings with stubs
    get tabs() {
      return mockTabs.value;
    },
    getActiveTab: mockGetActiveTab,
    closeTabAndGetNextRoutePath: mockCloseTabAndGetNextRoutePath,
  })),
}));

// --- Helper to reset mocks before each test ---
const resetMocks = () => {
  mockRouterPush.mockClear();
  mockIsLoading.value = false;
  mockIsSaving.value = false;
  // Set default state using correct DocumentTab type
  mockTabs.value = [
    { documentId: { experienceId: "default_exp1" }, path: "/dt1", label: "Default Tab 1" },
    { documentId: { experienceId: "default_exp2", revisionId: "revABC" }, path: "/dt2", label: "Default Tab 2" },
  ];
  mockGetActiveTab.mockClear();
  mockGetActiveTab.mockReturnValue(mockTabs.value[0]); // Default active tab
  mockCloseTabAndGetNextRoutePath.mockClear();
  mockCloseTabAndGetNextRoutePath.mockReturnValue("/"); // Default next route path
};

// Default props for mounting
const defaultProps = {
  experienceId: "test-exp-123",
};

// --- Test Suite ---
describe("OpinoiaOperationalDocument.vue", () => {
  let wrapper: VueWrapper<any>;

  // Helper function to mount the component
  const mountComponent = (props = defaultProps) => {
    wrapper = shallowMount(OpinoiaOperationalDocument, {
      props,
      global: {
        // Explicitly stub Nuxt/problematic components even with shallowMount
        stubs: {
          NuxtPage: { template: '<div data-testid="nuxt-page-stub"></div>' },
          SkeletonDocument: { template: '<div data-testid="skeleton-document-stub"></div>' },
          // Other children are automatically stubbed by shallowMount
        },
      },
    });
  };

  beforeEach(() => {
    resetMocks();
  });

  afterEach(() => {
    // Destroy the wrapper after each test
    if (wrapper) {
      wrapper.unmount();
    }
  });

  // --- Test Cases ---

  it("Scenario: Rendering in Loading State", () => {
    // Given
    mockIsLoading.value = true;
    mockIsSaving.value = false;
    // When
    mountComponent();

    // Then
    expect(wrapper.find('[data-testid="skeleton-document-stub"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="nuxt-page-stub"]').exists()).toBe(false);
    expect(wrapper.findComponent({ name: "ExperienceSidebar" }).exists()).toBe(false); // Checks shallow stub
    expect(wrapper.findComponent({ name: "ActionsSidebar" }).exists()).toBe(false); // Checks shallow stub
  });

  it("Scenario: Rendering in Loaded State", () => {
    // Given isLoading is false (from resetMocks)
    // When
    mountComponent({ experienceId: "loaded-exp-456" });
    // Then
    expect(wrapper.find('[data-testid="skeleton-document-stub"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="nuxt-page-stub"]').exists()).toBe(true);
    expect(wrapper.findComponent({ name: "ExperienceSidebar" }).exists()).toBe(true); // Checks shallow stub
    expect(wrapper.findComponent({ name: "ActionsSidebar" }).exists()).toBe(true); // Checks shallow stub
  });

  it("Scenario: Data Test ID", () => {
    // Given
    const testId = "exp-for-testid";
    // When
    mountComponent({ experienceId: testId });
    // Then
    expect(wrapper.attributes("data-testid")).toBe(`opinoia-experience-operational-${testId}`);
  });

  it("Scenario: DocumentTabs Component", () => {
    mountComponent();
    const documentTabs = wrapper.findComponent(DocumentTabs);
    expect(documentTabs.exists()).toBe(true);
  });
});
