import { config, mount } from "@vue/test-utils";
import CreatePremadeItem from "../CreatePremadeItem.vue";
import { describe, test, expect, vi } from "vitest";
import NovaSelect from "@/ui-kit/NovaSelect/NovaSelect.vue";

config.global.mocks = {
  $t: (key: string) => key,
};

config.global.stubs = {
  NovaButton: true,
  NovaButtonIcon: true,
};

vi.stubGlobal("useNuxtApp", () => ({
  $t: (s: string) => s,
}));

const notificationStoreMock = {
  addNotification: vi.fn(),
};

vi.mock("@/stores/notifications", () => ({
  useNotifications: () => notificationStoreMock,
}));

const selectors = {
  title: ".title",
  description: ".description",
  addButton: '[data-testid="add-item-button"]',
  saveButton: '[data-testid="save-form-button"]',
  inputField: (index: number) => `#premade-item-input-${index}`,
  deleteField: (index: number) => `[data-testid="premade-item-delete-${index}"]`,
  allInputFields: '[id^="premade-item-input-"]',
  categorySelect: '[data-testid="category-select"]',
};

const categoryOptions = [
  {
    id: "cb0e73bc-e766-4ab2-816a-2aeab3c88123",
    language_code: "se",
    code: "PROMOTIONAL_OPTIONS",
    name: "Promotional Options",
  },
  { id: "ad81464d-37ff-4d87-bf03-35ff31a6780b", language_code: "se", code: "PRODUCT_BRAND", name: "Product brand" },
  { id: "623d894e-972d-4490-98c0-e83331e66205", language_code: "se", code: "FEATURES", name: "Features" },
];

const showModal = true;
const handler = vi.fn();

describe("CreatePremadeItem", () => {
  test("renders the title and description correctly", () => {
    const wrapper = mount(CreatePremadeItem, {
      props: {
        showModal,
        handler,
        categoryOptions: categoryOptions,
        currentCategory: categoryOptions[0],
      },
    });

    expect(wrapper.find(selectors.title).text()).toBe("masterdata.commercial.add-new-item.title");
    expect(wrapper.find(selectors.description).text()).toBe("masterdata.commercial.add-new-item.description");
    expect(wrapper.find(selectors.addButton).attributes().disabled).toBe("true");
    expect(wrapper.find(selectors.saveButton).attributes().disabled).toBe("true");
  });

  test("calls the handleSave method when the save button is clicked", async () => {
    const wrapper = mount(CreatePremadeItem, {
      props: {
        showModal,
        handler,
        categoryOptions: categoryOptions,
        currentCategory: categoryOptions[0],
      },
    });

    wrapper
      .findComponent(NovaSelect)
      .vm.$emit("select:option", { label: categoryOptions[0].name, value: categoryOptions[0].code });

    await wrapper.find(selectors.inputField(0)).setValue("hey!");

    const saveButton = wrapper.find(selectors.saveButton);
    await saveButton.trigger("click");

    expect(handler).toHaveBeenCalledWith(["hey!"], categoryOptions[0].code);
  });
  test("the dropdown should be populated with the current category", async () => {
    const wrapper = mount(CreatePremadeItem, {
      props: {
        showModal,
        handler,
        categoryOptions: categoryOptions,
        currentCategory: categoryOptions[0],
      },
    });

    expect(wrapper.text().includes(categoryOptions[0].name)).toBe(true);
  });
});
