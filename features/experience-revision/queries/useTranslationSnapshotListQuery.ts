import { useQuery } from "@tanstack/vue-query";
import { Snapshot as ApiSnapshot } from "@/types/Snapshots";
import { useExperienceRawApi } from "@/composables/useExperienceRawApi";

export const TRANSLATION_SNAPSHOT_LIST_QUERY_KEY = "TRANSLATION_SNAPSHOT_LIST_QUERY_KEY";

export type Snapshot = Omit<ApiSnapshot, "creation_date"> & { creation_date: Date };

export function useTranslationSnapshotListQuery(experienceId: Ref<string>) {
  const { getAllSnapshots } = useExperienceRawApi();

  return useQuery({
    queryKey: [TRANSLATION_SNAPSHOT_LIST_QUERY_KEY, experienceId],
    queryFn: async () => await getAllSnapshots(experienceId.value),
    select: (response) => response.data.map(toSnapshot),
  });
}

function toSnapshot(apiSnapshot: ApiSnapshot): Snapshot {
  return { ...apiSnapshot, creation_date: new Date(apiSnapshot.creation_date) };
}
