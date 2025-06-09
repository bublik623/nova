import { config, mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";
import ExperienceStateSection from "./ExperienceStateSection.vue";

config.global.mocks = {
  $t: (text: string) => text,
};

describe("ExperienceStateSection", () => {
  test("it displays the state icon", () => {
    const wrapper = mount(ExperienceStateSection, { props: { state: "draft" } });

    const icon = wrapper.getComponent({ name: "ExperienceStateIcon" });

    expect(icon.props()).toEqual(
      expect.objectContaining({
        state: "draft",
      })
    );
  });

  test("it displays the state name", () => {
    const wrapper = mount(ExperienceStateSection, { props: { state: "draft" } });

    const stateName = wrapper.get("span");

    expect(stateName.text()).equal("status.code.draft");
  });
});
