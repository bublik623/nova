import { DocumentContentType, ExperienceFlowCode, ExperienceStatusCode } from "@/types/DocumentStatuses";
import { MediaSnapshot, RawSnapshot, TranslationSnapshot } from "@/types/generated/ExperienceRawServiceApi";
import { Snapshot } from "@/types/Snapshots";
import { useExperienceRawApi } from "@/composables/useExperienceRawApi";
import { computedAsync } from "@vueuse/core";
import { defineStore } from "pinia";
import { AvailableLanguage } from "@/types/Language";

export type VersionInfo = {
  snapshotId: string;
  authorName: string;
  date: string;
  flowCode: ExperienceFlowCode;
  statusCode?: ExperienceStatusCode;
  options?: {
    shouldDisplayBadge: boolean;
  };
};

export type VersionHistory = {
  versions: VersionInfo[];
};

export const useVersionHistoryStore = defineStore("versionHistoryStore", () => {
  const { getAllRawSnapshots, getAllTranslationSnapshots, getAllMediaSnapshots } = useExperienceRawApi();

  const experienceIdRef = ref<string | undefined>();
  const experienceFlowRef = ref<DocumentContentType | undefined>();
  const experienceLanguageRef = ref<AvailableLanguage>("en");

  const isFetchingRef = ref(false);

  const history = computedAsync(
    async () => {
      if (!experienceFlowRef.value || !experienceIdRef.value) {
        return undefined;
      }

      const endpointForContentType = getVersionHistoryByContentType(experienceFlowRef.value);
      const result = await endpointForContentType(experienceIdRef.value);

      return {
        versions: withBadgeVisibility(result.versions),
      };
    },
    undefined,
    isFetchingRef
  );

  async function setExperienceId(experienceId: string) {
    experienceIdRef.value = experienceId;
  }

  async function setFlow(flow: DocumentContentType) {
    experienceFlowRef.value = flow;
  }

  async function setLanguage(language: AvailableLanguage) {
    experienceLanguageRef.value = language;
  }

  function getRawVersionHistory(experienceId: string): Promise<VersionHistory> {
    return getAllRawSnapshots(experienceId).then(mapRawSnapshotsToVersionHistory);
  }

  function mapRawSnapshotsToVersionHistory(value: { data: RawSnapshot[] }): VersionHistory {
    return {
      versions: value.data.map((snapshot) => ({
        snapshotId: snapshot.id!,
        authorName: snapshot.user_version!,
        date: snapshot.snapshot_date!,
        flowCode: snapshot.raw!.flow_code,
        statusCode: snapshot.raw!.status_code,
      })),
    };
  }

  function getTranslationVersionHistory(experienceId: string): Promise<VersionHistory> {
    return getAllTranslationSnapshots(experienceId, experienceLanguageRef.value).then((value) =>
      mapTranslationSnapshotsToVersionHistory(value)
    );
  }

  function getMediaVersionHistory(experienceId: string): Promise<VersionHistory> {
    return getAllMediaSnapshots(experienceId).then((value) => mapMediaSnapshotsToVersionHistory(value));
  }

  /**
   * @note The "curation" document is the english translation in the content command service
   */
  function mapTranslationSnapshotsToVersionHistory(value: { data: Snapshot[] }): VersionHistory {
    return {
      versions: value.data.map(mapSnapshot),
    };

    function mapSnapshot(snapshot: TranslationSnapshot): VersionInfo {
      const flowCode = snapshot?.flow_code! as ExperienceFlowCode;
      const statusCode = snapshot?.status_code! as ExperienceStatusCode;

      return {
        snapshotId: snapshot.id!,
        authorName: snapshot.user_version!,
        date: snapshot.creation_date!,
        flowCode,
        statusCode,
      };
    }
  }

  function mapMediaSnapshotsToVersionHistory(value: { data: MediaSnapshot[] }): VersionHistory {
    return {
      versions: value.data.map(mapSnapshot),
    };

    function mapSnapshot(snapshot: MediaSnapshot): VersionInfo {
      const flowCode = snapshot.media?.flow_code!;
      const statusCode = snapshot.media?.status_code!;

      return {
        snapshotId: snapshot.id!,
        authorName: snapshot.user_version!,
        date: snapshot.creation_date!,
        flowCode,
        statusCode,
      };
    }
  }

  function getVersionHistoryByContentType(
    documentFlow: DocumentContentType
  ): (experienceId: string) => Promise<VersionHistory> {
    switch (documentFlow) {
      case DocumentContentType.RAW:
        return getRawVersionHistory;
      case DocumentContentType.EDITORIAL:
        return getTranslationVersionHistory;
      case DocumentContentType.TRANSLATION:
        return getTranslationVersionHistory;
      case DocumentContentType.MEDIA:
        return getMediaVersionHistory;
    }
  }

  function withBadgeVisibility(items: VersionInfo[]): VersionInfo[] {
    const set = getBadgeVisibility(items);

    return items.map((item) => ({
      ...item,
      options: {
        ...item.options,
        shouldDisplayBadge: set.has(item.snapshotId),
      },
    }));
  }

  return {
    experienceId: experienceIdRef,
    experienceFlow: experienceFlowRef,
    experienceLanguage: experienceLanguageRef,
    isFetching: isFetchingRef,
    setExperienceId,
    setFlow,
    setLanguage,
    history,
  };
});

/**
 * @description determines which items in an array should display the UP_TO_DATE badge
 * @param items a generic array of items (VersionInfo, RevisionValues) with an id and a statusCode
 * @returns a set of ids which should display the badge
 */
export function getBadgeVisibility(items: VersionInfo[]) {
  const set = new Set<string>();

  const currentSnapshot = items[0];
  const latestPublishedVersion = items.find((version) => version.statusCode === "UP_TO_DATE");

  if (latestPublishedVersion) {
    set.add(latestPublishedVersion.snapshotId);
  }

  if (currentSnapshot) {
    set.add(currentSnapshot.snapshotId);
  }

  return set;
}
