import { shallowMount, config } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import AsterixTitleEditor from "../AsterixTitleEditor.vue";

config.global.mocks = {
  $t: (s: string) => s,
};

const props = {
  id: "id",
  showReference: true,
  referenceValue: "reference title",
  targetValue: "target title",
  readonly: false,
  maxLength: 70,
};

describe("AsterixTitleEditor", () => {
  it("should not display reference label and value when showReference is false", () => {
    const wrapper = shallowMount(AsterixTitleEditor, { props: { ...props, showReference: false } });

    const referenceLabel = wrapper.find('[data-testid="reference-label"]');
    const referenceValue = wrapper.find('[data-testid="reference-value"]');

    expect(referenceLabel.exists()).toBe(false);
    expect(referenceValue.exists()).toBe(false);
  });

  it("should display reference label from reference-label slot when showReference is true", () => {
    const wrapper = shallowMount(AsterixTitleEditor, {
      props: { ...props, showReference: true },
      slots: {
        "reference-label": "my reference label",
      },
    });

    const referenceValue = wrapper.find('[data-testid="reference-label"]');

    expect(referenceValue.text()).toBe("my reference label");
  });

  it("should display reference value from props when showReference is true", () => {
    const wrapper = shallowMount(AsterixTitleEditor, { props: { ...props, showReference: true } });

    const referenceValue = wrapper.find('[data-testid="reference-value"]');

    expect(referenceValue.text()).toBe(props.referenceValue);
  });

  it("should display target label from target-label slot", () => {
    const wrapper = shallowMount(AsterixTitleEditor, {
      props,
      slots: {
        "target-label": "my target label",
      },
    });

    const referenceValue = wrapper.find('[data-testid="target-label"]');

    expect(referenceValue.text()).toBe("my target label");
  });

  it("should render a NovaInputText to allow editing of targetValue", () => {
    const wrapper = shallowMount(AsterixTitleEditor, {
      props,
      slots: {
        "target-label": "my target label",
      },
    });

    const novaInputText = wrapper.findComponent({ name: "NovaInputText" });

    expect(novaInputText.props()).toEqual(expect.objectContaining({ modelValue: props.targetValue }));
  });

  it("should emit update:targetValue event when the NovaInputText value change", () => {
    const wrapper = shallowMount(AsterixTitleEditor, {
      props,
      slots: {
        "target-label": "my target label",
      },
    });

    const novaInputText = wrapper.findComponent({ name: "NovaInputText" });
    novaInputText.vm.$emit("update:model-value", "a new value");

    expect(wrapper.emitted()["update:targetValue"][0]).toStrictEqual(["a new value"]);
  });

  it("input should NOT be in error state when the title is NOT empty", () => {
    const wrapper = shallowMount(AsterixTitleEditor, { props: { ...props } });

    const novaInputText = wrapper.findComponent({ name: "NovaInputText" });
    expect(novaInputText.props().error).toBeUndefined();
  });

  it("input should be in error state when the title is empty", () => {
    const wrapper = shallowMount(AsterixTitleEditor, { props: { ...props, targetValue: "" } });

    const novaInputText = wrapper.findComponent({ name: "NovaInputText" });
    expect(novaInputText.props()).toMatchObject(expect.objectContaining({ error: "experience.title.input.error" }));
  });
});
