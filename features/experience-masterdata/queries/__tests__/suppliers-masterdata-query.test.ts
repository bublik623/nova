import { describe, expect, test, vi } from "vitest";
import { config, shallowMount } from "@vue/test-utils";
import { QueryClient } from "@tanstack/vue-query";
import { useSuppliersMasterdataQuery } from "../suppliers-masterdata-query";

config.global.provide.VUE_QUERY_CLIENT = new QueryClient();

const mockUseContractMasterDataApi = {
  getSuppliers: vi.fn(),
};

vi.mock("@/features/experience-masterdata/api/useContractMasterDataApi", () => ({
  useContractMasterDataApi: () => mockUseContractMasterDataApi,
}));

describe("suppliersMasterdataQuery", () => {
  test("It should call the api with the correct parameters", () => {
    // https://test-utils.vuejs.org/guide/advanced/reusability-composition#Testing-composables
    const TestComponent = defineComponent({
      setup: () => useSuppliersMasterdataQuery(),
      template: "<div></div>",
    });

    shallowMount(TestComponent);

    expect(mockUseContractMasterDataApi.getSuppliers).toHaveBeenCalled();
  });
});
