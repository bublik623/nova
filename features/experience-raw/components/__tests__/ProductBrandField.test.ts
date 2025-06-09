import { vi, describe, test, expect } from "vitest";
import ProductBrandField, { ProductBrandFieldProps } from "../ProductBrandField.vue";
import NovaInputRadioGroup from "@/ui-kit/NovaInputRadioGroup/NovaInputRadioGroup.vue";
import { config, mount } from "@vue/test-utils";
import { BRAND_TUI_COLLECTION } from "../../constants";
import NovaTextEditor from "@/ui-kit/NovaTextEditor/NovaTextEditor.vue";

config.global.mocks = {
  $t: (s: string) => s,
};

vi.stubGlobal("useNuxtApp", () => ({
  $t: (s: string) => s,
}));

describe("ProductBrandField", () => {
  const props: ProductBrandFieldProps = {
    productBrand: "Brand",
    options: [
      {
        label: "Brand",
        value: "Brand",
      },
      {
        label: "TUI Collection",
        value: BRAND_TUI_COLLECTION,
      },
    ],
    placeholder: "Brand",
    isReadonly: false,
    bestValueGuaranteed: "lorem",
    createdWithCare: "ipsum",
    exceptionalExperiences: "dolor",
  };

  test("it sets up the radio group props correctly", () => {
    const wrapper = mount(ProductBrandField, {
      props,
    });

    const radioGroup = wrapper.findComponent(NovaInputRadioGroup);

    expect(radioGroup.vm.$props.modelValue).toStrictEqual(props.productBrand);
    expect(radioGroup.vm.$props.options).toStrictEqual(props.options);
    expect(radioGroup.vm.$props["readonlyPlaceholder"]).toStrictEqual(props.placeholder);
    expect(radioGroup.vm.$props["readonly"]).toStrictEqual(props.isReadonly);
  });

  test("it emits the new radio group values correctly", async () => {
    const wrapper = mount(ProductBrandField, {
      props,
    });

    const radioGroup = wrapper.findComponent(NovaInputRadioGroup);

    radioGroup.vm.$emit("update:modelValue", "New Brand");
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted("update:productBrand")).toStrictEqual([["New Brand"]]);
  });

  test("if the product brand is TUI collection, it shows the collection criteria", () => {
    const wrapper = mount(ProductBrandField, {
      props: {
        ...props,
        productBrand: BRAND_TUI_COLLECTION,
      },
    });

    const textAreas = wrapper.findAllComponents(NovaTextEditor);

    expect(textAreas.length).toBe(3);
  });

  test("if the product brand is not TUI collection, it does not show the collection criteria", () => {
    const wrapper = mount(ProductBrandField, {
      props,
    });

    const textAreas = wrapper.findAllComponents(NovaTextEditor);

    expect(textAreas.length).toBe(0);
  });

  test("it emits the updated collection criteria values correctly", async () => {
    const wrapper = mount(ProductBrandField, {
      props: {
        ...props,
        productBrand: BRAND_TUI_COLLECTION,
      },
    });

    const textAreas = wrapper.findAllComponents(NovaTextEditor);

    textAreas[0].vm.$emit("update:modelValue", "New exceptional experiences");
    textAreas[1].vm.$emit("update:modelValue", "New created with care");
    textAreas[2].vm.$emit("update:modelValue", "New best value guaranteed");

    await wrapper.vm.$nextTick();

    expect(wrapper.emitted("update:exceptionalExperiences")).toStrictEqual([["New exceptional experiences"]]);
    expect(wrapper.emitted("update:createdWithCare")).toStrictEqual([["New created with care"]]);
    expect(wrapper.emitted("update:bestValueGuaranteed")).toStrictEqual([["New best value guaranteed"]]);
  });

  test("it does not render inputs in readonly mode", () => {
    const wrapper = mount(ProductBrandField, {
      props: {
        ...props,
        isReadonly: true,
      },
    });

    const radioGroup = wrapper.findComponent(NovaInputRadioGroup);
    const textAreas = wrapper.findAllComponents(NovaTextEditor);

    expect(radioGroup.classes().includes("NovaInputRadioGroupReadonly")).toBe(true);
    expect(textAreas.length).toBe(0);
  });

  test("it does not render inputs in readonly mode with TUI Collection", () => {
    const wrapper = mount(ProductBrandField, {
      props: {
        ...props,
        isReadonly: true,
        productBrand: BRAND_TUI_COLLECTION,
      },
    });

    const radioGroup = wrapper.findComponent(NovaInputRadioGroup);
    const textAreas = wrapper.findAllComponents(NovaTextEditor);

    expect(radioGroup.classes().includes("NovaInputRadioGroupReadonly")).toBe(true);
    expect(textAreas[0].classes().includes("NovaTextEditorReadonly")).toBe(true);
    expect(textAreas[1].classes().includes("NovaTextEditorReadonly")).toBe(true);
    expect(textAreas[2].classes().includes("NovaTextEditorReadonly")).toBe(true);
  });
});
