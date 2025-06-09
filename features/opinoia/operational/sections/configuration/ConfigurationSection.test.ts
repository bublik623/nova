import { config, shallowMount, VueWrapper } from "@vue/test-utils";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { ref, nextTick } from "vue";
import { isoDuration } from "@musement/iso-duration";
import type { ConfigurationSectionData } from "./types";

const mockPush = vi.fn();
vi.mock("#app", () => ({
  useNuxtApp: () => ({
    $t: (text: string) => text,
    $isoDuration: isoDuration,
  }),
  useRouter: () => ({
    push: mockPush,
  }),
}));

const workingCopyData = ref<ConfigurationSectionData>({
  configuration: {
    experienceCode: { value: "test-123" },
    languages: { value: [] },
    refundPolicies: { value: [] },
    paxes: { value: [] },
  },
});

const lastSavedData = ref<ConfigurationSectionData>({
  configuration: {
    experienceCode: { value: "test-123" },
    languages: { value: [] },
    refundPolicies: { value: [] },
    paxes: { value: [] },
  },
});
const mockSave = vi.fn();

vi.mock("./useConfigurationSection", () => ({
  useConfigurationSection: () => ({
    workingCopyData,
    lastSavedData: lastSavedData.value,
    canSave: true,
    isSaving: false,
    save: mockSave,
    setExperienceId: vi.fn(),
  }),
}));

import ConfigurationSection from "./ConfigurationSection.vue";

config.global.mocks = {
  $t: (text: string) => text,
};

describe("ConfigurationSection", () => {
  let wrapper: VueWrapper<any>;
  const experienceId = "exp-test-123";

  beforeEach(() => {
    wrapper = shallowMount(ConfigurationSection, {
      global: {
        renderStubDefaultSlot: true,
      },
      props: { experienceId: experienceId },
    });
  });

  it("should render the FormSections", () => {
    const sections = wrapper.findAll("form-section-stub");
    expect(sections).toHaveLength(4);
  });

  it("sets readonly=true on NovaInputText when experienceCode was already saved", () => {
    const inputStub = wrapper.find("nova-input-text-stub");
    expect(inputStub.exists()).toBe(true);
    // stubbed NovaInputText has readonly attribute if true
    expect(inputStub.attributes()).toHaveProperty("readonly");
  });

  it("sets readonly=false on NovaInputText when experienceCode was not saved", async () => {
    // Simulate no saved code
    lastSavedData.value.configuration.experienceCode.value = "";
    await wrapper.vm.$nextTick();

    const inputStub = wrapper.find("nova-input-text-stub");
    expect(inputStub.exists()).toBe(true);
    expect(inputStub.attributes("readonly")).toBeUndefined();
  });

  it("calls save() and then router.push on save-and-navigate", async () => {
    const btnWrapper = wrapper.findComponent({ name: "SaveAndGoNext" });
    await btnWrapper.vm.$emit("click:save-and-navigate");
    await nextTick();

    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith(`/opinoia/${experienceId}/operational/options`);
  });
});
