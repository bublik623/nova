import { DocumentSidebarSection } from "@/features/opinoia/shared/ExperienceSidebar/types";
import { useConfigurationSection } from "../useConfigurationSection";
import { computed, Ref } from "vue";
import { fieldValidator } from "@/utils/field-validator";
import { storeToRefs } from "pinia";

export function useSidebarConfigurationSection(
  experienceId: Readonly<Ref<string>>
): Readonly<Ref<DocumentSidebarSection>> {
  const configurationStore = useConfigurationSection();
  const { workingCopyData } = storeToRefs(configurationStore);

  const sidebarConfiguration = computed<DocumentSidebarSection>(() => {
    const fields = [
      {
        key: "experience_code",
        isRequired: true,
        isValid: fieldValidator(workingCopyData.value.configuration.experienceCode),
        isHidden: false,
      },
      {
        key: "cancellation_policy",
        isRequired: true,
        isValid: fieldValidator(workingCopyData.value.configuration.refundPolicies),
        isHidden: false,
      },
      {
        key: "languages",
        isRequired: false,
        isValid: fieldValidator(workingCopyData.value.configuration.languages),
        isHidden: false,
      },
      {
        key: "pax_types",
        isRequired: true,
        isValid: fieldValidator(workingCopyData.value.configuration.paxes),
        isHidden: false,
      },
    ];

    const allRequiredValid = fields.filter((f) => f.isRequired).every((f) => f.isValid);

    return {
      key: "configuration",
      url: `/opinoia/${experienceId.value}/operational/configuration`,
      isRequired: true,
      isValid: allRequiredValid,
      icon: "configuration",
      fields,
      showFields: true,
    };
  });

  return sidebarConfiguration;
}
