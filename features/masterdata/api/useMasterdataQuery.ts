import { useQuery } from "@tanstack/vue-query";
import { useExperienceMasterDataApi } from "@/composables/useExperienceMasterDataApi";
import { Pax } from "@/types/generated/ExperienceMasterDataApi";

export const MASTERDATA_QUERIES = {
  getPax: (paxType: Ref<Pax["type"]>) => ["pax", paxType],
};

export function useGetPaxQuery(paxType: Ref<Pax["type"]>) {
  const { getPax } = useExperienceMasterDataApi();

  return useQuery({
    queryKey: MASTERDATA_QUERIES.getPax(paxType),
    queryFn: () => getPax(paxType.value),
    select: ({ data }) => data,
  });
}
