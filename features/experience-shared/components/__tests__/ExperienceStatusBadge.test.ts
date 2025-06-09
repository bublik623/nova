import { MountingOptions, VueWrapper, shallowMount } from "@vue/test-utils";
import ExperienceStatusBadge, { ExperienceStatusBadgeProps } from "../ExperienceStatusBadge.vue";
import { describe, expect, test, vi } from "vitest";

vi.stubGlobal("useNuxtApp", () => ({
  $t: (text: string) => text,
}));

describe("ExperienceStatusBadge.vue", () => {
  let wrapper: VueWrapper<InstanceType<typeof ExperienceStatusBadge>>;

  const render = (options: MountingOptions<ExperienceStatusBadgeProps> = {}) => {
    wrapper = shallowMount(ExperienceStatusBadge, {
      props: {
        flowCode: undefined,
        statusCode: undefined,
      },
      ...options,
    });
  };

  describe("when status and flow codes are not provided", () => {
    test("renders BASE + IN_CREATION as default", () => {
      render();

      expect(wrapper.attributes("data-status-code")).toBe("IN_CREATION");
      expect(wrapper.attributes("data-flow-code")).toBe("BASE");
    });
  });

  describe("when valid status and flow codes are provided", () => {
    test("renders the correct badge for `IN_CREATION` status and `BASE` flow", () => {
      render({ props: { flowCode: "BASE", statusCode: "IN_CREATION" } });

      expect(wrapper.attributes("data-status-code")).toBe("IN_CREATION");
      expect(wrapper.attributes("data-flow-code")).toBe("BASE");
    });

    test("renders the correct badge for `BEING_CURATED` status and `BASE` flow", () => {
      render({ props: { flowCode: "BASE", statusCode: "BEING_CURATED" } });

      expect(wrapper.attributes("data-status-code")).toBe("BEING_CURATED");
      expect(wrapper.attributes("data-flow-code")).toBe("BASE");
    });
  });
});
