import { AvailableLanguage } from "@/types/Language";
import {
  Snapshot,
  TRANSLATION_SNAPSHOT_LIST_QUERY_KEY,
  useTranslationSnapshotListQuery,
} from "../queries/useTranslationSnapshotListQuery";
import { useQueryClient } from "@tanstack/vue-query";

export async function getParentMasterLanguageSnapshot(experienceId: string, snapshotId: string) {
  const queryClient = useQueryClient();
  const experienceIdRef = ref(experienceId);

  const translationSnapshotListQuery = useTranslationSnapshotListQuery(experienceIdRef);

  await queryClient.ensureQueryData({
    queryKey: [TRANSLATION_SNAPSHOT_LIST_QUERY_KEY, experienceIdRef],
  });

  const snapshots = translationSnapshotListQuery.data.value;
  const givenSnapshot = snapshots?.find((snapshot) => snapshot.id === snapshotId);

  if (!givenSnapshot) {
    throw new Error(
      `can't find snapshot '${snapshotId}' of experience '${experienceId}' in result of '${TRANSLATION_SNAPSHOT_LIST_QUERY_KEY}' query`
    );
  }

  return snapshots
    ?.filter(byLanguage("en"))
    .sort(byCreationDateDesc)
    .findLast(createdBefore(givenSnapshot.creation_date));
}

function byCreationDateDesc(a: Snapshot, b: Snapshot): number {
  return a.creation_date.getTime() - b.creation_date.getTime();
}

function byLanguage(language: AvailableLanguage) {
  return (snapshot: Snapshot) =>
    snapshot.experience_commercial_information?.translations?.[0]?.language_code === language;
}

function createdBefore(date: Date) {
  return (snapshot: Snapshot) => snapshot.creation_date.getTime() < date.getTime();
}
