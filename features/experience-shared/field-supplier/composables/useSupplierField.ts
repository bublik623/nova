import { useSuppliersMasterdataQuery } from "@/features/experience-masterdata/queries/suppliers-masterdata-query";
import { Supplier } from "@/types/generated/ContractMasterDataApi";
import { Option } from "@/types/Option";

export function useSupplierField(initialValue?: string) {
  const searchRef = ref<string | undefined>();
  const supplierId = ref<string | undefined>(initialValue);

  const selectedSupplier = computed(() => supplierMasterdata.data.value?.find((s) => s.id === supplierId.value));

  const supplierMasterdata = useSuppliersMasterdataQuery();

  const suppliersList = computed<Option[]>(() =>
    filterSuppliersList(supplierMasterdata.data.value, searchRef.value).map(mapSupplierToOption)
  );

  return {
    selectedSupplier,
    supplierId,
    selectSupplier,
    suppliersList,
    suppliersListIsLoading: supplierMasterdata.isLoading,
    searchRef,
  };

  function selectSupplier(id: string) {
    supplierId.value = id;
    searchRef.value = selectedSupplier.value?.name;
  }
}

function mapSupplierToOption(supplier: Supplier): Option {
  return {
    value: supplier.id!,
    label: supplier.name,
  };
}

function filterSuppliersList(suppliers: Supplier[] | undefined, searchValue: string | undefined) {
  const lowerCaseSearchValue = searchValue?.toLowerCase() || "";
  return suppliers?.filter(({ name }) => name.toLowerCase().includes(lowerCaseSearchValue)) ?? [];
}
