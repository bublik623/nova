import { describe, it, expect, beforeEach, vi } from "vitest";
import { ref, readonly, Ref } from "vue";

import type { DocumentSidebarSection } from "@/features/opinoia/shared/ExperienceSidebar/types";
import { useSidebarConfigurationSection } from "./useSidebarConfigurationSection";

const configurationSection = ref({
  configuration: {
    experienceCode: { value: "test-code" },
    languages: { value: [] },
    refundPolicies: { value: [] },
    paxes: { value: [] },
  },
});

vi.mock("../useConfigurationSection", () => ({
  useConfigurationSection: () => ({
    workingCopyData: configurationSection,
  }),
}));

describe("useSidebarConfigurationSection", () => {
  let experienceId: Ref<string>;

  beforeEach(() => {
    experienceId = ref("test-exp-123");
    configurationSection.value.configuration = {
      experienceCode: { value: "test-code" },
      languages: { value: [] },
      refundPolicies: { value: [] },
      paxes: { value: [] },
    };
  });

  it("should have the correct static structure and keys", () => {
    const sectionRef = useSidebarConfigurationSection(readonly(experienceId));
    const section: DocumentSidebarSection = sectionRef.value;

    expect(section.key).toBe("configuration");
    expect(section.icon).toBe("configuration");
    expect(section.isRequired).toBe(true);
    expect(section.showFields).toBe(true);
    expect(Array.isArray(section.fields)).toBe(true);
    expect(section.fields.length).toBe(4);

    const keys = section.fields.map((f) => f.key);
    expect(keys).toEqual(["experience_code", "cancellation_policy", "languages", "pax_types"]);
  });

  it("should generate the correct URL based on initial experienceId", () => {
    const sectionRef = useSidebarConfigurationSection(readonly(experienceId));
    expect(sectionRef.value.url).toBe("/opinoia/test-exp-123/operational/configuration");
  });

  it("should update URL when experienceId changes", () => {
    const sectionRef = useSidebarConfigurationSection(readonly(experienceId));
    expect(sectionRef.value.url).toBe("/opinoia/test-exp-123/operational/configuration");

    experienceId.value = "new-exp-456";

    expect(sectionRef.value.url).toBe("/opinoia/new-exp-456/operational/configuration");
  });

  it("should reflect individual field validity based on current configuration values", () => {
    const section = useSidebarConfigurationSection(readonly(experienceId)).value;
    const mapByKey = Object.fromEntries(section.fields.map((f) => [f.key, f]));

    expect(mapByKey["experience_code"].isValid).toBe(true);
    expect(mapByKey["cancellation_policy"].isValid).toBe(false);
    expect(mapByKey["languages"].isValid).toBe(false);
    expect(mapByKey["pax_types"].isValid).toBe(false);

    const configuration = configurationSection.value.configuration;
    configuration.languages.value = ["en"];
    configuration.refundPolicies.value = ["standard"];
    configuration.paxes.value = [{ type: "adult" }];

    const updated = useSidebarConfigurationSection(readonly(experienceId)).value;
    const updatedMap = Object.fromEntries(updated.fields.map((f) => [f.key, f]));

    expect(updatedMap["languages"].isValid).toBe(true);
    expect(updatedMap["cancellation_policy"].isValid).toBe(true);
    expect(updatedMap["pax_types"].isValid).toBe(true);
  });

  it("should set section.isValid = false when any required field is invalid, and true when all required are valid", () => {
    const section = useSidebarConfigurationSection(readonly(experienceId)).value;
    expect(section.isValid).toBe(false);

    const configuration = configurationSection.value.configuration;
    configuration.refundPolicies.value = ["r1"];
    configuration.paxes.value = [[{ type: "adult" }]];

    const sectionAllValid = useSidebarConfigurationSection(readonly(experienceId)).value;
    expect(sectionAllValid.isValid).toBe(true);
  });
});
