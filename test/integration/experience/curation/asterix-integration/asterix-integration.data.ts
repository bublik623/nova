import { OptionTranslation, ServiceCodeTranslation } from "@/types/generated/ContentCommandApi";
import { AsxExperience, ModalityCodes } from "@/types/generated/ExperienceRawServiceApi";

export const serviceCodeTranslations: Array<ServiceCodeTranslation> = [
  {
    id: "service-translation-1",
    experience_id: "exp-id",
    code: "SVC-1",
    language_code: "en",
    name: "SVC-1 title",
    flow_code: "MANUAL_TRANSLATION",
    status_code: "TO_BE_EDIT",
    to_be_translated: false,
  },
];
export const modalitiesTranslations: Array<OptionTranslation> = [
  {
    id: "modality-translation-1",
    experience_id: "exp-id",
    asx_service_code_translation_id: "service-translation-1",
    asx_modality_code: "MOD-1",
    language_code: "en",
    name: "MOD-1 title",
    flow_code: "MANUAL_TRANSLATION",
    status_code: "TO_BE_EDIT",
    to_be_translated: false,
  },
];
export const asterixServices: Array<AsxExperience> = [
  {
    code: "SVC-1",
    default_name: "default SVC-1 title",
  },
];
export const asterixModalities: Array<ModalityCodes> = [
  {
    code: "MOD-1",
    default_name: "default MOD-1 title",
  },
];
