import { Ref, computed } from "vue";

import { usePaxesStore } from "@/features/experience-raw/stores/usePaxesStore";
import { useUpdateExperienceCodeMutation } from "./mutations/useUpdateExperienceCodeMutation";
import { useUpdateLanguagesMutation } from "./mutations/useUpdateLanguagesMutation";
import { ConfigKeysConfiguration, ConfigurationSectionData } from "./types";
import { useRefundPoliciesStore } from "@/features/experience-shared/stores/useRefundPoliciesStore";
import { getChangedKeys } from "@/features/core-shared/utils/get-changed-keys/getChangedKeys";

type SaveFn = (data: ConfigurationSectionData) => Promise<void>;

export function useConfigurationSectionSaveOperation(experienceId: Readonly<Ref<string>>) {
  const updateExperienceCodeMutation = useUpdateExperienceCodeMutation(experienceId);
  const updateLanguagesMutation = useUpdateLanguagesMutation(experienceId);
  const paxesStore = usePaxesStore();
  const refundPoliciesStore = useRefundPoliciesStore();

  const isSaving = computed(
    () =>
      updateExperienceCodeMutation.isPending.value ||
      updateLanguagesMutation.isPending.value ||
      paxesStore.isSaving ||
      refundPoliciesStore.isSaving
  );

  async function saveCode({ configuration: { experienceCode } }: ConfigurationSectionData) {
    await updateExperienceCodeMutation.mutateAsync(experienceCode.value);
  }

  async function saveLanguages({ configuration: { languages } }: ConfigurationSectionData) {
    await updateLanguagesMutation.mutateAsync(languages.value);
  }

  async function savePaxes({ configuration: { paxes } }: ConfigurationSectionData) {
    paxesStore.setPaxes(paxes.value);
    paxesStore.setHasChanges(true);
    await paxesStore.save();
  }

  async function saveRefundPolicies({ configuration: { refundPolicies } }: ConfigurationSectionData) {
    refundPoliciesStore.field.value = refundPolicies.value;
    await refundPoliciesStore.saveRefundPolicies();
  }

  const saveOperations: Record<ConfigKeysConfiguration, SaveFn> = {
    experienceCode: saveCode,
    languages: saveLanguages,
    paxes: savePaxes,
    refundPolicies: saveRefundPolicies,
  };

  async function save(last: ConfigurationSectionData, current: ConfigurationSectionData) {
    const oldConfig = last.configuration;
    const newConfig = current.configuration;
    const changedFields = getChangedKeys(oldConfig, newConfig);

    if (changedFields.length === 0) {
      return;
    }

    await Promise.all(changedFields.map((field) => saveOperations[field](current)));
  }

  return {
    isSaving,
    save,
  };
}
