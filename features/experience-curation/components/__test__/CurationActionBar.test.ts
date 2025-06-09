import { config, shallowMount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import CurationActionBar from "../CurationActionBar.vue";
import { testId } from "@/utils/test.utils";
import ExperienceStatusDropdown from "@/features/experience-shared/components/ExperienceStatusDropdown.vue";
import CollectionCriteriaButton from "../CollectionCriteriaButton.vue";
import VersionHistory from "@/features/experience-shared/components/VersionHistory.vue";
import { ExtractComponentProps } from "@/features/core-shared/composables/useAsyncModal";

vi.stubGlobal("useNuxtApp", () => ({
  $t: (s: string) => s,
}));

config.global.mocks = {
  $t: (s: string) => s,
};

config.global.stubs = {
  ActionBar: {
    template: "<div><slot name='actions'/><slot name='actions_footer' /><slot name='history' /></div>",
  },
  ProductHistory: {
    template: "<div><slot name='activity_log'/> <slot name='version_history' /></div>",
  },
  ActionBarCta: {
    template: "<div><slot/><slot name='additional-info' /></div>",
  },
};
type CurationActionBarProps = ExtractComponentProps<typeof CurationActionBar>;

const defaultProps: CurationActionBarProps = {
  isReadonly: false,
  activityLogError: false,
  activityLogStoreLoading: false,
  collectionCriteria: {
    best_value_guaranteed: "a",
    created_with_care: "b",
    exceptional_experiences: "c",
  },
  dropdownStatuses: {
    distribution: "draft",
    curation: "IN_CREATION",
  },
  groupedLogs: {},
  lastEditDate: "2023-10-10T00:00:00Z",
  percentageCompletion: 75,
  id: "exp123",
  isEnabled: true,
  isLoadingStatus: false,
  isSaveEnabled: true,
  isSaving: false,
  isSendingToTranslation: false,
  loadingActivityLog: false,
  showBrandCollectionCriteria: true,
  saveButtonClicked: "DRAFT",
};

describe("CurationActionBar", () => {
  it("renders save and publish buttons when isReadonly is false", () => {
    const wrapper = shallowMountComponent();

    expect(wrapper.find("#save-content").exists()).toBe(true);
    expect(wrapper.find("#send-to-translation").exists()).toBe(true);
  });

  it("does not render save and publish buttons when isReadonly is true", () => {
    const wrapper = shallowMountComponent({
      isReadonly: true,
    });

    expect(wrapper.find("#save-content").exists()).toBe(false);
    expect(wrapper.find("#send-to-translation").exists()).toBe(false);
  });

  it("emits save-draft event when save button is clicked", async () => {
    const wrapper = shallowMountComponent();

    const saveButtonComponent = wrapper.find("#save-content").getCurrentComponent();

    saveButtonComponent?.emit("click:action");

    expect(wrapper.emitted("save-draft")).toBeTruthy();
  });

  it("emits publish-and-translate event when send to translation button is clicked", async () => {
    const wrapper = shallowMountComponent();

    const sendToTranslationButtonComponent = wrapper.find("#send-to-translation").getCurrentComponent();

    sendToTranslationButtonComponent?.emit("click:action");

    expect(wrapper.emitted("publish-and-translate")).toBeTruthy();
  });

  it("emits publish without translation event when publish button is clicked", async () => {
    const wrapper = shallowMountComponent();
    const locator = testId(`experience-curation-${defaultProps.id}-action-bar-publish-update`);

    const publishButtonComponent = wrapper.find(locator).getCurrentComponent();

    publishButtonComponent?.emit("click");

    expect(wrapper.emitted("publish-without-translation")).toBeTruthy();
  });

  it("emits a status change event when the status dropdown is changed", async () => {
    const wrapper = shallowMountComponent();

    wrapper.findComponent(ExperienceStatusDropdown).vm.$emit("publish", "status-change-event");

    expect(wrapper.emitted("status-change")).toMatchInlineSnapshot(`
      [
        [
          "publish",
        ],
      ]
    `);
  });

  it("it displays the collection criteria correctly", () => {
    const wrapper = shallowMountComponent();
    expect(wrapper.findComponent(CollectionCriteriaButton).exists()).toBe(true);
  });

  it("emits open-revision event with correct revisionId", async () => {
    const wrapper = shallowMountComponent();

    const component = wrapper.findComponent(VersionHistory);
    component.vm.$emit("action:open-revision", "rev123");

    expect(wrapper.emitted("open-revision")).toBeTruthy();
    expect(wrapper.emitted("open-revision")?.[0]).toEqual(["rev123"]);
  });
});

function shallowMountComponent(props?: Partial<CurationActionBarProps>) {
  return shallowMount(CurationActionBar, {
    props: {
      ...defaultProps,
      ...(props || {}),
    },
  });
}
