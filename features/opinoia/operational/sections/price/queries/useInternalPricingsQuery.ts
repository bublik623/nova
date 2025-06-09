import { useOfferServiceApi } from "@/composables/useOfferServiceApi";

export function useInternalPricingsQuery(optionIds: Ref<string[]>) {
  const offerServiceApi = useOfferServiceApi();

  return useQuery({
    queryKey: ["internalPricings", optionIds],
    queryFn: async () => {
      const { data } = await offerServiceApi.getInternalPricings(optionIds.value);
      return data;
    },
    enabled: computed(() => !!optionIds.value?.length),
  });
}
