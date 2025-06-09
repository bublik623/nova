import { useOptionsQuery } from "../queries/useOptionsQuery";
import { PaxesPerOption, useOptionsPaxesQueries } from "../queries/useOptionsPaxesQueries";
import { Option, OptionsSectionData } from "../types";
import { convertDurationToHours } from "@/utils/convert-duration";

export function useLastSavedOptionsSectionData(experienceId: Readonly<Ref<string | undefined>>) {
  const optionsQuery = useOptionsQuery(experienceId);
  const optionsIds = computed(() => optionsQuery.data.value?.map((option) => option.id!) ?? []);
  const optionsPaxesQueries = useOptionsPaxesQueries(optionsIds);
  const lastSavedOptionsSectionData = ref<OptionsSectionData | undefined>(undefined);
  const isLoading = computed(
    () =>
      optionsQuery.isFetching.value || optionsPaxesQueries.value.some((optionPaxesQuery) => optionPaxesQuery.isFetching)
  );

  const options = computed<Option[] | undefined>(() => {
    if (isLoading.value) {
      return undefined;
    }

    const optionsFromApi = optionsQuery.data.value ?? [];
    const optionsPaxesFromApi = optionsPaxesQueries.value
      .map((paxesPerOption) => paxesPerOption.data)
      .filter((paxes) => !!paxes);

    return optionsFromApi.map(
      (optionFromApi): Option => ({
        id: optionFromApi.id!,
        title: optionFromApi.name,
        code: optionFromApi.code ?? "",
        duration: optionFromApi.duration ? convertDurationToHours(optionFromApi.duration) : undefined,
        subchannels: [],
        paxTypes: getPaxCodeList(optionFromApi.id!, optionsPaxesFromApi),
      })
    );
  });

  /**
   * Updates the last saved data ref once loading is complete.
   */
  watch(
    isLoading,
    (isLoadingNow) => {
      if (isLoadingNow || !options.value) return;

      lastSavedOptionsSectionData.value = {
        options: options.value ?? [],
      };
    },
    { immediate: true }
  );

  return {
    isLoading,
    data: readonly(lastSavedOptionsSectionData),
  };
}

function getPaxCodeList(optionId: string, optionsPaxes: PaxesPerOption[]): string[] | "all" {
  const specificOptionPaxes = optionsPaxes.find((optionPaxes) => optionPaxes.optionId === optionId)?.optionPaxes;

  if (specificOptionPaxes?.pax_list.length === 0) {
    return "all";
  }

  return specificOptionPaxes?.pax_list.map((paxListItem) => paxListItem.pax_code) ?? [];
}
