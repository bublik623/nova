import { describe, it, expect, beforeEach, vi, MockedFunction } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useDistributionContentStore } from "../useDistributionContentStore";
import { useRoute } from "vue-router";
import { useDistributionContentQuery } from "@/features/experience-raw/queries/distribution-content-query";
import { useDistributionContentMutation } from "@/features/experience-raw/queries/distribution-content-mutation";
import { updateSupplierIdForPickups } from "@/features/experience-shared/utils/update-supplier-id";

vi.mock("vue-router", () => ({
  useRoute: vi.fn(),
}));

vi.mock("@/features/experience-raw/queries/distribution-content-query", () => ({
  useDistributionContentQuery: vi.fn(),
}));

vi.mock("@/features/experience-raw/queries/distribution-content-mutation", () => ({
  useDistributionContentMutation: vi.fn(),
}));

vi.mock("@/features/experience-shared/utils/update-supplier-id", () => ({
  updateSupplierIdForPickups: vi.fn(),
}));

describe("useDistributionContentStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  const useRouteMock = useRoute as MockedFunction<any>;
  const useDistributionContentQueryMock = useDistributionContentQuery as MockedFunction<any>;
  const useDistributionContentMutationMock = useDistributionContentMutation as MockedFunction<any>;

  it("the store has the correct default values when invoked", () => {
    useRouteMock.mockReturnValue({ params: { id: "123" } });
    useDistributionContentQueryMock.mockReturnValue({ data: { value: { id: "123", experience_source: "source" } } });
    useDistributionContentMutationMock.mockReturnValue({ isPending: { value: false } });

    const store = useDistributionContentStore();

    expect(store.values.supplier_id).toBe(undefined);
    expect(store.productType).toBe("source");
  });

  it("the currentSupplier computed function is updated correctly when updating a supplier in the field", () => {
    useRouteMock.mockReturnValue({ params: { id: "123" } });
    useDistributionContentQueryMock.mockReturnValue({ data: { value: { id: "123", experience_source: "source" } } });
    useDistributionContentMutationMock.mockReturnValue({ isPending: { value: false } });

    const store = useDistributionContentStore();
    store.values.supplier_id = "supplier1";
  });

  it("it invokes the correct mutation and endpoints when saving", async () => {
    const mockId = "123";
    useRouteMock.mockReturnValue({ params: { id: mockId } });
    useDistributionContentQueryMock.mockReturnValue({ data: { value: { id: "123", experience_source: "source" } } });
    useDistributionContentMutationMock.mockReturnValue({ isPending: { value: false }, mutateAsync: vi.fn() });

    const store = useDistributionContentStore();
    store.values.supplier_id = "supplier1";

    await store.save();

    expect(useDistributionContentMutation().mutateAsync).toHaveBeenCalledWith({
      id: mockId,
      supplier_id: "supplier1",
    });
    expect(updateSupplierIdForPickups).toHaveBeenCalledWith("123", "supplier1");
  });

  it("throws error if experienceId is missing", async () => {
    useRouteMock.mockReturnValue({ params: { id: "123" } });
    useDistributionContentQueryMock.mockReturnValue({ data: { value: { experience_source: "source" } } });
    useDistributionContentMutationMock.mockReturnValue({ isPending: { value: false }, mutateAsync: vi.fn() });

    const store = useDistributionContentStore();
    store.values.supplier_id = "supplier1";

    await expect(store.save()).rejects.toThrow("experienceId is required");
  });

  it('resets correctly when calling "reset"', () => {
    useDistributionContentQueryMock.mockReturnValue({ data: { value: { supplier_id: "supplier1" } } });

    const store = useDistributionContentStore();
    store.values.supplier_id = "supplier2";

    store.$reset();

    expect(store.values.supplier_id).toBe("supplier1");
  });

  it("should be enabled", () => {
    const store = useDistributionContentStore();

    expect(store.enabled).toBe(true);
  });
});
