import { config, mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";
import ContentStorageSection from "./ContentStorageSection.vue";

config.global.mocks = {
  $t: (text: string) => text,
};

describe("ContentStorageSection", () => {
  test("it display the given last edit date formatted as 'dd MMM yyyy, p'", () => {
    const wrapper = mount(ContentStorageSection, {
      props: { lastEditDate: "2025-03-30T16:01:47Z", canSaveDraft: true, isBusy: false },
    });

    expect(wrapper.text()).toContain("30 Mar 2025, 4:01 PM");
  });

  test("it emits saveDraft event when the save draft button is clicked", async () => {
    const wrapper = mount(ContentStorageSection, {
      props: { lastEditDate: "2025-03-30T16:01:47Z", canSaveDraft: true, isBusy: false },
    });

    const ctaButton = wrapper.getComponent({ name: "NovaButton" });
    await ctaButton.trigger("click");

    expect(wrapper.emitted().saveDraft).toHaveLength(1);
  });

  test("it does NOT emit saveDraft event when the save draft button is clicked", async () => {
    const wrapper = mount(ContentStorageSection, {
      props: { lastEditDate: "2025-03-30T16:01:47Z", canSaveDraft: false, isBusy: false },
    });

    const ctaButton = wrapper.getComponent({ name: "NovaButton" });

    expect(ctaButton.attributes);
    await ctaButton.trigger("click");

    expect(wrapper.emitted().saveDraft).toBeUndefined();
  });
});
