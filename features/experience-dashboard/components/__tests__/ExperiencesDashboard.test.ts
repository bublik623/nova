import { config, mount, RouterLinkStub } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ExperiencesDashboard from "../ExperiencesDashboard.vue";
import { createPinia, setActivePinia } from "pinia";
import NovaButtonToggle from "@/ui-kit/NovaButtonToggle/NovaButtonToggle.vue";
import { useExperienceDashboardView } from "@/features/experience-dashboard/composables/useExperienceDashboardView";
import { DocumentContentType } from "@/types/DocumentStatuses";

const mockRouter = {
  push: vi.fn(),
  resolve: vi.fn(),
};

const mockRoute = {
  path: "/experience/12345/raw/settings",
  fullPath: "/experience/12345/raw/settings",
  name: "/experience/12345/raw/settings",
};

config.global.mocks = {
  $route: mockRoute,
  $router: mockRouter,
  $t: (text: string) => text,
};
config.global.stubs = {
  NuxtLink: RouterLinkStub,
};
const queryParamRef = ref("title-asc");

vi.mock("@vueuse/router", () => {
  return {
    useRouteQuery: () => queryParamRef,
  };
});

const hasPermissionMock = ref(true);
vi.mock("@/features/roles/lib/has-permission", () => ({
  hasPermission: () => hasPermissionMock.value,
}));

const refresh = vi.fn();
const useLazyAsyncDataMock = vi.fn(() => ({ data: [], refresh }));

vi.stubGlobal("useLazyAsyncData", useLazyAsyncDataMock);
vi.stubGlobal("useRoute", () => mockRoute);
vi.stubGlobal("useRouter", () => mockRouter);
vi.stubGlobal("useNuxtApp", () => ({
  $t: (text: string) => text,
}));
vi.mock("#app", () => ({
  useNuxtApp: vi.fn(() => ({
    $t: vi.fn((key: string) => key),
  })),
}));

vi.mock("@/features/experience-dashboard/composables/useExperienceDashboardView");

const defaultExpDashboardViewMocks = {
  canUserToggleView: computed(() => true),
  getInitialContentForView: computed(() => DocumentContentType.RAW),
  shouldHaveEditorialContent: computed(() => true),
  shouldHaveRawContent: computed(() => true),
};
const mockUseExperienceDashboardView = vi.mocked(useExperienceDashboardView).mockImplementation(() => ({
  ...defaultExpDashboardViewMocks,
}));

beforeEach(() => {
  setActivePinia(createPinia());
});

describe("ExperiencesDashboard", () => {
  it("renders the Dashboard component correctly", () => {
    const wrapper = mount(ExperiencesDashboard);
    expect(wrapper.exists()).toBe(true);
  });

  it("renders the CreateExperienceButton when the user has permission", () => {
    hasPermissionMock.value = true;
    const wrapper = mount(ExperiencesDashboard);
    expect(wrapper.findComponent({ name: "CreateExperienceButton" }).exists()).toBe(true);
  });

  it("hides the CreateExperienceButton when the user lacks permission", () => {
    hasPermissionMock.value = false;
    const wrapper = mount(ExperiencesDashboard);
    expect(wrapper.findComponent({ name: "CreateExperienceButton" }).exists()).toBe(false);
  });

  it("shows the toggle button if the user has the correct read permissions", () => {
    mockUseExperienceDashboardView.mockImplementationOnce(() => ({
      ...defaultExpDashboardViewMocks,
      canUserToggleView: computed(() => true),
    }));
    const wrapper = mount(ExperiencesDashboard);
    expect(wrapper.findComponent(NovaButtonToggle).exists()).toBe(true);
  });

  it("hides the toggle button if the user does not have the correct read permissions", () => {
    mockUseExperienceDashboardView.mockImplementationOnce(() => ({
      ...defaultExpDashboardViewMocks,
      canUserToggleView: computed(() => false),
    }));

    const wrapper = mount(ExperiencesDashboard);
    expect(wrapper.findComponent(NovaButtonToggle).exists()).toBe(false);
  });

  it("toggles contentQuery between RAW and EDITORIAL", async () => {
    mockUseExperienceDashboardView.mockReturnValueOnce({
      ...defaultExpDashboardViewMocks,
      getInitialContentForView: computed(() => DocumentContentType.RAW),
    });
    const wrapper = mount(ExperiencesDashboard);

    const toggle = wrapper.findComponent(NovaButtonToggle);

    // Simulate toggle
    await toggle.trigger("click");
    expect(queryParamRef.value).toBe("raw");

    await toggle.trigger("click");
    expect(queryParamRef.value).toBe("editorial");
  });

  it("updates the searchQuery correctly when input is provided", async () => {
    const wrapper = mount(ExperiencesDashboard);

    const searchInput = wrapper.find("#dashboard-search-bar");
    await searchInput.setValue("test query");

    expect(queryParamRef.value).toBe("test query");
  });

  it("renders the TableRaw component when contentQuery is RAW", () => {
    queryParamRef.value = "raw";
    const wrapper = mount(ExperiencesDashboard);

    expect(wrapper.findComponent({ name: "TableRaw" }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: "TableEditorial" }).exists()).toBe(false);
  });

  it("renders the TableEditorial component when contentQuery is EDITORIAL", () => {
    queryParamRef.value = "editorial";
    const wrapper = mount(ExperiencesDashboard);

    expect(wrapper.findComponent({ name: "TableEditorial" }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: "TableRaw" }).exists()).toBe(false);
  });

  it("updates sortQuery when sort is changed", async () => {
    queryParamRef.value = "raw";
    const wrapper = mount(ExperiencesDashboard);

    const tableRaw = wrapper.findComponent({ name: "TableRaw" });
    await tableRaw.vm.$emit("update:activeSortKey", "id");
    await nextTick();

    expect(queryParamRef.value).toBe("id-asc");
  });
});
