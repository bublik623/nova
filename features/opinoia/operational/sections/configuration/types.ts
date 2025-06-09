import { LanguageOption } from "@/features/experience-calendar/components/OptionLanguagesDropdown.vue";
import { Pax } from "@/types/generated/OfferServiceApi";
import { ManageableRefundPolicy } from "@/features/experience-shared/stores/useRefundPoliciesStore";
import { FormField } from "@/types/Form";

export type ConfigurationData = {
  experienceCode: FormField<string, true>;
  paxes: FormField<Pax[], true>;
  languages: FormField<LanguageOption[], true>;
  refundPolicies: FormField<ManageableRefundPolicy[], true>;
};

export type ConfigurationSectionData = {
  configuration: ConfigurationData;
};
export type ConfigKeysConfiguration = keyof ConfigurationData;
