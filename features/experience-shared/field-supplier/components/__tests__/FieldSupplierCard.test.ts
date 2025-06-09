import { describe, expect, vi, it } from "vitest";
import * as useSupplierFieldObj from "../../composables/useSupplierField";
import { config, shallowMount } from "@vue/test-utils";
import FieldSupplierCard from "../FieldSupplierCard.vue";
import FieldSupplierSearch from "../FieldSupplierSearch.vue";

vi.mock("#app", () => ({
  useNuxtApp: () => ({
    $t: (text: string) => text,
  }),
}));

config.global.mocks = {
  $t: (key: string) => key,
};

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

describe("FieldSupplierCard", () => {
  const defaultProps = {
    inputId: "test-input",
    modelValue: "",
    readonly: false,
    disabled: false,
  };

  it("renders correctly with initial props", () => {
    const wrapper = shallowMount(FieldSupplierCard, {
      props: defaultProps,
    });

    expect(wrapper.find('[data-testid="field-supplier-name"]').exists()).toBe(true);
    expect(wrapper.findComponent(FieldSupplierSearch).exists()).toBe(false);
  });

  it("toggles edit mode when edit button is clicked", async () => {
    const wrapper = shallowMount(FieldSupplierCard, {
      props: defaultProps,
    });

    const editButton = wrapper.find('[data-testid="field-supplier-edit-btn"]');
    await editButton.trigger("click");

    expect(wrapper.vm.isEditing).toBe(true);
    expect(wrapper.findComponent(FieldSupplierSearch).exists()).toBe(true);
  });

  it("disables edit button when readonly or disabled", async () => {
    const wrapper = shallowMount(FieldSupplierCard, {
      props: {
        ...defaultProps,
        readonly: true,
      },
    });

    expect(wrapper.find('[data-testid="field-supplier-edit-btn"]').exists()).toBe(false);

    await wrapper.setProps({ readonly: false, disabled: true });
    expect(wrapper.find('[data-testid="field-supplier-edit-btn"]').exists()).toBe(false);
  });

  it("it selects the supplier correctly", async () => {
    const wrapper = shallowMount(FieldSupplierCard, {
      props: defaultProps,
    });

    // // Set isEditing to true to show the FieldSupplierSearch component
    wrapper.vm.isEditing = true;
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.supplierId).toBeFalsy();

    // Find the FieldSupplierSearch component and emit the update:modelValue event
    const supplierSearch = wrapper.findComponent(FieldSupplierSearch);
    supplierSearch.vm.$emit("update:modelValue", "1");

    // Verify that supplierId is updated
    expect(wrapper.vm.supplierId).toBe("1");
  });

  it("it emits the correct supplier on save", async () => {
    const wrapper = shallowMount(FieldSupplierCard, {
      props: defaultProps,
    });

    // Set isEditing to true to show the FieldSupplierSearch component
    wrapper.vm.isEditing = true;
    await wrapper.vm.$nextTick();

    // Find the FieldSupplierSearch component and emit the update:modelValue event
    const supplierSearch = wrapper.findComponent(FieldSupplierSearch);
    supplierSearch.vm.$emit("update:modelValue", "1");

    // Find the save button and emit the click event
    const saveButton = wrapper.find('[data-testid="field-supplier-save-selection-btn"]');
    await saveButton.trigger("click");

    // Verify that the update:modelValue event was emitted with the correct supplier
    expect(wrapper.emitted("update:modelValue")![0]).toEqual(["1"]);
  });

  it("resets supplier selection and toggles edit mode when cancel button is clicked", async () => {
    const wrapper = shallowMount(FieldSupplierCard, {
      props: defaultProps,
    });

    wrapper.vm.isEditing = true;
    wrapper.vm.supplierId = "1";
    await wrapper.vm.$nextTick();

    const cancelButton = wrapper.find('[data-testid="field-supplier-cancel-btn"]');
    await cancelButton.trigger("click");

    expect(wrapper.vm.supplierId).toBe("");
    expect(wrapper.vm.isEditing).toBe(false);
  });

  it("emits update:modelValue event and toggles edit mode when save button is clicked", async () => {
    const wrapper = shallowMount(FieldSupplierCard, {
      props: defaultProps,
    });

    wrapper.vm.isEditing = true;
    wrapper.vm.supplierId = "1";
    await wrapper.vm.$nextTick();

    const saveButton = wrapper.find('[data-testid="field-supplier-save-selection-btn"]');
    await saveButton.trigger("click");

    expect(wrapper.emitted("update:modelValue")).toBeTruthy();
    expect(wrapper.emitted("update:modelValue")![0]).toEqual(["1"]);
    expect(wrapper.vm.isEditing).toBe(false);
  });

  it("displays no results message when no supplier is selected", () => {
    const wrapper = shallowMount(FieldSupplierCard, {
      props: defaultProps,
    });

    expect(wrapper.find('[data-testid="field-supplier-no-results"]').exists()).toBe(true);
  });
});
