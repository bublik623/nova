import { MountingOptions, VueWrapper, mount } from "@vue/test-utils";
import ExperienceStatusIcon, { ExperienceStatusIconProps } from "../ExperienceStatusIcon.vue";
import { describe, expect, test } from "vitest";
import { testId } from "@/utils/test.utils";
import { ExperienceState } from "../../utils/get-experience-state";

describe("ExperienceStatusIcon.vue", () => {
  let wrapper: VueWrapper<InstanceType<typeof ExperienceStatusIcon>>;

  const render = (options: MountingOptions<ExperienceStatusIconProps> = {}) => {
    wrapper = mount(ExperienceStatusIcon, {
      props: {
        status: "NOT_READY",
      },
      global: {
        stubs: {
          // mock NovaIcon component so we don't need to render svgs dynamically
          NovaIcon: { template: "<svg></svg>" },
        },
      },
      ...options,
    });
  };

  const findIcon = () => wrapper.find(testId("experience-status-icon"));
  const getDistributionStatusAttr = () => findIcon().attributes("data-distribution-status");

  test("renders the red icon for `unpublished` status", () => {
    render({ props: { status: "UNPUBLISHED" } });

    expect(getDistributionStatusAttr()).toBe<ExperienceState>("unpublished");
  });

  test("displays draft icon if there is no status prop", async () => {
    render({ props: { status: undefined } });

    expect(getDistributionStatusAttr()).toBe<ExperienceState>("draft");
  });

  describe("if distribution date is *not* NULL", () => {
    test("experience status is `SENT` and media status is `SENT` it should display the green success icon", () => {
      render({ props: { status: "SENT", date: "anyvalue", mediaStatus: "SENT" } });

      expect(getDistributionStatusAttr()).toBe<ExperienceState>("ready");
    });

    test("experience status is `READY` and media status is `READY` it should display the green success icon", () => {
      render({ props: { status: "READY", date: "anyvalue", mediaStatus: "READY" } });

      expect(getDistributionStatusAttr()).toBe<ExperienceState>("ready");
    });

    test("experience status is `NOT_READY` or media status is `NOT_READY` it should display the warning icon", () => {
      render({ props: { status: "NOT_READY", date: "anyvalue", mediaStatus: "NOT_READY" } });

      expect(getDistributionStatusAttr()).toBe<ExperienceState>("in_review");
    });
  });

  describe("if distribution date is NULL", () => {
    test("experience status is `NOT_READY` or media status is `NOT_READY` it should display the gray draft icon", () => {
      render({ props: { status: "NOT_READY", mediaStatus: "NOT_READY" } });

      expect(getDistributionStatusAttr()).toBe<ExperienceState>("draft");
    });

    test("experience status is `READY` or media status is `READY` it should display the gray draft icon", () => {
      render({ props: { status: "READY", mediaStatus: "READY" } });

      expect(getDistributionStatusAttr()).toBe<ExperienceState>("ready");
    });
  });
});
