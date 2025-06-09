import { ExperienceMasterData } from "@/composables/useExperienceMasterDataApi";
import { useMasterData } from "@/stores/master-data";

export function usePremadesFiltering(premades: Ref<ExperienceMasterData | null>, query: Ref<string>) {
  const masterDataStore = useMasterData();

  const matchingItems = computed(() => {
    if (!premades.value) {
      return null;
    }

    if (query.value === "") {
      return premades.value;
    }

    const lowercaseQuery = query.value.toLocaleLowerCase();
    const hierarchicalGroups = Array.from(masterDataStore.hierarchicalGroups.values());
    const codesOfMatchingHierarchicalGroups = hierarchicalGroups
      .filter((group) => group.name.toLocaleLowerCase().includes(lowercaseQuery))
      .map((group) => group.code);

    return premades.value.filter((item) => {
      const groupMatch =
        item.hierarchical_group_code !== undefined &&
        codesOfMatchingHierarchicalGroups.includes(item.hierarchical_group_code);
      const premadeNameMatch = item.name?.toLocaleLowerCase().includes(lowercaseQuery);

      return groupMatch || premadeNameMatch;
    });
  });

  const count = computed(() => matchingItems.value?.length ?? 0);

  return {
    matchingItems,
    count,
  };
}
