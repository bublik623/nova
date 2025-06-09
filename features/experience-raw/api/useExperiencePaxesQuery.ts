import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { useOfferServiceApi } from "@/composables/useOfferServiceApi";
import type { Pax } from "@/types/generated/OfferServiceApi";

export const EXPERIENCE_PAXES_QUERIES = {
  getExperiencePaxes: (experienceId: Ref<string>) => ["experience-paxes", experienceId],
};

export function useGetExperiencePaxesQuery(experienceId: Ref<string>) {
  const { getExperiencePaxes } = useOfferServiceApi();

  return useQuery({
    queryKey: EXPERIENCE_PAXES_QUERIES.getExperiencePaxes(experienceId),
    queryFn: () => getExperiencePaxes(experienceId.value),
    select: ({ data }) => data.pax_list || [],
    enabled: computed(() => !!experienceId.value),
  });
}

export function useUpdateExperiencePaxesMutation(experienceId: Ref<string>) {
  const { updateExperiencePaxes } = useOfferServiceApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paxList: Pax[]) => {
      const { data } = await updateExperiencePaxes({
        experience_id: experienceId.value,
        pax_list: paxList,
      });
      return data;
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: EXPERIENCE_PAXES_QUERIES.getExperiencePaxes(experienceId),
      });
    },
  });
}
