import { beforeEach, describe, expect, Mock, test, vi } from "vitest";
import RawExperienceView from "../RawExperienceView.vue";
import { config, shallowMount } from "@vue/test-utils";
import RawActionBar from "../RawActionBar.vue";
import { setActivePinia, createPinia } from "pinia";
import { hasPermission } from "@/features/roles/lib/has-permission";
import ExperienceFormWrapper from "@/features/experience-shared/components/ExperienceFormWrapper.vue";
import RawDocumentBar from "@/features/experience-raw/components/RawDocumentBar.vue";

config.global.renderStubDefaultSlot = true;

vi.mock("#app", () => ({
  useNuxtApp: () => ({
    $t: (text: string) => text,
  }),
}));

config.global.mocks = {
  $t: (s: string) => s,
};

vi.stubGlobal("useNuxtApp", () => ({
  $t: (s: string) => s,
}));

vi.stubGlobal(
  "useRoute",
  vi.fn(() => {
    return {
      params: {
        id: "123",
      },
      path: "/experience-raw/123",
      fullPath: "/experience-raw/123",
    };
  })
);

const mockRouter = {
  push: vi.fn(),
};
vi.stubGlobal("useRouter", () => mockRouter);

vi.stubGlobal(
  "useLazyAsyncData",
  vi.fn(() => ({
    execute: vi.fn(),
  }))
);
vi.stubGlobal("onBeforeRouteUpdate", vi.fn());
vi.stubGlobal("onBeforeRouteLeave", vi.fn());

vi.stubGlobal(
  "useBrowserExitMessage",
  vi.fn(() => ({
    hasChanges: false,
  }))
);

vi.stubGlobal(
  "useRuntimeConfig",
  vi.fn(() => {
    return {
      public: {
        DISABLE_LOGIN: false,
      },
    };
  })
);

vi.mock("@/features/experience-raw/queries/experience-raw-query", () => ({
  useExperienceRawQuery: vi.fn(() => ({
    data: {},
  })),
}));

vi.mock("@/stores/experience-raw", () => ({
  useExperienceRaw: vi.fn(() => ({
    rawContents: {
      ["123"]: {
        fields: {
          title: {
            value: "test",
          },
        },
      },
    },
  })),
}));

const saveMock = vi.fn();
let productTypeMock: string;

vi.mock("@/features/experience-raw/stores/useRawExperienceStore", () => ({
  useRawExperienceStore: vi.fn(() => ({
    hasChanges: false,
    isSaving: false,
    save: saveMock,
    productType: productTypeMock,
  })),
}));

vi.mock("@/features/experience-raw/stores/usePaxesStore", () => ({
  usePaxesStore: vi.fn(() => ({ fields: { paxes: { value: [] } } })),
}));

vi.mock("@/features/experience-shared/stores/useDistributionContentStore");
vi.mock("@/features/experience-shared/composables/useCurrentDistributionContentQuery");

vi.mock("@/features/experience-shared/composables/useRawSidebarData", () => ({
  useRawSidebarData: vi.fn(() => ({
    value: {},
  })),
}));

vi.mock("@/features/roles/lib/has-permission", () => ({
  hasPermission: vi.fn(),
}));

const getNextAvailableSectionMock = vi.fn(() => "section1");

vi.mock("@/features/experience-shared/utils/get-next-available-section", () => ({
  getNextAvailableSection: () => getNextAvailableSectionMock(),
}));

const hasPermissionMock = hasPermission as Mock;

vi.mock("@/features/opinoia/shared/useOpinoiaExperience", () => ({
  useOpinoiaExperience: () =>
    computed(() => ({
      value: {
        documents: {
          RAW_COMMERCIAL: {
            type: "RAW_COMMERCIAL",
            state: "IN_CREATION",
          },
          OPERATIONAL: {
            state: "IN_CREATION",
            type: "OPERATIONAL",
          },
        },
        experienceState: "IN_CREATION",
        id: "123",
        referenceCode: "123",
        title: "test",
      },
    })),
}));

describe("RawExperienceView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
  });

  test("the experience form wrapper is mounted, and the nuxt page is rendered inside it", () => {
    const wrapper = shallowMountWrapper();

    const experienceFormWrapper = wrapper.findComponent(ExperienceFormWrapper);

    expect(experienceFormWrapper.isVisible()).toBe(true);
    expect(experienceFormWrapper.find("nuxt-page-stub").exists()).toBe(true);
  });

  test("when mounted it checks the write permission", () => {
    shallowMountWrapper();

    expect(hasPermission).toHaveBeenCalledWith("experience.raw.canWrite");
  });

  test("the raw action bar should render as readonly when the user does not have write permissions", () => {
    hasPermissionMock.mockReturnValueOnce(false);

    const wrapper = shallowMountWrapper();
    const actionBar = wrapper.findComponent(RawActionBar);

    expect(actionBar.attributes("isreadonly")).toBe("true");
  });

  test("the raw action bar should NOT render as readonly when the user has write permissions", () => {
    hasPermissionMock.mockReturnValueOnce(true);

    const wrapper = shallowMountWrapper();
    const actionBar = wrapper.findComponent(RawActionBar);

    expect(actionBar.attributes("isreadonly")).toBe("false");
  });

  test("the nuxt page should render as readonly when the user does not have write permissions", () => {
    hasPermissionMock.mockReturnValueOnce(false);

    const wrapper = shallowMountWrapper();

    const nuxtPage = wrapper.findComponent("nuxt-page-stub");

    expect(nuxtPage.attributes("is-readonly")).toBe("true");
  });

  test("the raw action bar should NOT render as readonly when the user has write permissions", () => {
    hasPermissionMock.mockReturnValueOnce(true);

    const wrapper = shallowMountWrapper();
    const nuxtPage = wrapper.findComponent("nuxt-page-stub");

    expect(nuxtPage.attributes("is-readonly")).toBe("false");
  });

  test("when the form wrapper emits save and navigate, it emits the event to the bus", () => {
    const wrapper = shallowMountWrapper();
    const formWrapper = wrapper.findComponent(ExperienceFormWrapper);
    formWrapper.vm.$emit("click:save-and-navigate");

    expect(saveMock).toHaveBeenCalledWith();
  });

  test("when the form wrapper emits navigate, it changes page", () => {
    const wrapper = shallowMountWrapper();
    const formWrapper = wrapper.findComponent(ExperienceFormWrapper);
    formWrapper.vm.$emit("click:navigate");

    expect(mockRouter.push).toHaveBeenCalledWith("section1");
  });

  test("when the form wrapper emits navigate, but there is no next section, it does not change page", () => {
    getNextAvailableSectionMock.mockReturnValueOnce("");

    const wrapper = shallowMountWrapper();
    const formWrapper = wrapper.findComponent(ExperienceFormWrapper);
    formWrapper.vm.$emit("click:navigate");

    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  test("it evaluates if an experience is NOT opinoia correctly", () => {
    productTypeMock = "NOVA";

    const wrapper = shallowMountWrapper();
    const bar = wrapper.findComponent(RawDocumentBar);

    expect(bar.props().isOpinoia).toBe(false);
  });

  test("it evaluates if an experience is opinoia correctly", () => {
    productTypeMock = "INTERNAL";

    const wrapper = shallowMountWrapper();
    const bar = wrapper.findComponent(RawDocumentBar);

    expect(bar.props().isOpinoia).toBe(true);
  });
  function shallowMountWrapper() {
    return shallowMount(RawExperienceView, {
      global: {
        stubs: {
          NuxtPage: true,
        },
      },
    });
  }
});
