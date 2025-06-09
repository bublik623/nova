import { ExperienceMasterDataItem } from "@/composables/useExperienceMasterDataApi";

export const UNCATEGORIZED_HIERARCHICAL_GROUP_KEY = "UNCATEGORIZED";
export const UNCATEGORIZED_HIERARCHICAL_GROUP_NAME = "Uncategorized";

export function mapHighlightsToGroups(items: ExperienceMasterDataItem[]): Map<string, ExperienceMasterDataItem[]> {
  if (items.length === 0) {
    return new Map([[UNCATEGORIZED_HIERARCHICAL_GROUP_KEY, []]]);
  }

  const groups = new Map<string, ExperienceMasterDataItem[]>();

  for (const item of items) {
    const group = item?.hierarchical_group_code ?? UNCATEGORIZED_HIERARCHICAL_GROUP_KEY;
    const groupItems = groups.get(group) ?? [];
    groupItems.push(item);
    groups.set(group, groupItems);
  }

  return groups;
}
