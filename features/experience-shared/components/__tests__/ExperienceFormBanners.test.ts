import { shallowMount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import * as useCurrentExperienceFlowObj from "../../composables/useCurrentExperienceFlow";
import * as getDistributionStateObj from "../../utils/get-experience-state";
import * as useCurrentDistributionContentQueryObj from "../../composables/useCurrentDistributionContentQuery";
import ExperienceFormBanners from "../ExperienceFormBanners.vue";
import ExperienceStatusBanner from "../ExperienceStatusBanner.vue";
import { DocumentContentType } from "@/types/DocumentStatuses";
import ExperienceLockBanner from "@/features/experience-lock/components/ExperienceLockBanner.vue";
import RawExperienceOperationalBanner from "@/features/experience-raw/components/RawExperienceOperationalBanner.vue";

const useCurrentExperienceFlowSpy = vi.spyOn(useCurrentExperienceFlowObj, "useCurrentExperienceFlow");
const getDistributionStateSpy = vi.spyOn(getDistributionStateObj, "getDistributionState");
const useCurrentDistributionContentQuerySpy = vi.spyOn(
  useCurrentDistributionContentQueryObj,
  "useCurrentDistributionContentQuery"
);

vi.mock("@/features/experience-lock/components/ExperienceLockBanner.vue", () => ({
  default: vi.fn,
}));

describe("ExperienceFormBanners.vue", () => {
  it("renders ExperienceStatusBanner when shouldShowDistributionBanner is true", async () => {
    const mockExperienceFlow = computed(() => DocumentContentType.TRANSLATION);
    const mockDistributionContentQuery = {
      data: ref({ id: "123", state: "published" }),
    };
    const mockDistributionState = "in_review";

    useCurrentExperienceFlowSpy.mockReturnValue(mockExperienceFlow);
    // @ts-expect-error ...
    useCurrentDistributionContentQuerySpy.mockReturnValue(mockDistributionContentQuery);
    getDistributionStateSpy.mockReturnValue(mockDistributionState);

    const wrapper = shallowMount(ExperienceFormBanners);

    expect(wrapper.findComponent(ExperienceStatusBanner).exists()).toBe(true);
    expect(wrapper.findComponent(ExperienceStatusBanner).props()).toMatchObject({
      experienceId: "123",
      status: "in_review",
      isTranslationFlow: true,
    });
  });

  it("does not render ExperienceStatusBanner when shouldShowDistributionBanner is false", async () => {
    const mockExperienceFlow = computed(() => DocumentContentType.RAW);
    const mockDistributionContentQuery = {
      data: ref({ id: "123", state: "draft" }),
    };
    const mockDistributionState = null;

    useCurrentExperienceFlowSpy.mockReturnValue(mockExperienceFlow);
    // @ts-expect-error ...
    useCurrentDistributionContentQuerySpy.mockReturnValue(mockDistributionContentQuery);
    // @ts-expect-error ...
    getDistributionStateSpy.mockReturnValue(mockDistributionState);

    const wrapper = shallowMount(ExperienceFormBanners);

    expect(wrapper.findComponent(ExperienceStatusBanner).exists()).toBe(false);
  });

  it("should mount the ExperienceLockBanner", async () => {
    const mockExperienceFlow = computed(() => DocumentContentType.RAW);
    const mockDistributionContentQuery = {
      data: ref({ id: "123", state: "published" }),
    };
    const mockDistributionState = "in_review";

    useCurrentExperienceFlowSpy.mockReturnValue(mockExperienceFlow);
    // @ts-expect-error ...
    useCurrentDistributionContentQuerySpy.mockReturnValue(mockDistributionContentQuery);
    getDistributionStateSpy.mockReturnValue(mockDistributionState);

    const wrapper = shallowMount(ExperienceFormBanners);

    expect(wrapper.findComponent(ExperienceLockBanner).exists()).toBe(true);
  });

  it("it mounts the RawExperienceOperationalBanner in raw", async () => {
    const mockExperienceFlow = computed(() => DocumentContentType.RAW);
    const mockDistributionContentQuery = {
      data: ref({ id: "123", state: "published" }),
    };
    const mockDistributionState = "in_review";

    useCurrentExperienceFlowSpy.mockReturnValue(mockExperienceFlow);
    // @ts-expect-error ...
    useCurrentDistributionContentQuerySpy.mockReturnValue(mockDistributionContentQuery);
    getDistributionStateSpy.mockReturnValue(mockDistributionState);

    const wrapper = shallowMount(ExperienceFormBanners);
    expect(wrapper.findComponent(RawExperienceOperationalBanner).exists()).toBe(true);
  });

  it("does not mount the RawExperienceOperationalBanner when not in raw", async () => {
    const mockExperienceFlow = computed(() => DocumentContentType.EDITORIAL);
    const mockDistributionContentQuery = {
      data: ref({ id: "123", state: "published" }),
    };
    const mockDistributionState = "in_review";

    useCurrentExperienceFlowSpy.mockReturnValue(mockExperienceFlow);
    // @ts-expect-error ...
    useCurrentDistributionContentQuerySpy.mockReturnValue(mockDistributionContentQuery);
    getDistributionStateSpy.mockReturnValue(mockDistributionState);

    const wrapper = shallowMount(ExperienceFormBanners);
    expect(wrapper.findComponent(RawExperienceOperationalBanner).exists()).toBe(false);
  });
});
