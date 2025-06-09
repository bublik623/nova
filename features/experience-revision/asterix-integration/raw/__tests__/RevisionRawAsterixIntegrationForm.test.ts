import { shallowMount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import RevisionRawAsterixIntegrationForm from "@/features/experience-revision/asterix-integration/raw/RevisionRawAsterixIntegrationForm.vue";
import { RevisionFormProps } from "@/features/experience-revision/types/forms";
import { RawAsterixAdapterInformation } from "@/types/generated/ExperienceRawServiceApi";

const referenceCode = "EXP REF CODE";
const asterixCodes: RawAsterixAdapterInformation[] = [
  { code: "SVC-001", modality_codes: ["MOD-001", "MOD-002"] },
  { code: "SVC-002", modality_codes: ["MOD-003"] },
];

const props: RevisionFormProps = {
  values: {
    productType: "ASX",
    refCode: referenceCode,
    asx_codes: asterixCodes,
  },
  options: {},
  requiredFields: ["any", "required", "field"],
  flow: "raw",
};

describe("RevisionRawAsterixIntegrationForm", () => {
  describe("Service and modalities list field", () => {
    it("should be included in the form", () => {
      const wrapper = shallowMount(RevisionRawAsterixIntegrationForm, {
        props,
        global: { renderStubDefaultSlot: true },
      });

      const serviceAndModalitiesListComponent = wrapper.getComponent({ name: "AsterixServiceAndModalitiesListField" });
      expect(serviceAndModalitiesListComponent).toBeDefined();
    });

    it("should receive the expected asterix codes from the revision", () => {
      const wrapper = shallowMount(RevisionRawAsterixIntegrationForm, {
        props,
        global: { renderStubDefaultSlot: true },
      });

      const serviceAndModalitiesListComponent = wrapper.getComponent({ name: "AsterixServiceAndModalitiesListField" });
      expect(serviceAndModalitiesListComponent.props().value).toStrictEqual(asterixCodes);
    });

    it("should receive the experience reference code from the revision", () => {
      const wrapper = shallowMount(RevisionRawAsterixIntegrationForm, {
        props,
        global: { renderStubDefaultSlot: true },
      });

      const serviceAndModalitiesListComponent = wrapper.getComponent({ name: "AsterixServiceAndModalitiesListField" });
      expect(serviceAndModalitiesListComponent.props().experienceReferenceCode).toBe(referenceCode);
    });

    it("should be readonly", () => {
      const wrapper = shallowMount(RevisionRawAsterixIntegrationForm, {
        props,
        global: { renderStubDefaultSlot: true },
      });

      const serviceAndModalitiesListComponent = wrapper.getComponent({ name: "AsterixServiceAndModalitiesListField" });
      expect(serviceAndModalitiesListComponent.props().readonly).toBe(true);
    });
  });
});
