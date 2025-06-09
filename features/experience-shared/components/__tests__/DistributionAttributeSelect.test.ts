import { describe, test, expect, vi } from "vitest";
import { mount, config, VueWrapper } from "@vue/test-utils";
import DistributionAttributeSelect from "@/features/experience-shared/components/DistributionAttributeSelect.vue";

config.global.mocks = { $t: (text: string) => text };
vi.stubGlobal("useNuxtApp", () => ({ $t: (s: string) => s }));

describe("DistributionAttributeSelect.vue", () => {
  let wrapper: VueWrapper;

  const render = (props = {}) => {
    wrapper = mount(DistributionAttributeSelect, {
      props: {
        options: [{ label: "test-label", value: "FULL_CURATION" }],
        label: "Curation Level",
        testId: "testId",
        placeholder: "Select Curation Level",
        ...props,
      },
    });
  };

  test("renders dropdown with provided label", () => {
    render();
    expect(wrapper.find(".DistributionAttributeSelect__label").text()).toBe("Curation Level");
  });

  test("displays placeholder when no option is selected", () => {
    render();
    expect(wrapper.find(".DistributionAttributeSelect__placeholder").text()).toBe("Select Curation Level");
  });

  test("selecting an option emits the update:selected-attribute event", async () => {
    render();
    const novaDropdown = wrapper.findComponent({ name: "NovaDropdown" });
    expect(novaDropdown.exists()).toBeTruthy();

    const selectedOption = { label: "Option 1", value: "1" };
    await novaDropdown.vm.$emit("select:option", selectedOption);

    expect(wrapper.emitted()).toHaveProperty("update:selected-attribute");
    const emittedEvent = wrapper.emitted("update:selected-attribute");
    expect(emittedEvent).toHaveLength(1);
    if (emittedEvent) {
      expect(emittedEvent[0]).toEqual(["1"]);
    }
  });

  test("data-testid is correctly generated based on label", () => {
    render();
    expect(wrapper.find('[data-testid="testId"]').exists()).toBe(true);
  });

  test("readonly state doesn't render toggle button and shows readonly content", async () => {
    render({ readonly: true });

    expect(wrapper.find(".DistributionAttributeSelect__toggle").exists()).toBe(false);
    expect(wrapper.find(".DistributionAttributeSelect__readonly").exists()).toBe(true);
  });
});
