import { config, mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";
import CompletionSection from "./CompletionSection.vue";

config.global.mocks = {
  $t: (text: string) => text,
};

describe("CompletionSection", () => {
  test("it displays the progress bar with the given percentage", () => {
    const wrapper = mount(CompletionSection, {
      props: { completionPercentage: 10, canPublish: true, isBusy: false },
    });

    const progressBar = wrapper.getComponent({ name: "ActionBarPercentage" });

    expect(progressBar.props()).toEqual(expect.objectContaining({ percentage: 10 }));
  });

  test("it emits publish event when the save draft button is clicked", async () => {
    const wrapper = mount(CompletionSection, {
      props: { completionPercentage: 10, canPublish: true, isBusy: false },
    });

    const ctaButton = wrapper.getComponent({ name: "NovaButton" });
    await ctaButton.trigger("click");

    expect(wrapper.emitted().publish).toHaveLength(1);
  });

  test("it does NOT emit publish event when the save draft button is clicked", async () => {
    const wrapper = mount(CompletionSection, {
      props: { completionPercentage: 10, canPublish: false, isBusy: false },
    });

    const ctaButton = wrapper.getComponent({ name: "NovaButton" });

    expect(ctaButton.attributes);
    await ctaButton.trigger("click");

    expect(wrapper.emitted().publish).toBeUndefined();
  });
});
