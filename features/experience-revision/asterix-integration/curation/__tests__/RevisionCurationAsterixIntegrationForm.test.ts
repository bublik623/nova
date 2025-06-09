import { shallowMount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import RevisionCurationAsterixIntegrationForm from "@/features/experience-revision/asterix-integration/curation/RevisionCurationAsterixIntegrationForm.vue";
import { RevisionFormProps } from "@/features/experience-revision/types/forms";
import { ServiceAndModalitiesTitleListValue } from "@/features/experience-shared/asterix-integration/asterix-service-and-modalities-titles/types/service-and-modalities-title-list-value";

const asterixTitleTranslationList: ServiceAndModalitiesTitleListValue = [
  {
    serviceCode: "SVC-001",
    title: "SVC-001 | title",
    modalities: [{ modalityCode: "MOD-001", title: "MOD-001 | title" }],
  },
];

const props: RevisionFormProps = {
  values: {
    productType: "ASX",
    serviceAndModalitiesTitleTranslationList: asterixTitleTranslationList,
  },
  options: {},
  requiredFields: ["any", "required", "field"],
  flow: "curation",
};

describe("RevisionCurationAsterixIntegrationForm", () => {
  describe("Service and modalities list field", () => {
    it("should be included in the form", () => {
      const wrapper = shallowMount(RevisionCurationAsterixIntegrationForm, {
        props,
        global: { renderStubDefaultSlot: true },
      });

      const serviceAndModalitiesListComponent = wrapper.getComponent({
        name: "CurationAsterixServiceAndModalitiesTitleListField",
      });
      expect(serviceAndModalitiesListComponent).toBeDefined();
    });

    it("should receive the expected asterix codes from the revision", () => {
      const wrapper = shallowMount(RevisionCurationAsterixIntegrationForm, {
        props,
        global: { renderStubDefaultSlot: true },
      });

      const serviceAndModalitiesListComponent = wrapper.getComponent({
        name: "CurationAsterixServiceAndModalitiesTitleListField",
      });
      expect(serviceAndModalitiesListComponent.props().targetValue).toStrictEqual(asterixTitleTranslationList);
    });

    it("should be readonly", () => {
      const wrapper = shallowMount(RevisionCurationAsterixIntegrationForm, {
        props,
        global: { renderStubDefaultSlot: true },
      });

      const serviceAndModalitiesListComponent = wrapper.getComponent({
        name: "CurationAsterixServiceAndModalitiesTitleListField",
      });
      expect(serviceAndModalitiesListComponent.props().readonly).toBe(true);
    });
  });
});
