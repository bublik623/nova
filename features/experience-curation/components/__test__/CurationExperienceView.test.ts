import { config, shallowMount } from "@vue/test-utils";
import CurationExperienceView from "../CurationExperienceView.vue";
import { ExtractComponentProps } from "@/features/core-shared/composables/useAsyncModal";
import { beforeEach, describe, expect, Mock, test, vi } from "vitest";
import { useCurationExperienceStore } from "../../stores/useCurationExperienceStore";
import ExperienceFormWrapper from "@/features/experience-shared/components/ExperienceFormWrapper.vue";
import { eventBusCuration } from "@/features/experience-shared/composables/useEventBus";

const spy = vi.spyOn(eventBusCuration, "emit");

vi.mock("@/features/core-shared/composables/useAsyncModal");

vi.mock("../../stores/useCurationExperienceStore", () => ({
  useCurationExperienceStore: vi.fn(() => ({
    isReadonly: true,
  })),
}));

vi.mock("@/features/experience-shared/components/ExperienceFormWrapper.vue", () => ({
  default: vi.fn,
}));

const mockRouter = {
  push: vi.fn(),
};
vi.stubGlobal("useRouter", () => mockRouter);

config.global.renderStubDefaultSlot = true;

const useCurationExperienceStoreMock = useCurationExperienceStore as unknown as Mock;

type CurationExperienceViewProps = ExtractComponentProps<typeof CurationExperienceView>;

const defaultProps: CurationExperienceViewProps = {
  isSaveEnabled: false,
  isSavingDraft: false,
  selectedView: "all",
  showRawFields: false,
  nextAvailableSection: "section1",
};

describe("CurationExperienceView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("if the user can write, it passes the prop correctly", () => {
    const wrapper = shallowMountComponent();
    expect(useCurationExperienceStoreMock).toHaveBeenCalled();

    const nuxtPage = wrapper.findComponent("nuxt-page-stub");
    expect(nuxtPage.attributes("is-readonly")).toBe("true");
  });

  test("if the user can't write, it passes the prop correctly", () => {
    useCurationExperienceStoreMock.mockReturnValue({
      isReadonly: false,
    });

    const wrapper = shallowMountComponent();
    expect(useCurationExperienceStoreMock).toHaveBeenCalled();

    const nuxtPage = wrapper.findComponent("nuxt-page-stub");
    expect(nuxtPage.attributes("is-readonly")).toBe("false");
  });

  test("the form wrapper component is rendered, and the nuxt page is inside it", () => {
    const wrapper = shallowMountComponent();
    const experienceFormWrapper = wrapper.findComponent(ExperienceFormWrapper);
    expect(experienceFormWrapper.isVisible()).toBe(true);
    expect(experienceFormWrapper.find("nuxt-page-stub").exists()).toBe(true);
  });

  test("the props are passed correctly to the nuxt page component", () => {
    const wrapper = shallowMountComponent({
      isSaveEnabled: true,
      isSavingDraft: true,
      selectedView: "test",
      showRawFields: true,
      nextAvailableSection: "section2",
    });

    const nuxtPage = wrapper.findComponent("nuxt-page-stub");
    const {
      "is-save-enabled": isSaveEnabled,
      "is-saving-draft": isSavingDraft,
      "selected-view": selectedView,
      "show-raw-fields": showRawFields,
      "next-section-route": nextAvailableSection,
    } = nuxtPage.attributes();

    expect(isSaveEnabled).toBe("true");
    expect(isSavingDraft).toBe("true");
    expect(selectedView).toBe("test");
    expect(showRawFields).toBe("true");
    expect(nextAvailableSection).toBe("section2");
  });

  test("the components emits unsaved changes correctly", () => {
    const wrapper = shallowMountComponent();
    wrapper.vm.$emit("unsaved-changes");
    expect(wrapper.emitted("unsaved-changes")).toBeTruthy();
  });

  test("when the form wrapper emits save and navigate, it emits the event to the bus", () => {
    const wrapper = shallowMountComponent();
    const formWrapper = wrapper.findComponent(ExperienceFormWrapper);
    formWrapper.vm.$emit("click:save-and-navigate");

    expect(spy).toHaveBeenCalledWith("SAVE", {
      nextSection: "section1",
    });
  });

  test("when the form wrapper emits navigate, it changes page", () => {
    const wrapper = shallowMountComponent();
    const formWrapper = wrapper.findComponent(ExperienceFormWrapper);
    formWrapper.vm.$emit("click:navigate");

    expect(mockRouter.push).toHaveBeenCalledWith("section1");
  });

  test("when the form wrapper emits navigate, but there is no next section, it does not change page", () => {
    const wrapper = shallowMountComponent({
      nextAvailableSection: "",
    });
    const formWrapper = wrapper.findComponent(ExperienceFormWrapper);
    formWrapper.vm.$emit("click:navigate");

    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});

test("it does not show the save and go next button if there is no next section", () => {
  const wrapper = shallowMountComponent({
    nextAvailableSection: "",
  });
  const formWrapper = wrapper.findComponent(ExperienceFormWrapper);
  // formWrapper.props() comes up as an empty object
  expect(formWrapper.html()).includes('show-save-and-go-next="false"');
});

function shallowMountComponent(props?: Partial<CurationExperienceViewProps>) {
  return shallowMount(CurationExperienceView, {
    props: {
      ...defaultProps,
      ...props,
    },
    global: {
      stubs: {
        NuxtPage: true,
      },
    },
  });
}
