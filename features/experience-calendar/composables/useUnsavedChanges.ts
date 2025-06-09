import { useAsyncConfirmModal } from "@/features/core-shared/composables/useAsyncConfirmModal";
import { RouteLocationNormalized } from "vue-router";

export function useUnsavedChanges(props: {
  cancelCallback?: () => Promise<void>;
  confirmCallback: () => Promise<void>;
}) {
  const { $t } = useNuxtApp();
  const hasUnsavedChanges = ref(false);

  onBeforeRouteUpdate(requireUserChoice);
  onBeforeRouteLeave(requireUserChoice);

  async function requireUserChoice(to: RouteLocationNormalized, from: RouteLocationNormalized) {
    // we do not want to trigger the modal when only the route's path change.
    // otherwise even a querystring change would trigger the modal
    if (from.path === to.path) {
      return;
    }

    if (!hasUnsavedChanges.value) {
      return;
    }

    const { openModal } = useAsyncConfirmModal({
      ctaCancelText: $t("modal.experience.exit.btn.no-save"),
      ctaConfirmText: $t("modal.experience.exit.btn.save"),
      description: $t("modal.experience.exit.description.save-changes"),
      title: $t("modal.experience.exit.title.save"),
    });

    const confirmSave = await openModal();
    if (confirmSave) {
      await props.confirmCallback();
    } else {
      await props?.cancelCallback?.();
    }
  }

  return {
    hasUnsavedChanges,
  };
}
