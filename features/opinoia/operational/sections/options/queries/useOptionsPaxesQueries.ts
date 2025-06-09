import { queryOptions, useQueries } from "@tanstack/vue-query";
import { useOfferServiceApi } from "@/composables/useOfferServiceApi";
import { OptionPaxes } from "@/types/generated/OfferServiceApi";

export type PaxesPerOption = { optionId: string; optionPaxes: OptionPaxes };

export function useOptionsPaxesQueries(optionsId: Readonly<Ref<string[]>>) {
  const { getOptionPaxes } = useOfferServiceApi();

  const optionPaxesQueriesDefinition = computed(() => {
    return optionsId.value.map((optionId) =>
      queryOptions({
        queryKey: ["option-paxes", optionId],
        queryFn: async () => await getOptionPaxes(optionId),
        select: (response): PaxesPerOption => ({ optionId, optionPaxes: response.data }),
      })
    );
  });

  return useQueries({ queries: optionPaxesQueriesDefinition });
}
