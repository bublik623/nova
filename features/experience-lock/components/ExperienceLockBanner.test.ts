import { describe, expect, it, vi } from "vitest";
import { config, shallowMount } from "@vue/test-utils";
import ExperienceLockBanner from "./ExperienceLockBanner.vue";

vi.stubGlobal("useNuxtApp", () => ({
  $t: (s: string) => s,
}));

config.global.mocks = {
  $t: (text: string) => text,
};

config.global.renderStubDefaultSlot = true;

const getOneMock = vi.fn();

vi.mock("@/features/experience-lock/stores/useExperienceLockStore", () => ({
  useExperienceLockStore: () => ({
    getOne: getOneMock,
  }),
}));

describe("ExperienceLockBanner", () => {
  it("renders the alert when lock is active", () => {
    getOneMock.mockReturnValue({ locked: true, message: "Test lock message" });

    const wrapper = shallowMount(ExperienceLockBanner, {
      props: { flow: "raw" },
    });

    expect(wrapper.find("h2").text()).toBe("common.attention");
    expect(wrapper.find("p").text()).toBe("Test lock message");
    expect(wrapper.findComponent({ name: "NovaAlert" }).exists()).toBe(true);
  });

  it("does not render the alert when lock is inactive", () => {
    getOneMock.mockReturnValue({ locked: false });

    const wrapper = shallowMount(ExperienceLockBanner, {
      props: { flow: "raw" },
    });

    expect(wrapper.findComponent({ name: "NovaAlert" }).exists()).toBe(false);
  });
});
