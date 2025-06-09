import { useActivityLogStore } from "@/features/experience-activity-log/stores/useActivityLogStore";
import { ExperienceFlowCode } from "@/types/DocumentStatuses";
import { LATEST_ACTIVITY_COOLDOWN_TIME } from "../constants";
import { LockResult } from "../stores/useExperienceLockStore";
import { useAuthStore } from "@/features/auth/useAuthStore";
import { useNuxtApp } from "#app";

export function getLockByActivityLogs(codes: ExperienceFlowCode[]): LockResult {
  const { $t } = useNuxtApp();

  const store = useActivityLogStore();
  const auth = useAuthStore();

  const currentUser = auth.userName || "";

  const selectedLogs = store.getBySelectedCodes(codes);

  if (!selectedLogs.lastActivity) {
    return {
      locked: false,
    };
  }

  const isLocked = isActivityInCooldownWindow() && !isActivityFromCurrentUser(currentUser);

  if (isLocked) {
    const userWorking = $t("experience.locks.warn-concurrent-users", {
      placeholders: { user: selectedLogs.lastActivity.user },
    });

    return {
      locked: true,
      message: userWorking,
    };
  }

  return {
    locked: false,
  };

  function isActivityFromCurrentUser(user: string) {
    return selectedLogs.lastActivity?.user === user;
  }

  function isActivityInCooldownWindow(): boolean {
    const now = new Date();
    const date = new Date(selectedLogs.lastActivity?.action_date || "");

    const timeDifference = now.getTime() - date.getTime();

    return timeDifference < LATEST_ACTIVITY_COOLDOWN_TIME;
  }
}
