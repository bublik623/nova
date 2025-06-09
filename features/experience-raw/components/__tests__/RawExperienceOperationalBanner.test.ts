import RawExperienceOperationalBanner from "@/features/experience-raw/components/RawExperienceOperationalBanner.vue";
import { useCurrentRawExperienceQuery } from "@/features/experience-raw/composables/useCurrentRawExperienceQuery";
import { RawStatusCode } from "@/types/DocumentStatuses";
import { config, shallowMount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

config.global.renderStubDefaultSlot = true;

config.global.mocks = {
  $t: (text: string) => text,
};

const useCurrentRawExperienceQueryMock = vi.mocked(useCurrentRawExperienceQuery);
vi.mock("@/features/experience-raw/composables/useCurrentRawExperienceQuery", () => ({
  useCurrentRawExperienceQuery: vi.fn(),
}));

describe("RawExperienceOperationalBanner.vue", () => {
  it("renders the NovaAlert when statusCode is BEING_CURATED", () => {
    // Mock the composable's return value
    useCurrentRawExperienceQueryMock.mockReturnValue({
      data: {
        // @ts-expect-error ...
        value: {
          status_code: RawStatusCode.BEING_CURATED,
        },
      },
    });

    const wrapper = shallowMount(RawExperienceOperationalBanner);

    const alert = wrapper.find("[data-testid='raw-experience-status-banner']");
    expect(alert.exists()).toBe(true);
    expect(alert.attributes("data-status")).toBe(RawStatusCode.BEING_CURATED);
    expect(alert.text()).toContain("experience.base_status_banner.operational_functional_changes_only");
    expect(alert.text()).toContain("experience.status_banner.in_review");
  });

  it("does not render the NovaAlert when statusCode is not BEING_CURATED", () => {
    // Mock the composable's return value
    useCurrentRawExperienceQueryMock.mockReturnValue({
      data: {
        value: {
          // @ts-expect-error ...
          status_code: "OTHER_STATUS",
        },
      },
    });

    const wrapper = shallowMount(RawExperienceOperationalBanner);

    const alert = wrapper.find("[data-testid='raw-experience-status-banner']");
    expect(alert.exists()).toBe(false);
  });
});
