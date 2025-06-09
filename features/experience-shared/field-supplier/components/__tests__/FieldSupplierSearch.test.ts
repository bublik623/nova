import { config, shallowMount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import * as useSupplierFieldObj from "../../composables/useSupplierField";
import NovaInputText from "@/ui-kit/NovaInputText/NovaInputText.vue";
import NovaDropdown from "@/ui-kit/NovaDropdown/NovaDropdown.vue";
import FieldSupplierSearch from "../FieldSupplierSearch.vue";

const useSupplierFieldSpy = vi.spyOn(useSupplierFieldObj, "useSupplierField");

const useSupplierFieldMock = {
  suppliersList: computed(() => [
    {
      value: "1",
      label: "Supplier 1",
    },
    {
      value: "2",
      label: "Supplier 2",
    },
    {
      value: "3",
      label: "Supplier 3",
    },
  ]),
  suppliersListIsLoading: computed(() => false),
  selectedSupplier: computed(() => undefined),
  supplierId: ref(""),
  searchRef: ref(""),
  selectSupplier: vi.fn(),
};

useSupplierFieldSpy.mockImplementation(() => useSupplierFieldMock);

config.global.mocks = {
  $t: (key: string) => key,
};

config.global.stubs = {
  NovaDropdown: {
    template: `<div><slot name='toggle'/> </div>`,
  },
};

vi.mock("#app", () => ({
  useNuxtApp: () => ({
    $t: (text: string) => text,
  }),
}));

describe("FieldSupplierSearch.vue", () => {
  it("when the input is clicked, the dropdown appears", async () => {
    const wrapper = shallowMount(FieldSupplierSearch, {
      props: {
        inputId: "test-input",
        modelValue: "",
        readonly: false,
        disabled: false,
      },
    });
    expect(wrapper.vm.isDropdownOpen).toBe(false);

    await wrapper.findComponent(NovaInputText).trigger("click");

    expect(wrapper.vm.isDropdownOpen).toBe(true);
  });

  it("if an option is selected, it selects a supplier", async () => {
    const wrapper = shallowMount(FieldSupplierSearch, {
      props: {
        inputId: "test-input",
        modelValue: "",
        readonly: false,
        disabled: false,
      },
    });

    wrapper.vm.isDropdownOpen = true;

    // @ts-expect-error ...
    await wrapper.findComponent(NovaDropdown).vm.$emit("select:option", {
      value: "1",
      label: "Supplier 1",
    });

    expect(wrapper.vm.isDropdownOpen).toBe(false);

    expect(useSupplierFieldMock.selectSupplier).toHaveBeenCalledWith("1");

    // The implementation of supplierId is mocked, so we only check if the event was emitted
    expect(wrapper.emitted("update:modelValue")).toBeTruthy();
  });

  it('it emits the correct supplier id when the "update:modelValue" event is emitted', async () => {
    const wrapper = shallowMount(FieldSupplierSearch, {
      props: {
        inputId: "test-input",
        modelValue: "",
        readonly: false,
        disabled: false,
      },
    });

    // This is the value that will be emitted when the event is triggered
    useSupplierFieldMock.supplierId.value = "2";

    // @ts-expect-error ...
    await wrapper.findComponent(NovaDropdown).vm.$emit("select:option", {
      value: "Any value, it just needs to trigger the event",
      label: "Supplier 1",
    });

    expect(wrapper.emitted("update:modelValue")).toMatchInlineSnapshot(`
      [
        [
          "2",
        ],
      ]
    `);
  });

  it("if the input is cleared, the supplier is deselected", async () => {
    const wrapper = shallowMount(FieldSupplierSearch, {
      props: {
        inputId: "test-input",
        modelValue: "",
        readonly: false,
        disabled: false,
      },
    });

    wrapper.findComponent(NovaInputText).vm.$emit("clear");

    // The emitted value is an empty string
    expect(wrapper.emitted("update:modelValue")).toMatchInlineSnapshot(`
      [
        [
          "",
        ],
      ]
    `);
  });

  it("if the component is readonly, it renders correctly", async () => {
    const wrapper = shallowMount(FieldSupplierSearch, {
      props: {
        inputId: "test-input",
        modelValue: "",
        readonly: true,
        disabled: false,
      },
    });

    expect(wrapper.findComponent(NovaInputText).props("readonly")).toBe(true);
  });
});
