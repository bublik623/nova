import { mount } from "@vue/test-utils";
import { describe, expect, it, test, vi } from "vitest";
import AsterixServiceAndModalitiesTitleEditor from "../AsterixServiceAndModalitiesTitleEditor.vue";
import { ServiceAndModalitiesTitleValue } from "@/features/experience-shared/asterix-integration/asterix-service-and-modalities-titles/types/service-and-modalities-title-list-value";

vi.stubGlobal("useNuxtApp", () => ({
  $t: (s: string) => s,
}));

const referenceValue: ServiceAndModalitiesTitleValue = {
  serviceCode: "SVC-1",
  title: "SVC-1 reference title",
  modalities: [
    { modalityCode: "MOD-1", title: "MOD-1 reference title" },
    { modalityCode: "MOD-2", title: "MOD-2 reference title" },
  ],
};

const targetValue: ServiceAndModalitiesTitleValue = {
  serviceCode: "SVC-1",
  title: "SVC-1 title",
  modalities: [
    { modalityCode: "MOD-1", title: "MOD-1 title" },
    { modalityCode: "MOD-2", title: "MOD-2 title" },
  ],
};

describe("AsterixServiceAndModalitiesTitleEditor", () => {
  it("should render one AsterixTitleEditor for the service title", () => {
    const wrapper = mount(AsterixServiceAndModalitiesTitleEditor, {
      props: {
        showReference: false,
        readonly: false,
        referenceValue,
        targetValue,
      },
    });

    const allTitleEditors = wrapper.findAllComponents({ name: "AsterixTitleEditor" });
    const serviceTitleEditors = allTitleEditors.filter((editor) => editor.props().id === "service-SVC-1");

    expect(serviceTitleEditors.length).toBe(1);
    expect(serviceTitleEditors[0].props()).toEqual(
      expect.objectContaining({
        referenceValue: referenceValue.title,
        targetValue: targetValue.title,
      })
    );
  });

  it("should render one AsterixTitleEditor for each modalities' title", () => {
    const wrapper = mount(AsterixServiceAndModalitiesTitleEditor, {
      props: {
        showReference: false,
        readonly: false,
        referenceValue,
        targetValue,
      },
    });

    const allTitleEditors = wrapper.findAllComponents({ name: "AsterixTitleEditor" });
    const mod1Editor = allTitleEditors.filter((editor) => editor.props().id === "modality-MOD-1");
    const mod2Editor = allTitleEditors.filter((editor) => editor.props().id === "modality-MOD-2");

    expect(mod1Editor.length).toBe(1);
    expect(mod1Editor[0].props()).toEqual(
      expect.objectContaining({
        referenceValue: referenceValue.modalities[0].title,
        targetValue: targetValue.modalities[0].title,
      })
    );
    expect(mod2Editor.length).toBe(1);
    expect(mod2Editor[0].props()).toEqual(
      expect.objectContaining({
        referenceValue: referenceValue.modalities[1].title,
        targetValue: targetValue.modalities[1].title,
      })
    );
  });

  it("should set a max length of 70 for all titles", () => {
    const wrapper = mount(AsterixServiceAndModalitiesTitleEditor, {
      props: {
        showReference: false,
        readonly: false,
        referenceValue,
        targetValue,
      },
    });

    const allTitleEditors = wrapper.findAllComponents({ name: "AsterixTitleEditor" });

    expect(allTitleEditors.every((editor) => editor.props().maxLength === 70)).toBe(true);
  });

  it("should emit update:serviceTitle when the service title is updated", async () => {
    const wrapper = mount(AsterixServiceAndModalitiesTitleEditor, {
      props: {
        readonly: false,
        showReference: true,
        referenceValue,
        targetValue,
      },
    });

    const serviceTitleEditorComponent = wrapper.findAllComponents({ name: "AsterixTitleEditor" }).at(0);

    serviceTitleEditorComponent?.vm.$emit("update:target-value", "new service title");

    expect(wrapper.emitted()["update:value"][0]).toStrictEqual([
      {
        ...targetValue,
        title: "new service title",
      },
    ]);
  });

  it("should emit update:modalityTitle when a modality title is updated", () => {
    const wrapper = mount(AsterixServiceAndModalitiesTitleEditor, {
      props: {
        readonly: false,
        showReference: true,
        referenceValue,
        targetValue,
      },
    });

    const mod1TitleEditorComponent = wrapper.findAllComponents({ name: "AsterixTitleEditor" }).at(1);

    mod1TitleEditorComponent?.vm.$emit("update:target-value", "new modality title");

    expect(wrapper.emitted()["update:value"][0]).toStrictEqual([
      {
        ...targetValue,
        modalities: [{ ...targetValue.modalities[0], title: "new modality title" }, targetValue.modalities[1]],
      },
    ]);
  });

  test.each([true, false])("it should pass readonly props to editors when %s", (readonly: boolean) => {
    const wrapper = mount(AsterixServiceAndModalitiesTitleEditor, {
      props: {
        readonly,
        showReference: true,
        referenceValue,
        targetValue,
      },
    });

    const editorComponents = wrapper.findAllComponents({ name: "AsterixTitleEditor" });
    expect(editorComponents.every((editor) => editor.props().readonly === readonly)).toBe(true);
  });

  test.each([true, false])("it should pass showReference props to editors when %s", (showReference: boolean) => {
    const wrapper = mount(AsterixServiceAndModalitiesTitleEditor, {
      props: {
        readonly: false,
        showReference,
        referenceValue,
        targetValue,
      },
    });

    const editorComponents = wrapper.findAllComponents({ name: "AsterixTitleEditor" });
    expect(editorComponents.every((editor) => editor.props().showReference === showReference)).toBe(true);
  });

  it("should pass reference-label slot content to editors", async () => {
    const wrapper = mount(AsterixServiceAndModalitiesTitleEditor, {
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

    const editorComponents = wrapper.findAllComponents({ name: "AsterixTitleEditor" });
    const referenceLabelSlotsContent = editorComponents.flatMap((editor) =>
      editor.findAll('[data-testid="reference-label-slot-content"]')
    );

    // there is one label for the service + one label for each modality
    expect(referenceLabelSlotsContent.length).toBe(3);
  });

  it("should pass target-label slot content to editors", () => {
    const wrapper = mount(AsterixServiceAndModalitiesTitleEditor, {
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

    const editorComponents = wrapper.findAllComponents({ name: "AsterixTitleEditor" });
    const targetLabelSlotsContent = editorComponents.flatMap((editor) =>
      editor.findAll('[data-testid="target-label-slot-content"]')
    );

    // there is one label for the service + one label for each modality
    expect(targetLabelSlotsContent.length).toBe(3);
  });
});
