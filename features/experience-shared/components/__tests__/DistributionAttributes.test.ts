import { describe, test, expect, vi, beforeEach } from "vitest";
import { config, mount } from "@vue/test-utils";
import DistributionAttributes from "@/features/experience-shared/components/DistributionAttributes.vue";

config.global.mocks = { $t: (text: string) => text };
vi.stubGlobal("useNuxtApp", () => ({ $t: (s: string) => s }));

const mockedUseDistributionAttributes = {
  curationOptions: [{ label: "Dedicated", value: "DEDICATED" }],
  priorityOptions: [{ label: "Priority 8", value: "8" }],
  attributeValues: { value: { curationLevel: "DEDICATED", priority: 1 } },
  setCurationLevel: vi.fn(),
  setPriority: vi.fn(),
};

vi.mock("@/features/experience-shared/composables/useDistributionAttributes.ts", () => ({
  useDistributionAttributes: () => mockedUseDistributionAttributes,
}));
describe("DistributionAttributes.vue", () => {
  const wrapper = mount(DistributionAttributes, {});

  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("renders correctly with initial props", () => {
    expect(wrapper.find('[data-testid="distribution-attributes-selection"]').exists()).toBe(true);
    expect(wrapper.findAllComponents({ name: "DistributionAttributeSelect" })).toHaveLength(2);
  });

  test("it updates the curation level correctly", async () => {
    const wrapper = mount(DistributionAttributes, {});
    const [component] = wrapper.findAllComponents({
      name: "DistributionAttributeSelect",
    });

    await component.vm.$emit("update:selected-attribute", "curationLevel", "DEDICATED");

    expect(mockedUseDistributionAttributes.setCurationLevel).toHaveBeenCalledWith("curationLevel", "DEDICATED");
  });

  test("it set unsaved changes when priority is changed", async () => {
    const wrapper = mount(DistributionAttributes, {});
    const [, component] = wrapper.findAllComponents({
      name: "DistributionAttributeSelect",
    });

    await component.vm.$emit("update:selected-attribute", "priority", 8);

    expect(mockedUseDistributionAttributes.setPriority).toHaveBeenCalledWith("priority", 8);
  });
});
