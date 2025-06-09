import { config, mount, shallowMount } from "@vue/test-utils";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { ref, computed, type Ref } from "vue";
import { createTestingPinia } from "@pinia/testing";
import { setActivePinia } from "pinia";
import ActionsSidebar from "./ActionsSidebar.vue";
import { useActionsSidebar } from "./useActionsSidebar";

vi.mock("@/composables/useMediaQuery", () => ({
  useMediaQuery: () => ({ isBigDesktop: false }),
}));

const useActionsSidebarMock = vi.hoisted(() =>
  vi.fn<(experienceId: Readonly<Ref<string>>) => ReturnType<typeof useActionsSidebar>>()
);
vi.mock("@/features/opinoia/operational/actions-sidebar/useActionsSidebar", () => ({
  useActionsSidebar: useActionsSidebarMock,
}));

const useOpinoiaOperationalDocumentMock = vi.hoisted(() =>
  vi.fn<
    (experienceId: Readonly<Ref<string>>) => {
      saveDraft: () => void;
      canSaveDraft: Ref<boolean>;
      canPublish: Ref<boolean>;
      publish: () => void;
      isSaving: Ref<boolean>;
    }
  >()
);
vi.mock("@/features/opinoia/operational/document/useOpinoiaOperationalDocument", () => ({
  useOpinoiaOperationalDocument: useOpinoiaOperationalDocumentMock,
}));

vi.stubGlobal("useNuxtApp", () => ({
  $t: (s: string) => s,
}));
config.global.mocks = {
  $t: (text: string) => text,
};

const saveDraftMock = vi.fn();
const publishMock = vi.fn();

function getActionsSidebar(
  override: Partial<ReturnType<typeof useActionsSidebar>> = {}
): ReturnType<typeof useActionsSidebar> {
  return {
    experienceState: computed(() => "draft"),
    lastEditDate: computed(() => "2025-03-30T16:01:47Z"),
    completionPercentage: computed(() => 10),
    isBusy: computed(() => false),
    ...override,
  } as ReturnType<typeof useActionsSidebar>;
}

function getOpinoiaDoc() {
  return {
    saveDraft: saveDraftMock,
    canSaveDraft: computed(() => true),
    canPublish: computed(() => true),
    publish: publishMock,
    isSaving: computed(() => false),
  };
}

describe("ActionSidebar", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    const pinia = createTestingPinia();
    setActivePinia(pinia);

    vi.resetAllMocks();

    useActionsSidebarMock.mockReturnValue(getActionsSidebar());
    useOpinoiaOperationalDocumentMock.mockReturnValue(getOpinoiaDoc());
  });

  test("it's an action sidebar", () => {
    const wrapper = shallowMount(ActionsSidebar, { props: { experienceId: "exp-id" } });

    const genericActionSidebarComponent = wrapper.findComponent({ name: "ActionBar" });

    expect(genericActionSidebarComponent).toBeDefined();
  });

  test("it initialize the useActionsSidebar composable with the given experienceId", () => {
    const experienceId = "exp-id";

    shallowMount(ActionsSidebar, { props: { experienceId } });

    expect(useActionsSidebarMock).toHaveBeenCalledWith(expect.objectContaining({ value: experienceId }));
  });

  describe("actions panel", () => {
    describe("experience state section", () => {
      test("it displays the experience state section", () => {
        const wrapper = mount(ActionsSidebar, { props: { experienceId: "exp-id" } });

        const experienceStateSection = wrapper.getComponent({ name: "ExperienceStateSection" });

        expect(experienceStateSection.props()).toEqual(
          expect.objectContaining({
            state: "draft",
          })
        );
      });
    });

    describe("content storage sepction", () => {
      test("it displays the content storage section", () => {
        const wrapper = mount(ActionsSidebar, { props: { experienceId: "exp-id" } });

        const contentStorageSection = wrapper.getComponent({ name: "ContentStorageSection" });

        expect(contentStorageSection.props()).toEqual(
          expect.objectContaining({
            lastEditDate: "2025-03-30T16:01:47Z",
            canSaveDraft: true,
            isBusy: false,
          })
        );
      });

      test("it delegates saving draft to saveDraft function from composable", () => {
        const wrapper = mount(ActionsSidebar, { props: { experienceId: "exp-id" } });

        const contentStorageSection = wrapper.getComponent({ name: "ContentStorageSection" });
        contentStorageSection.vm.$emit("saveDraft");

        expect(saveDraftMock).toHaveBeenCalledTimes(1);
      });
    });

    describe("completion section", () => {
      test("it displays the content storage section", () => {
        const wrapper = mount(ActionsSidebar, { props: { experienceId: "exp-id" } });

        const completionSection = wrapper.getComponent({ name: "CompletionSection" });

        expect(completionSection.props()).toEqual(
          expect.objectContaining({
            completionPercentage: 10,
            canPublish: true,
            isBusy: false,
          })
        );
      });

      test("it delegates publishing to publish function from composable", () => {
        const wrapper = mount(ActionsSidebar, { props: { experienceId: "exp-id" } });

        const completionSection = wrapper.getComponent({ name: "CompletionSection" });
        completionSection.vm.$emit("publish");

        expect(publishMock).toHaveBeenCalledTimes(1);
      });
    });
  });
});
