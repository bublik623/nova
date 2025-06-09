import { HierarchicalGroupCreate, useExperienceMasterDataApi } from "@/composables/useExperienceMasterDataApi";
import { generateUUID } from "@datadog/browser-core";
import { createMultiplePremadeItems } from "./create-multiple-premade-items";
import { getMasterdataManagementLanguages } from "./get-masterdata-management-languages";

export async function createPremadeCategory(endpoint: string, categoryName: string, items: string[]): Promise<string> {
  const masterdata = useExperienceMasterDataApi();
  const category: HierarchicalGroupCreate = {
    code: generateUUID(),
    language_code: "en",
    name: categoryName,
  };

  const { manualLanguages, automaticLanguages } = getMasterdataManagementLanguages();

  await masterdata.createHierarchicalGroupV2({
    group: category,
    automatic_languages: automaticLanguages,
    manual_languages: manualLanguages,
  });

  await createMultiplePremadeItems(endpoint, items, category.code);

  return category.code;
}
