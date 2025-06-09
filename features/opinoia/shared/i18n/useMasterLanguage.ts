import { AvailableLanguage } from "@/types/Language";

let masterLanguage: Readonly<Ref<AvailableLanguage>> | undefined;

export function useMasterLanguage(): Readonly<Ref<AvailableLanguage>> {
  masterLanguage = masterLanguage ?? computed<AvailableLanguage>(() => "en");

  return masterLanguage;
}
