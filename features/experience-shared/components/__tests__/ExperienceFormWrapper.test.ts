import ExperienceFormBanners from "@/features/experience-shared/components/ExperienceFormBanners.vue";
import ExperienceFormWrapper from "@/features/experience-shared/components/ExperienceFormWrapper.vue";
import SaveAndGoNext from "@/features/experience-shared/components/SaveAndGoNext.vue";
import { shallowMount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/experience-shared/components/ExperienceFormBanners.vue", () => ({
  default: vi.fn,
}));

describe("ExperienceFormWrapper.vue", () => {
  it("renders the ExperienceFormBanners component", () => {
    const wrapper = shallowMount(ExperienceFormWrapper);
    expect(wrapper.findComponent(ExperienceFormBanners).exists()).toBe(true);
  });

  it("renders default slot content", () => {
    const wrapper = shallowMount(ExperienceFormWrapper, {
      slots: {
        default: "<div class='test-slot'>Test Slot Content</div>",
      },
    });
    expect(wrapper.html()).toContain("Test Slot Content");
    expect(wrapper.find(".test-slot").exists()).toBe(true);
  });

  it("applies the correct classes to the main element", () => {
    const wrapper = shallowMount(ExperienceFormWrapper);
    const container = wrapper.find("div");
    expect(container.classes()).toMatchInlineSnapshot(`
      [
        "w-full",
        "max-w-screen-lg",
      ]
    `);
    const mainElement = wrapper.find("main");
    expect(mainElement.classes()).toMatchInlineSnapshot(`
      [
        "m-6",
        "flex",
        "flex-col",
        "gap-10",
      ]
    `);
  });

  it("does not render the save and go next component when it's disabled", () => {
    const wrapper = shallowMount(ExperienceFormWrapper, {
      props: {
        showSaveAndGoNext: false,
      },
    });
    const saveAndGoNext = wrapper.findComponent(SaveAndGoNext);
    expect(saveAndGoNext.exists()).toBe(false);
  });

  it("renders the save and go next component when it's enabled", () => {
    const wrapper = shallowMount(ExperienceFormWrapper, {
      // @ts-expect-error ...
      props: {
        showSaveAndGoNext: true,
      },
    });
    const saveAndGoNext = wrapper.findComponent(SaveAndGoNext);
    console.log(wrapper.html());
    expect(saveAndGoNext.exists()).toBe(true);
  });

  it("emits the save and go next events", async () => {
    const wrapper = shallowMount(ExperienceFormWrapper, {
      // @ts-expect-error ...
      props: {
        showSaveAndGoNext: true,
      },
    });

    const saveAndGoNext = wrapper.findComponent(SaveAndGoNext);
    saveAndGoNext.vm.$emit("click:save-and-navigate");
    saveAndGoNext.vm.$emit("click:navigate");
    expect(wrapper.emitted("click:save-and-navigate")).toBeTruthy();
    expect(wrapper.emitted("click:navigate")).toBeTruthy();
  });

  it("passes the props to the save and go component correctly", () => {
    const wrapper = shallowMount(ExperienceFormWrapper, {
      props: {
        showSaveAndGoNext: true,
        isReadonly: true,
        isSaveEnabled: false,
        isSavingDraft: true,
      },
    });

    const saveAndGoNext = wrapper.findComponent(SaveAndGoNext);
    expect(saveAndGoNext.props()).toMatchInlineSnapshot(`
      {
        "disabled": true,
        "loading": true,
        "readonly": true,
      }
    `);
  });
});
