import { useConfigurationExperienceQuery } from "./queries/useConfigurationExperienceQuery";
import { ConfigurationData, ConfigurationSectionData } from "./types";
import { useExperienceLanguagesQuery } from "./queries/useExperienceLanguagesQuery";
import { AvailableLanguage } from "@/types/Language";
import { mapMasterdataLanguagesToOptions } from "@/features/experience-calendar/utils/option-language-utils";
import { LanguageOption } from "@/features/experience-calendar/components/OptionLanguagesDropdown.vue";
import { useRefundPoliciesStore } from "@/features/experience-shared/stores/useRefundPoliciesStore";
import { usePaxesStore } from "@/features/experience-raw/stores/usePaxesStore";

export function useLastSavedConfigurationSectionData(experienceId: Readonly<Ref<string>>) {
  const experienceQuery = useConfigurationExperienceQuery(experienceId);
  // be careful: the paxesStore gets the experience ID from route.params.id, not explicitly as other stores/queries
  const paxesStore = usePaxesStore();
  const languageQuery = useExperienceLanguagesQuery(experienceId);
  const refundPoliciesStore = useRefundPoliciesStore();

  watch(experienceId, (value) => {
    if (value) {
      refundPoliciesStore.loadRefundPolicies(value);
    }
  });

  const experienceLanguagesOptions = computed<LanguageOption[]>(() => {
    const languageSet = new Set<AvailableLanguage>(languageQuery.data.value?.languages as AvailableLanguage[]);
    return mapMasterdataLanguagesToOptions(languageSet);
  });

  watch(experienceId, (value) => {
    if (value) {
      refundPoliciesStore.loadRefundPolicies(value);
    }
  });

  const isLoading = computed(() => {
    return (
      experienceQuery.isFetching.value ||
      paxesStore.isLoading ||
      languageQuery.isFetching.value ||
      refundPoliciesStore.isLoading
    );
  });

  const configuration = computed<ConfigurationData>(() => {
    return {
      experienceCode: { value: experienceQuery.data.value?.code || "" },
      paxes: { value: paxesStore.fields.paxes.value },
      languages: { value: experienceLanguagesOptions.value },
      refundPolicies: { value: refundPoliciesStore.field.value },
    };
  });

  const configurationSectionData = computed<ConfigurationSectionData>(() => ({
    configuration: configuration.value,
  }));

  return {
    isLoading,
    data: configurationSectionData,
  };
}
