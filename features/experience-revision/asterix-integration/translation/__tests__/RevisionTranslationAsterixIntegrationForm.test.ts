import { shallowMount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import RevisionTranslationAsterixIntegrationForm from "../RevisionTranslationAsterixIntegrationForm.vue";
import { ServiceAndModalitiesTitleListValue } from "@/features/experience-shared/asterix-integration/asterix-service-and-modalities-titles/types/service-and-modalities-title-list-value";
import { TranslationFormProps } from "@/features/experience-translation/types";
import { ExperienceRevision } from "@/features/experience-revision/types/revision";

const asterixTitleCurationList: ServiceAndModalitiesTitleListValue = [
  {
    serviceCode: "SVC-001",
    title: "SVC-001 | curated title",
    modalities: [{ modalityCode: "MOD-001", title: "MOD-001 | title" }],
  },
];

const asterixTitleTranslationList: ServiceAndModalitiesTitleListValue = [
  {
    serviceCode: "SVC-001",
    title: "SVC-001 | translated title",
    modalities: [{ modalityCode: "MOD-001", title: "MOD-001 | title" }],
  },
];

const languageCode = "it";

const props: TranslationFormProps<ExperienceRevision | null> = {
  language: languageCode,
  initialValues: {
    productType: "ASX",
    serviceAndModalitiesTitleTranslationList: asterixTitleTranslationList,
  },
  curationValues: {
    productType: "ASX",
    serviceAndModalitiesTitleTranslationList: asterixTitleCurationList,
  },
};

describe("RevisionTranslationAsterixIntegrationForm", () => {
  describe("Service and modalities list field", () => {
    it("should be included in the form", () => {
      const wrapper = shallowMount(RevisionTranslationAsterixIntegrationForm, {
        props,
        global: { renderStubDefaultSlot: true },
      });

      const serviceAndModalitiesListComponent = wrapper.getComponent({
        name: "RevisionTranslationAsterixServiceAndModalitiesTitleListField",
      });
      expect(serviceAndModalitiesListComponent).toBeDefined();
    });

    it("should receive the expected language", () => {
      const wrapper = shallowMount(RevisionTranslationAsterixIntegrationForm, {
        props,
        global: { renderStubDefaultSlot: true },
      });

      const serviceAndModalitiesListComponent = wrapper.getComponent({
        name: "RevisionTranslationAsterixServiceAndModalitiesTitleListField",
      });
      expect(serviceAndModalitiesListComponent.props().languageCode).toBe(languageCode);
    });

    it("should receive the expected asterix codes from the revision", () => {
      const wrapper = shallowMount(RevisionTranslationAsterixIntegrationForm, {
        props,
        global: { renderStubDefaultSlot: true },
      });

      const serviceAndModalitiesListComponent = wrapper.getComponent({
        name: "RevisionTranslationAsterixServiceAndModalitiesTitleListField",
      });
      expect(serviceAndModalitiesListComponent.props().value).toStrictEqual(asterixTitleTranslationList);
    });
  });
});
