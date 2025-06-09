import { useLogger } from "@/features/core-shared/composables/useLogger";
import { usePublishModals } from "@/features/experience-shared/composables/usePublishModals";
import { useExperienceCuration } from "@/stores/experience-curation";
import { useNotifications } from "@/stores/notifications";
import { sendToTranslation } from "@/features/experience-curation/lib/sendToTranslation";

export type SaveCurationContentOptions = {
  id: string;
  promise?: () => Promise<void>;
  publish?: boolean;
  afterSaving?: () => void;
  nextSection?: string;
  redirect?: boolean;
  translate?: boolean;
  force?: boolean;
};

export async function saveCurationContent(opt: SaveCurationContentOptions) {
  const { addNotification } = useNotifications();
  const { logError } = useLogger();
  const curationStore = useExperienceCuration();
  const { confirmPublishAction } = usePublishModals();

  if (opt.translate || opt.publish) {
    const { isAccepted, shouldForce } = await confirmPublishAction(opt.id);
    if (shouldForce) {
      opt.force = true;
    }
    if (!isAccepted) {
      return;
    }
  }

  // in order to trigger the event to send to distribution an experience
  // we need to set his status to "in_review" and then to "ready"
  // the translate and publish endpoints are automatically updating the status_code to "ready"
  try {
    curationStore.isSaving = true;
    await opt.promise?.();
    await curationStore.updateCurationDocument(opt.id, opt.publish);

    if (opt.translate) {
      await sendToTranslation(opt.id);
    }
    if (opt.publish) {
      await curationStore.publishCurationExperience(opt.id, opt.force ?? false);
    }
    opt.afterSaving?.();
    addNotification({
      theme: "success",
      message: "notifications.success.saving.document",
    });
  } catch (err) {
    logError(opt.publish ? "publish-curation" : "update-curation", err);
    addNotification({
      theme: "error",
      message: "notifications.error.saving.document",
    });
  } finally {
    curationStore.isSaving = false;
  }
}
