import { config, shallowMount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import RawActionBar from "../RawActionBar.vue"; // Adjusted import path
import { StatusCode } from "@/types/generated/ExperienceRawServiceApi";
import ActionBarActivity from "@/features/experience-activity-log/components/ActionBarActivity.vue";
import ActionBarLastEditDate from "@/features/experience-shared/components/ActionBarLastEditDate.vue";
import VersionHistory from "@/features/experience-shared/components/VersionHistory.vue";

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

describe("RawActionBar", () => {
  const defaultProps = {
    experienceId: "exp123",
    experienceTitle: "Sample Experience",
    isReadonly: false,
    showDistributionLevel: true,
    saveDraftEnabled: true,
    saveDraftIsLoading: false,
    publishEnabled: true,
    publishIsLoading: false,
    percentageCompletion: 75,
    statusCode: "IN_CREATION" as StatusCode,
    activityLogIsLoading: false,
    activityLogError: false,
    groupedLogs: {}, // Add a mock groupedLogs object
    lastEditDate: "2023-10-10T00:00:00Z",
  };

  it("renders DistributionAttributes if showDistributionLevel is true and isReadonly is false", () => {
    const wrapper = shallowMount(RawActionBar, {
      props: { ...defaultProps, showDistributionLevel: true, isReadonly: false },
    });

    expect(wrapper.findComponent({ name: "DistributionAttributes" }).exists()).toBe(true);
  });

  it("renders save and publish buttons when isReadonly is false", () => {
    const wrapper = shallowMount(RawActionBar, {
      props: { ...defaultProps, isReadonly: false },
    });
    expect(wrapper.find("#save-content").exists()).toBe(true);
    expect(wrapper.find("#send-to-preview").exists()).toBe(true);
  });

  it("does not render save and publish buttons when isReadonly is true", () => {
    const wrapper = shallowMount(RawActionBar, {
      props: { ...defaultProps, isReadonly: true },
    });
    expect(wrapper.find("#save-content").exists()).toBe(false);
    expect(wrapper.find("#send-to-preview").exists()).toBe(false);
  });

  it("emits save-draft event when save button is clicked", async () => {
    const wrapper = shallowMount(RawActionBar, {
      props: { ...defaultProps },
    });

    const saveButtonComponent = wrapper.find("#save-content").getCurrentComponent();

    saveButtonComponent?.emit("click:action");

    await wrapper.find("#save-content").trigger("click");

    expect(wrapper.emitted("save-draft")).toBeTruthy();
  });

  it("emits publish event when publish button is clicked", async () => {
    const wrapper = shallowMount(RawActionBar, {
      props: { ...defaultProps },
    });

    const publishButtonComponent = wrapper.find("#send-to-preview").getCurrentComponent();

    publishButtonComponent?.emit("click:action");

    expect(wrapper.emitted("publish")).toBeTruthy();
  });

  it('renders delete button when statusCode is "IN_CREATION"', () => {
    const wrapper = shallowMount(RawActionBar, {
      props: { ...defaultProps, statusCode: "IN_CREATION" },
    });

    expect(wrapper.find(".delete-experience-button").exists()).toBe(true);
  });

  it("emits delete event when delete button is clicked", async () => {
    const wrapper = shallowMount(RawActionBar, {
      props: { ...defaultProps, statusCode: "IN_CREATION" },
    });
    await wrapper.find(".delete-experience-button").trigger("click");
    expect(wrapper.emitted("delete")).toBeTruthy();
  });

  it("renders ActionBarActivity component ", () => {
    const wrapper = shallowMount(RawActionBar, {
      props: { ...defaultProps },
    });

    const activityComponent = wrapper.findComponent(ActionBarActivity);

    expect(activityComponent.exists()).toBe(true);
  });

  it("renders last edit date if activity log is not loading and lastEditDate is provided", () => {
    const wrapper = shallowMount(RawActionBar, {
      props: { ...defaultProps, activityLogIsLoading: false, lastEditDate: "2023-10-10T00:00:00Z" },
    });
    expect(wrapper.findComponent(ActionBarLastEditDate).exists()).toBe(true);
  });

  it("emits open-revision event with correct revisionId", async () => {
    const wrapper = shallowMount(RawActionBar, {
      props: { ...defaultProps },
    });

    const component = wrapper.findComponent(VersionHistory);
    component.vm.$emit("action:open-revision", "rev123");

    expect(wrapper.emitted("open-revision")).toBeTruthy();
    expect(wrapper.emitted("open-revision")?.[0]).toEqual(["rev123"]);
  });

  describe("if is readonly", () => {
    it("should not show the delete exp button", () => {
      const wrapper = shallowMount(RawActionBar, {
        props: { ...defaultProps, isReadonly: true },
      });
      expect(wrapper.find(".delete-experience-button").exists()).toBe(false);
    });
  });
});
