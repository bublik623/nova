import { vi, describe, test, expect, beforeEach } from "vitest";
import { mount, config, flushPromises, ComponentMountingOptions } from "@vue/test-utils";
import CreateExperienceButton from "../CreateExperienceButton.vue";
import { mockUseRuntimeConfig } from "@/__mocks__/useRuntimeConfig";
import { Supplier } from "@/types/generated/ContractMasterDataApi";
import { testId } from "@/utils/test.utils";
import { UseContractMasterDataApi } from "@/features/experience-masterdata/api/useContractMasterDataApi";
import FieldSupplierSearch from "@/features/experience-shared/field-supplier/components/FieldSupplierSearch.vue";

const mockRouter = {
  push: vi.fn(),
};

vi.stubGlobal("useRouter", () => mockRouter);
vi.stubGlobal("useRuntimeConfig", mockUseRuntimeConfig);

config.global.mocks = {
  $t: (s: string) => s,
};

const notificationStoreMock = {
  addNotification: vi.fn(),
};

const mockExperienceRawApi = {
  createDistributionContent: vi.fn(async () => ({
    data: "new-experience-id",
  })),
  createExperienceRaw: vi.fn(async () => ({
    data: "new-raw-id",
  })),
};

const mockContractMasterDataApi = {
  getSuppliers: vi.fn(),
} satisfies Partial<UseContractMasterDataApi>;

vi.mock("@/stores/notifications", () => ({
  useNotifications: () => notificationStoreMock,
}));
import { SupplierWithoutEventsError } from "@/composables/useExperienceRawApi";
import { hasPermission } from "@/features/roles/lib/has-permission";

vi.mock("@/composables/useExperienceRawApi", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    // @ts-expect-error ...
    ...actual,
    useExperienceRawApi: () => mockExperienceRawApi,
  };
});

vi.mock("@/features/experience-masterdata/api/useContractMasterDataApi", () => ({
  useContractMasterDataApi: () => mockContractMasterDataApi,
}));
vi.mock("#app", () => ({
  useNuxtApp: () => ({
    $t: (text: string) => text,
  }),
}));

const selectors = {
  dashboardBtn: testId("dashboard-new-experience-btn"),
  fieldTitle: testId("modal-create-experience-input-text"),
  fieldProductType: testId("select-button"),
  createButton: testId("modal-create-experience-create-button"),
  cancelButton: testId("modal-create-experience-cancel-button"),
};

const mockSuppliers: Supplier[] = [
  {
    id: "example-supplier-id",
    source: "NOVA",
    name: "Example Supplier",
    email: "test@domain.com",
    commission: 0,
  },
];
const useLazyAsyncDataMock = vi.fn(() => ({ data: mockSuppliers, execute: vi.fn() }));
vi.stubGlobal("useLazyAsyncData", useLazyAsyncDataMock);

const RenderWithSuspense = defineComponent({
  components: { CreateExperienceButton },
  template: "<Suspense><CreateExperienceButton /></Suspense>",
});

const hasPermissionMock = hasPermission as Mock;
vi.mock("@/features/roles/lib/has-permission");
hasPermissionMock.mockReturnValue(true);

describe("CreateExperienceButton", () => {
  let wrapper: ReturnType<typeof render>;

  function render(options: ComponentMountingOptions<typeof CreateExperienceButton> = {}) {
    const results = mount(RenderWithSuspense, {
      ...options,
      global: {
        stubs: {
          FieldSupplierSearch: true,
        },
      },
    });
    wrapper = results;
    return results; // for type inference
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("it should render correctly", async () => {
    render();
    await flushPromises();

    expect(wrapper.find(selectors.dashboardBtn).isVisible()).toBeTruthy();
  });

  test("if you click on the button the modal should appear", async () => {
    render();
    await flushPromises();

    await wrapper.find(selectors.dashboardBtn).trigger("click");
    expect(wrapper.find(selectors.fieldTitle).isVisible()).toBeTruthy();
    expect(wrapper.find(selectors.createButton).isVisible()).toBeTruthy();
    expect(wrapper.find(selectors.cancelButton).isVisible()).toBeTruthy();

    // check if the modal disappear by clicking the "cancel" button
    await wrapper.find(selectors.cancelButton).trigger("click");

    expect(wrapper.find(selectors.fieldTitle).exists()).toBeFalsy();
    expect(wrapper.find(selectors.cancelButton).exists()).toBeFalsy();
    expect(wrapper.find(selectors.createButton).exists()).toBeFalsy();
  });

  test("the 'create' button should be disabled when title is empty", async () => {
    render();
    await flushPromises();

    await wrapper.find(selectors.dashboardBtn).trigger("click");

    // select the test supplier
    wrapper.findComponent(FieldSupplierSearch).vm.$emit("update:modelValue", mockSuppliers[0].id);
    expect(wrapper.find(selectors.createButton).attributes("disabled")).toBe("");

    // select the product type
    await wrapper.find(selectors.fieldProductType).trigger("click");
    await wrapper.find(testId("options-list-list-item-NOVA")).trigger("click");
    expect(wrapper.find(selectors.createButton).attributes("disabled")).toBe("");
  });

  test("the 'create' button should be disabled when supplier is empty", async () => {
    render();
    await flushPromises();

    await wrapper.find(selectors.dashboardBtn).trigger("click");

    // select the product type
    await wrapper.find(selectors.fieldProductType).trigger("click");
    await wrapper.find(testId("options-list-list-item-NOVA")).trigger("click");
    expect(wrapper.find(selectors.createButton).attributes("disabled")).toBe("");

    // fill the title text input
    await wrapper.find(selectors.fieldTitle).setValue("test value");
    expect(wrapper.find(selectors.createButton).attributes("disabled")).toBe("");
  });

  test("the 'create' button should be disabled when product type is empty", async () => {
    render();
    await flushPromises();

    await wrapper.find(selectors.dashboardBtn).trigger("click");

    // fill the title text input
    await wrapper.find(selectors.fieldTitle).setValue("test value");
    expect(wrapper.find(selectors.createButton).attributes("disabled")).toBe("");

    // select the test supplier
    wrapper.findComponent(FieldSupplierSearch).vm.$emit("update:modelValue", mockSuppliers[0].id);
    expect(wrapper.find(selectors.createButton).attributes("disabled")).toBe("");

    // select the product type
    await wrapper.find(selectors.fieldProductType).trigger("click");
    await wrapper.find(testId("options-list-list-item-NOVA")).trigger("click");
    expect(wrapper.find(selectors.createButton).attributes("disabled")).toBe(undefined);
  });

  test("the 'create' button should be enabled when all the fields are filled", async () => {
    render();
    await flushPromises();

    await wrapper.find(selectors.dashboardBtn).trigger("click");

    // fill the title text input
    await wrapper.find(selectors.fieldTitle).setValue("test value");
    expect(wrapper.find(selectors.createButton).attributes("disabled")).toBe("");

    // select the test supplier
    wrapper.findComponent(FieldSupplierSearch).vm.$emit("update:modelValue", mockSuppliers[0].id);
    expect(wrapper.find(selectors.createButton).attributes("disabled")).toBe("");
  });

  test("if you fill the input text and press 'create' it should create a new experience", async () => {
    render();
    await flushPromises();

    await wrapper.find(selectors.dashboardBtn).trigger("click");
    await wrapper.find(selectors.fieldTitle).setValue("new experience title");
    wrapper.findComponent(FieldSupplierSearch).vm.$emit("update:modelValue", mockSuppliers[0].id);
    await wrapper.find(selectors.fieldProductType).trigger("click");

    // select the test supplier
    wrapper.findComponent(FieldSupplierSearch).vm.$emit("update:modelValue", mockSuppliers[0].id);

    // select the product type
    await wrapper.find(testId("options-list-list-item-NOVA")).trigger("click");

    await wrapper.find(selectors.createButton).trigger("click");

    await flushPromises();

    // check if we are redirected to the right route
    expect(mockRouter.push).toHaveBeenCalledWith({
      name: "experience-id-raw-settings",
      params: {
        id: "new-experience-id",
        section: undefined,
      },
    });

    expect(mockExperienceRawApi.createDistributionContent).toHaveBeenCalledWith({
      supplier_id: "example-supplier-id",
      experience_source: "NOVA",
    });
    expect(mockExperienceRawApi.createExperienceRaw).toHaveBeenCalledWith("new-experience-id", "new experience title");

    // check the notification
    expect(notificationStoreMock.addNotification).toHaveBeenCalledWith({
      theme: "success",
      message: "notifications.success.creating.document",
    });
  });

  test("the supplier not valid banner should not be visible initially", async () => {
    render();
    await flushPromises();

    await wrapper.find(selectors.dashboardBtn).trigger("click");

    const banner = wrapper.find('[data-testid="experience-supplier-not-valid-banner"]');
    expect(banner.exists()).toBe(false);
  });

  test("the supplier not valid banner should appear if supplier is not valid", async () => {
    mockExperienceRawApi.createDistributionContent.mockRejectedValueOnce(new SupplierWithoutEventsError());
    render();
    await flushPromises();

    await wrapper.find(selectors.dashboardBtn).trigger("click");
    await wrapper.find(selectors.fieldTitle).setValue("test title");
    wrapper.findComponent(FieldSupplierSearch).vm.$emit("update:modelValue", mockSuppliers[0].id);
    await wrapper.find(selectors.fieldProductType).trigger("click");
    await wrapper.find(testId("options-list-list-item-SIP")).trigger("click");

    await wrapper.find(selectors.createButton).trigger("click");

    const banner = wrapper.find('[data-testid="experience-supplier-not-valid-banner"]');
    await nextTick();
    expect(banner.exists()).toBe(true);
    expect(banner.text()).toContain("experience.supplier_not_valid.banner");
  });

  test("the supplier not valid banner should disappear when modal is reopened", async () => {
    render();
    await flushPromises();

    await wrapper.find(selectors.dashboardBtn).trigger("click");
    mockExperienceRawApi.createDistributionContent.mockRejectedValueOnce(new SupplierWithoutEventsError());

    await wrapper.find(selectors.fieldTitle).setValue("test title");
    wrapper.findComponent(FieldSupplierSearch).vm.$emit("update:modelValue", mockSuppliers[0].id);
    await wrapper.find(selectors.fieldProductType).trigger("click");
    await wrapper.find(testId("options-list-list-item-NOVA")).trigger("click");

    await wrapper.find(selectors.createButton).trigger("click");

    await flushPromises();

    const banner = wrapper.find('[data-testid="experience-supplier-not-valid-banner"]');
    expect(banner.exists()).toBe(true);

    await wrapper.find(selectors.cancelButton).trigger("click");
    await wrapper.find(selectors.dashboardBtn).trigger("click");

    const bannerAfterReopen = wrapper.find('[data-testid="experience-supplier-not-valid-banner"]');
    expect(bannerAfterReopen.exists()).toBe(false);
  });

  test("if the user can create a new OPINOIA exp, it should see it in the list", async () => {
    hasPermissionMock.mockReturnValue(true);
    render();
    await flushPromises();

    await wrapper.find(selectors.dashboardBtn).trigger("click");

    // select the product type
    await wrapper.find(selectors.fieldProductType).trigger("click");

    expect(wrapper.find(testId("options-list-list-item-INTERNAL")).exists()).toBe(true);
  });

  test("if the user cannot create a new OPINOIA exp, it should not see it in the list", async () => {
    hasPermissionMock.mockReturnValue(false);
    render();
    await flushPromises();

    await wrapper.find(selectors.dashboardBtn).trigger("click");

    // select the product type
    await wrapper.find(selectors.fieldProductType).trigger("click");

    expect(wrapper.find(testId("options-list-list-item-INTERNAL")).exists()).toBe(false);
  });
});
