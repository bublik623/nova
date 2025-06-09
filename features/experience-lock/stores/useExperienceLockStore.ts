import { useFeatureFlag } from "@/features/experience-shared/composables/useFeatureFlag";
import { getLockByActivityLogs } from "../libs/get-lock-by-activity-logs";
import { defineStore, acceptHMRUpdate } from "pinia";

export type LockKey = keyof typeof locksHandler;
export type LockResult = { locked: false } | { locked: true; message: string };

const locksHandler = {
  "experience.activity-cooldown.raw": () => {
    return getLockByActivityLogs(["BASE"]);
  },
  "experience.activity-cooldown.editorial": () => {
    return getLockByActivityLogs(["AUTOTRANSLATION", "MANUAL_TRANSLATION", "CURATION", "MEDIA"]);
  },
} satisfies Record<string, () => LockResult>;

export const useExperienceLockStore = defineStore("useExperienceLockStore", () => {
  const locks = computed(() => {
    const map = new Map<LockKey, string | undefined>();

    if (!useFeatureFlag("enable_experience_locks")) {
      // eslint-disable-next-line no-console
      console.warn("[FEATURE FLAG] Experience locks are disabled");
      return map;
    }

    for (const lockType in locksHandler) {
      const handler = locksHandler[lockType as LockKey];
      const result = handler();

      if (result.locked) {
        map.set(lockType as LockKey, result.message);
      }
    }

    return map;
  });

  return {
    locks,
    getOne,
  };

  function getOne(key: LockKey): LockResult {
    return {
      locked: locks.value.has(key),
      message: locks.value.get(key) || "",
    };
  }
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useExperienceLockStore, import.meta.hot));
}
