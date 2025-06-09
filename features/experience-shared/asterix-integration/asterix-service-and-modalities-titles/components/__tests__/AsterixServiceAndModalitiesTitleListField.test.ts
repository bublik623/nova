import { describe, expect, it, test, vi } from "vitest";
import AsterixServiceAndModalitiesTitleListField from "../AsterixServiceAndModalitiesTitleListField.vue";
import { mount, shallowMount } from "@vue/test-utils";
import { ServiceAndModalitiesTitleListValue } from "@/features/experience-shared/asterix-integration/asterix-service-and-modalities-titles/types/service-and-modalities-title-list-value";

vi.stubGlobal("useNuxtApp", () => ({
  $t: (s: string) => s,
}));

const referenceValue: ServiceAndModalitiesTitleListValue = [
  {
    serviceCode: "SVC-1",
    title: "SVC-1 reference title",
    modalities: [
      { modalityCode: "MOD-1", title: "MOD-1 reference title" },
      { modalityCode: "MOD-2", title: "MOD-2 reference title" },
    ],
  },
  {
    serviceCode: "SVC-2",
    title: "SVC-2 reference title",
    modalities: [
      { modalityCode: "MOD-3", title: "MOD-3 reference title" },
      { modalityCode: "MOD-4", title: "MOD-4 reference title" },
    ],
  },
];

const targetValue: ServiceAndModalitiesTitleListValue = [
  {
    serviceCode: "SVC-1",
    title: "SVC-1 title",
    modalities: [
      { modalityCode: "MOD-1", title: "MOD-1 title" },
      { modalityCode: "MOD-2", title: "MOD-2 title" },
    ],
  },
  {
    serviceCode: "SVC-2",
    title: "SVC-2 title",
    modalities: [
      { modalityCode: "MOD-3", title: "MOD-3 title" },
      { modalityCode: "MOD-4", title: "MOD-4 title" },
    ],
  },
];

describe("AsterixServiceAndModalitiesTitleListField", () => {
  it("should render one AsterixServiceAndModalitiesTitleEditor for each entry", () => {
    const wrapper = shallowMount(AsterixServiceAndModalitiesTitleListField, {
      props: {
        readonly: false,
        showReference: true,
        referenceValue,
        targetValue,
      },
    });

    const editorComponents = wrapper.findAllComponents({ name: "AsterixServiceAndModalitiesTitleEditor" });

    expect(editorComponents.length).toBe(2);
    expect(
      editorComponents.some((editor) => {
        const editorProps = editor.props();
        return editorProps.referenceValue === referenceValue[0] && editorProps.targetValue === targetValue[0];
      })
    );
    expect(
      editorComponents.some((editor) => {
        const editorProps = editor.props();
        return editorProps.referenceValue === referenceValue[1] && editorProps.targetValue === targetValue[1];
      })
    );
  });

  it("should emit update:value when an item is updated", () => {
    const updatedValue = {
      ...targetValue[0],
      modalities: [{ ...targetValue[0].modalities[0], title: "new modality title" }, targetValue[0].modalities[1]],
    };
    const wrapper = shallowMount(AsterixServiceAndModalitiesTitleListField, {
      props: {
        readonly: false,
        showReference: true,
        referenceValue,
        targetValue,
      },
    });

    const editorComponent = wrapper.findAllComponents({ name: "AsterixServiceAndModalitiesTitleEditor" }).at(0);

    editorComponent?.vm.$emit("update:value", updatedValue);

    expect(wrapper.emitted()["update:value"][0]).toStrictEqual([[updatedValue, targetValue[1]]]);
  });

  test.each([true, false])("it should pass readonly props to editors when %s", (readonly: boolean) => {
    const wrapper = shallowMount(AsterixServiceAndModalitiesTitleListField, {
      props: {
        readonly,
        showReference: true,
        referenceValue,
        targetValue,
      },
    });

    const editorComponents = wrapper.findAllComponents({ name: "AsterixServiceAndModalitiesTitleEditor" });
    expect(editorComponents.every((editor) => editor.props().readonly === readonly)).toBe(true);
  });

  test.each([true, false])("it should pass showReference props to editors when %s", (showReference: boolean) => {
    const wrapper = shallowMount(AsterixServiceAndModalitiesTitleListField, {
      props: {
        readonly: false,
        showReference,
        referenceValue,
        targetValue,
      },
    });

    const editorComponents = wrapper.findAllComponents({ name: "AsterixServiceAndModalitiesTitleEditor" });
    expect(editorComponents.every((editor) => editor.props().showReference === showReference)).toBe(true);
  });

  it("should pass reference-label slot content to editors", async () => {
    const wrapper = mount(AsterixServiceAndModalitiesTitleListField, {
      props: {
        readonly: false,
        showReference: true,
        referenceValue,
        targetValue,
      },
      slots: {
        "reference-label": '<div data-testid="reference-label-slot-content">my reference label</div>',
      },
    });

    const editorComponents = wrapper.findAllComponents({ name: "AsterixServiceAndModalitiesTitleEditor" });
    const referenceLabelSlotsContent = editorComponents.flatMap((editor) =>
      editor.findAll('[data-testid="reference-label-slot-content"]')
    );

    // there is one label for each service + one label for each modality
    expect(referenceLabelSlotsContent.length).toBe(6);
  });

  it("it should pass target-label slot content to editors", () => {
    const wrapper = mount(AsterixServiceAndModalitiesTitleListField, {
      props: {
        readonly: false,
        showReference: true,
        referenceValue,
        targetValue,
      },
      slots: {
        "target-label": '<div data-testid="target-label-slot-content">my reference label</div>',
      },
    });

    const editorComponents = wrapper.findAllComponents({ name: "AsterixServiceAndModalitiesTitleEditor" });
    const targetLabelSlotsContent = editorComponents.flatMap((editor) =>
      editor.findAll('[data-testid="target-label-slot-content"]')
    );

    // there is one label for each service + one label for each modality
    expect(targetLabelSlotsContent.length).toBe(6);
  });
});
