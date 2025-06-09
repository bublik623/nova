import { useContractMasterDataApi } from "@/features/experience-masterdata/api/useContractMasterDataApi";
import { useQuery } from "@tanstack/vue-query";

export function useSuppliersMasterdataQuery() {
  const contractMasterDataApi = useContractMasterDataApi();
  return useQuery({
    queryKey: ["suppliers-masterdata"],
    queryFn: () => contractMasterDataApi.getSuppliers(),
    select: ({ data }) => data,
  });
}
