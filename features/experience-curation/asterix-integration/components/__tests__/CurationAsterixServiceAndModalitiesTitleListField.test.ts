import { shallowMount } from "@vue/test-utils";
import { vi, describe, expect, test, beforeEach } from "vitest";
import CurationAsterixServiceAndModalitiesTitleListField, {
  CurationAsterixServiceAndModalitiesTitleListFieldProps,
} from "../CurationAsterixServiceAndModalitiesTitleListField.vue";
import { ServiceAndModalitiesTitleListValue } from "../../../../experience-shared/asterix-integration/asterix-service-and-modalities-titles/types/service-and-modalities-title-list-value";

const queryFactoryMock = vi.hoisted(() => vi.fn());
vi.mock(
  "../../../../experience-shared/asterix-integration/asterix-service-and-modalities-titles/queries/useServiceAndModalitiesTitleListQuery.ts",
  () => ({
    useServiceAndModalitiesTitleListQuery: queryFactoryMock,
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

const props: CurationAsterixServiceAndModalitiesTitleListFieldProps = {
  readonly: false,
  showReference: true,
  targetValue,
};

describe("CurationAsterixServiceAndModalitiesTitleListField", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    queryFactoryMock.mockReturnValue({ data: referenceValue });
  });

  test("it should forward target-value prop to underlying list component", () => {
    const wrapper = shallowMount(CurationAsterixServiceAndModalitiesTitleListField, { props });

    const underlyingListComponent = wrapper.findComponent({ name: "AsterixServiceAndModalitiesTitleListField" });

    expect(underlyingListComponent.props()).toMatchObject(expect.objectContaining({ targetValue: props.targetValue }));
  });

  test("it should forward readonly prop to underlying list component", () => {
    const wrapper = shallowMount(CurationAsterixServiceAndModalitiesTitleListField, { props });

    const underlyingListComponent = wrapper.findComponent({ name: "AsterixServiceAndModalitiesTitleListField" });

    expect(underlyingListComponent.props()).toMatchObject(expect.objectContaining({ readonly: props.readonly }));
  });

  test("it should forward show-reference prop to underlying list component", () => {
    const wrapper = shallowMount(CurationAsterixServiceAndModalitiesTitleListField, { props });

    const underlyingListComponent = wrapper.findComponent({ name: "AsterixServiceAndModalitiesTitleListField" });

    expect(underlyingListComponent.props()).toMatchObject(
      expect.objectContaining({ showReference: props.showReference })
    );
  });

  test("it should retrieve the reference value and pass to the underlying list component", () => {
    const wrapper = shallowMount(CurationAsterixServiceAndModalitiesTitleListField, { props });

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
    const wrapper = shallowMount(CurationAsterixServiceAndModalitiesTitleListField, { props });

    const underlyingListComponent = wrapper.findComponent({ name: "AsterixServiceAndModalitiesTitleListField" });
    underlyingListComponent.vm.$emit("update:value", updatedValue);

    expect(wrapper.emitted()["update:value"][0]).toStrictEqual([updatedValue]);
  });
});
