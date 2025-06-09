import { useMasterData } from "@/stores/master-data";
import { AvailableLanguage } from "@/types/Language";

// While the backend does not have the automatic translation feature, we return all the available languages as manual languages
export function getMasterdataManagementLanguages() {
  const { availableLanguages } = useMasterData();

  const manualLanguages = Array.from(availableLanguages).filter((language) => language !== "en");

  const automaticLanguages: AvailableLanguage[] = [];

  return { manualLanguages, automaticLanguages };
}

// Once the backend has the automatic translation feature, we will return the available languages as manual languages and the automatic translation languages as automatic languages
function _getMasterdataManagementLanguages() {
  const { availableLanguages, automaticTranslationLanguages } = useMasterData();

  const manualLanguages = Array.from(availableLanguages).filter(
    (language) => language !== "en" || automaticTranslationLanguages.has(language)
  );

  const automaticLanguages = Array.from(automaticTranslationLanguages);

  return { manualLanguages, automaticLanguages };
}
