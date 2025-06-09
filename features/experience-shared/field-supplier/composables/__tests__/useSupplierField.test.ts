import { ref } from "vue";
import { describe, it, expect, vi, Mock, beforeEach } from "vitest";
import { useSuppliersMasterdataQuery } from "@/features/experience-masterdata/queries/suppliers-masterdata-query";
import { Supplier } from "@/types/generated/ContractMasterDataApi";
import { useSupplierField } from "../useSupplierField";

// Mock the useSuppliersMasterdataQuery composable
vi.mock("@/features/experience-masterdata/queries/suppliers-masterdata-query", () => ({
  useSuppliersMasterdataQuery: vi.fn(),
}));

describe("useSupplierField", () => {
  const mockSuppliers: Supplier[] = [
    { id: "1", name: "Supplier 1", email: "supplier1" },
    { id: "2", name: "Supplier 2", email: "supplier2" },
  ];

  const mockQuery = {
    data: ref(mockSuppliers),
    isLoading: ref(false),
  };

  beforeEach(() => {
    // Reset the mock implementation before each test
    vi.resetAllMocks();
    (useSuppliersMasterdataQuery as Mock).mockReturnValue(mockQuery);
  });

  it("initializes with the correct values", () => {
    const { supplierId, selectedSupplier, suppliersList, suppliersListIsLoading, searchRef } = useSupplierField("1");

    expect(supplierId.value).toBe("1");
    expect(selectedSupplier.value).toEqual(mockSuppliers[0]);
    expect(suppliersList.value).toHaveLength(2);
    expect(suppliersListIsLoading.value).toBe(false);
    expect(searchRef.value).toBeUndefined();
  });

  it("filters suppliers list based on search value", () => {
    const { suppliersList, searchRef } = useSupplierField();

    searchRef.value = "Supplier 1";
    expect(suppliersList.value).toHaveLength(1);
    expect(suppliersList.value[0].label).toBe("Supplier 1");

    searchRef.value = "Supplier";
    expect(suppliersList.value).toHaveLength(2);
  });

  it("selects a supplier and updates supplierId and searchRef", () => {
    const { supplierId, selectedSupplier, selectSupplier, searchRef } = useSupplierField();

    selectSupplier("2");
    expect(supplierId.value).toBe("2");
    expect(selectedSupplier.value).toEqual(mockSuppliers[1]);
    expect(searchRef.value).toBe("Supplier 2");
  });

  it("handles empty supplier list", () => {
    (useSuppliersMasterdataQuery as Mock).mockReturnValue({
      data: ref([]),
      isLoading: ref(false),
    });

    const { suppliersList } = useSupplierField();
    expect(suppliersList.value).toHaveLength(0);
  });

  it("handles loading state", () => {
    (useSuppliersMasterdataQuery as Mock).mockReturnValue({
      data: ref([]),
      isLoading: ref(true),
    });

    const { suppliersListIsLoading } = useSupplierField();
    expect(suppliersListIsLoading.value).toBe(true);
  });
});
