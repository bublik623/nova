import { config, shallowMount, mount } from "@vue/test-utils";
import { vi, describe, expect, test, beforeEach } from "vitest";
import TranslationAsterixServiceAndModalitiesTitleListField, {
  TranslationAsterixServiceAndModalitiesTitleListFieldProps,
} from "../TranslationAsterixServiceAndModalitiesTitleListField.vue";
import { ServiceAndModalitiesTitleListValue } from "../../../../experience-shared/asterix-integration/asterix-service-and-modalities-titles/types/service-and-modalities-title-list-value";

config.global.mocks = {
  $t: (s: string) => s,
};

vi.stubGlobal("useNuxtApp", () => ({
  $t: (s: string) => s,
}));

const titleListFieldMock = vi.hoisted(() => vi.fn());
vi.mock(
  "../../../../experience-shared/asterix-integration/asterix-service-and-modalities-titles/composables/useAsterixServiceAndModalitiesTitleTranslationsListField.ts",
  () => ({
    useAsterixServiceAndModalitiesTitleTranslationsListField: titleListFieldMock,
  })
);

const referenceValue: ServiceAndModalitiesTitleListValue = [
  {
    serviceCode: "SVC-1",
    title: "svc reference title",
    modalities: [{ modalityCode: "MOD-1", title: "mod reference title" }],
  },
];
const targetValue: ServiceAndModalitiesTitleListValue = [
  {
    serviceCode: "SVC-1",
    title: "svc target title",
    modalities: [{ modalityCode: "MOD-1", title: "mod target title" }],
  },
];

const props: TranslationAsterixServiceAndModalitiesTitleListFieldProps = {
  readonly: false,
  targetValue,
  experienceId: "exp-id",
  languageCode: "es",
};

describe("TranslationAsterixServiceAndModalitiesTitleListField", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    titleListFieldMock.mockReturnValue({ lastSavedValue: referenceValue });
  });

  test("it should forward target-value prop to underlying list component", () => {
    const wrapper = shallowMount(TranslationAsterixServiceAndModalitiesTitleListField, { props });

    const underlyingListComponent = wrapper.findComponent({ name: "AsterixServiceAndModalitiesTitleListField" });

    expect(underlyingListComponent.props()).toMatchObject(expect.objectContaining({ targetValue: props.targetValue }));
  });

  test("it should forward readonly prop to underlying list component", () => {
    const wrapper = shallowMount(TranslationAsterixServiceAndModalitiesTitleListField, { props });

    const underlyingListComponent = wrapper.findComponent({ name: "AsterixServiceAndModalitiesTitleListField" });

    expect(underlyingListComponent.props()).toMatchObject(expect.objectContaining({ readonly: props.readonly }));
  });

  test("it should display the master language (en) flag in the reference labels", () => {
    const wrapper = mount(TranslationAsterixServiceAndModalitiesTitleListField, { props });

    const referenceLabelFlagComponents = wrapper
      .findAll('[data-testid="reference-label"]')
      .flatMap((referenceLabel) => referenceLabel.findAllComponents({ name: "FlagLanguageDisplay" }));

    expect(referenceLabelFlagComponents).toHaveLength(2);
    expect(referenceLabelFlagComponents[0].props()).toMatchObject(expect.objectContaining({ countryCode: "en" }));
    expect(referenceLabelFlagComponents[1].props()).toMatchObject(expect.objectContaining({ countryCode: "en" }));
  });

  test("it should display the translation language flag in the target labels", () => {
    const wrapper = mount(TranslationAsterixServiceAndModalitiesTitleListField, { props });

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

  test("it should retrieve the reference value and pass to the underlying list component", () => {
    const wrapper = shallowMount(TranslationAsterixServiceAndModalitiesTitleListField, { props });

    const underlyingListComponent = wrapper.findComponent({ name: "AsterixServiceAndModalitiesTitleListField" });

    expect(underlyingListComponent.props()).toMatchObject(expect.objectContaining({ referenceValue }));
  });

  test("it should bubble update:value event from underlying list component", () => {
    const updatedValue: ServiceAndModalitiesTitleListValue = [
      {
        serviceCode: "SVC-1",
        title: "svc updated title",
        modalities: [{ modalityCode: "MOD-1", title: "mod updated title" }],
      },
    ];
    const wrapper = shallowMount(TranslationAsterixServiceAndModalitiesTitleListField, { props });

    const underlyingListComponent = wrapper.findComponent({ name: "AsterixServiceAndModalitiesTitleListField" });
    underlyingListComponent.vm.$emit("update:value", updatedValue);

    expect(wrapper.emitted()["update:value"][0]).toStrictEqual([updatedValue]);
  });
});
