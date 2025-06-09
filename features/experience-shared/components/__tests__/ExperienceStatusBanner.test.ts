import { describe, test, expect, vi } from "vitest";
import { mount, MountingOptions, VueWrapper } from "@vue/test-utils";
import ExperienceStatusBanner, {
  ExperienceStatusBannerProps,
} from "@/features/experience-shared/components/ExperienceStatusBanner.vue";

vi.stubGlobal("useNuxtApp", () => ({
  $t: (text: string) => text,
}));

describe("ExperienceStatusBanner.vue", () => {
  let wrapper: VueWrapper<InstanceType<typeof ExperienceStatusBanner>>;
  const render = (options: MountingOptions<ExperienceStatusBannerProps> = {}) => {
    wrapper = mount(ExperienceStatusBanner, {
      props: {
        status: "NOT_READY",
      },
      ...options,
    });
  };

  const findBanner = () => wrapper.find('[data-testid="experience-status-banner"]');

  test("renders success banner when status is READY", () => {
    render({ props: { status: "ready", experienceId: "test-id" } });

    expect(findBanner().attributes("data-status")).toBe("ready");
  });

  test("renders error banner when status is UNPUBLISHED", () => {
    render({ props: { status: "unpublished", experienceId: "test-id" } });

    expect(findBanner().attributes("data-status")).toBe("unpublished");
  });

  test("renders warning banner when status is IN_REVIEW", () => {
    render({ props: { status: "in_review", experienceId: "test-id" } });

    expect(findBanner().attributes("data-status")).toBe("in_review");
  });

  test("does not render banner when status is neither READY nor IN_REVIEW", () => {
    render({ props: { status: "OTHER_STATUS" as ExperienceStatusBannerProps["status"], experienceId: "test-id" } });

    expect(findBanner().exists()).toBe(false);
  });

  test("renders close icon when status is READY", async () => {
    render({ props: { status: "ready", experienceId: "test-id" } });

    await wrapper.vm.$nextTick();
    const closeIcon = wrapper.findComponent({ name: "NovaIcon" });
    expect(closeIcon.exists()).toBe(true);
  });

  test("renders close icon when status is UNPUBLISHED", async () => {
    render({ props: { status: "unpublished", experienceId: "test-id" } });

    await wrapper.vm.$nextTick();
    const closeIcon = wrapper.findComponent({ name: "NovaIcon" });
    expect(closeIcon.exists()).toBe(true);
  });
});
