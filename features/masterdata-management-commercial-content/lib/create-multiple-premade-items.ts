import {
  ExperienceMasterDataEndpoint,
  PremadeItemCreate,
  useExperienceMasterDataApi,
} from "@/composables/useExperienceMasterDataApi";
import { generateUUID } from "@datadog/browser-core";
import { getMasterdataManagementLanguages } from "./get-masterdata-management-languages";

export async function createMultiplePremadeItems(
  endpoint: string,
  items: string[],
  categoryCode: string
): Promise<string[]> {
  const masterdata = useExperienceMasterDataApi();

  const { manualLanguages, automaticLanguages } = getMasterdataManagementLanguages();

  const premadeItems: PremadeItemCreate[] = items.map((name) => ({
    code: generateUUID(),
    language_code: "en",
    hierarchical_group_code: categoryCode,
    name,
  }));

  await masterdata.createMultipleItemsV2(endpoint as ExperienceMasterDataEndpoint, {
    items: premadeItems,
    manual_languages: manualLanguages,
    automatic_languages: automaticLanguages,
  });

  return premadeItems.map((item) => item.code);
}
