import { config, mount, shallowMount } from "@vue/test-utils";
import { vi, describe, expect, test } from "vitest";
import RevisionTranslationAsterixServiceAndModalitiesTitleListField, {
  TranslationAsterixServiceAndModalitiesTitleListFieldProps,
} from "../RevisionTranslationAsterixServiceAndModalitiesTitleListField.vue";
import { ServiceAndModalitiesTitleListValue } from "@/features/experience-shared/asterix-integration/asterix-service-and-modalities-titles/types/service-and-modalities-title-list-value";
import { createTestingPinia } from "@pinia/testing";
import { useRevisionStore } from "@/features/experience-revision/store/useRevisionStore";
import { ExperienceRevision } from "@/features/experience-revision/types/revision";

config.global.mocks = {
  $t: (s: string) => s,
};

vi.stubGlobal("useNuxtApp", () => ({
  $t: (s: string) => s,
}));

const languageCode = "it";
const value: ServiceAndModalitiesTitleListValue = [
  {
    serviceCode: "SVC-1",
    title: "svc target title",
    modalities: [{ modalityCode: "MOD-1", title: "mod target title" }],
  },
];
const referenceValue: ServiceAndModalitiesTitleListValue = [
  {
    serviceCode: "SVC-1",
    title: "svc reference title",
    modalities: [{ modalityCode: "MOD-1", title: "mod reference title" }],
  },
];

const props: TranslationAsterixServiceAndModalitiesTitleListFieldProps = {
  languageCode,
  value,
};

describe("RevisionTranslationAsterixServiceAndModalitiesTitleListField", () => {
  test("it should forward value prop to underlying list component", () => {
    const wrapper = shallowMount(RevisionTranslationAsterixServiceAndModalitiesTitleListField, {
      props,
      global: { plugins: [createTestingPinia()] },
    });

    const underlyingListComponent = wrapper.findComponent({ name: "AsterixServiceAndModalitiesTitleListField" });

    expect(underlyingListComponent.props()).toMatchObject(expect.objectContaining({ targetValue: value }));
  });

  test("the underlying list component should be in readonly state", () => {
    const wrapper = shallowMount(RevisionTranslationAsterixServiceAndModalitiesTitleListField, { props });

    const underlyingListComponent = wrapper.findComponent({ name: "AsterixServiceAndModalitiesTitleListField" });

    expect(underlyingListComponent.props()).toMatchObject(expect.objectContaining({ readonly: true }));
  });

  test("the underlying list component should show reference values", () => {
    const wrapper = shallowMount(RevisionTranslationAsterixServiceAndModalitiesTitleListField, { props });

    const underlyingListComponent = wrapper.findComponent({ name: "AsterixServiceAndModalitiesTitleListField" });

    expect(underlyingListComponent.props()).toMatchObject(expect.objectContaining({ showReference: true }));
  });

  test("it should retrieve the reference value and pass to the underlying list component", () => {
    const revisionStore = useRevisionStore();
    revisionStore.curationValues = {
      productType: "ASX",
      serviceAndModalitiesTitleTranslationList: referenceValue,
    } as ExperienceRevision;

    const wrapper = shallowMount(RevisionTranslationAsterixServiceAndModalitiesTitleListField, { props });

    const underlyingListComponent = wrapper.findComponent({ name: "AsterixServiceAndModalitiesTitleListField" });

    expect(underlyingListComponent.props().referenceValue).toStrictEqual(referenceValue);
  });

  test("it should log an error if the value is updated in the underlying list component", () => {
    const consoleErrorMock = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const newValue: ServiceAndModalitiesTitleListValue = [];

    const wrapper = shallowMount(RevisionTranslationAsterixServiceAndModalitiesTitleListField, { props });

    const underlyingListComponent = wrapper.findComponent({ name: "AsterixServiceAndModalitiesTitleListField" });
    underlyingListComponent.vm.$emit("update:value", newValue);

    expect(consoleErrorMock).toHaveBeenCalledWith("unexpected update in revision curation asterix integration form", {
      newValue,
    });
  });

  test("it should display the master language (en) flag in the reference labels", () => {
    const wrapper = mount(RevisionTranslationAsterixServiceAndModalitiesTitleListField, { props });

    const referenceLabelFlagComponents = wrapper
      .findAll('[data-testid="reference-label"]')
      .flatMap((referenceLabel) => referenceLabel.findAllComponents({ name: "FlagLanguageDisplay" }));

    expect(referenceLabelFlagComponents).toHaveLength(2);
    expect(referenceLabelFlagComponents[0].props()).toMatchObject(expect.objectContaining({ countryCode: "en" }));
    expect(referenceLabelFlagComponents[1].props()).toMatchObject(expect.objectContaining({ countryCode: "en" }));
  });

  test("it should display the translation language flag in the target labels", () => {
    const wrapper = mount(RevisionTranslationAsterixServiceAndModalitiesTitleListField, { props });

    const referenceLabelFlagComponents = wrapper
      .findAll('[data-testid="target-label"]')
      .flatMap((referenceLabel) => referenceLabel.findAllComponents({ name: "FlagLanguageDisplay" }));

    expect(referenceLabelFlagComponents).toHaveLength(2);
    expect(referenceLabelFlagComponents[0].props()).toMatchObject(
      expect.objectContaining({ countryCode: props.languageCode })
    );
    expect(referenceLabelFlagComponents[1].props()).toMatchObject(
      expect.objectContaining({ countryCode: props.languageCode })
    );
  });
});
