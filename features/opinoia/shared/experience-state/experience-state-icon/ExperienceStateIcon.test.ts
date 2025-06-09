import { ExperienceState } from "@/features/experience-shared/utils/get-experience-state";
import { Icon } from "@/ui-kit/NovaIcon/NovaIcon.vue";
import { describe, expect, test } from "vitest";
import ExperienceStateIcon from "./ExperienceStateIcon.vue";
import { mount } from "@vue/test-utils";

describe("ExperienceStateIcon", () => {
  test.each<[Icon, ExperienceState]>([
    ["draft", "draft"],
    ["live-warning", "in_review"],
    ["success-solid", "ready"],
    ["error-solid", "unpublished"],
  ])("it should show '%s' icon when the state is '%s'", (expectedIcon: Icon, state: ExperienceState) => {
    const wrapper = mount(ExperienceStateIcon, { props: { state } });

    const novaIcon = wrapper.findComponent({ name: "NovaIcon" });

    expect(novaIcon.props()).toEqual(
      expect.objectContaining({
        name: expectedIcon,
      })
    );
  });
});
