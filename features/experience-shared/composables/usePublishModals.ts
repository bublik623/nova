import { useAsyncConfirmModal } from "@/features/core-shared/composables/useAsyncConfirmModal";
import { useAsyncModal } from "@/features/core-shared/composables/useAsyncModal";
import ModalRepublish from "@/features/experience-shared/components/ModalRepublish.vue";
import { getDistributionState } from "@/features/experience-shared/utils/get-experience-state";

export function usePublishModals() {
  const { $t } = useNuxtApp();
  const modalRepublish = useAsyncModal(ModalRepublish, { closeOnOverlayClick: true });
  const modalPublishNewVersion = useAsyncConfirmModal({
    title: $t("experience.modal.publish_new_version.title"),
    ctaConfirmText: $t("experience.modal.publish_new_version.confirm"),
    ctaCancelText: $t("experience.modal.publish_new_version.cancel"),
    description: $t("experience.modal.publish_new_version.description"),
  });

  async function fetchDistributionState(experienceId: string): Promise<string> {
    const distributionData = useNuxtData(`getDistributionContent-${experienceId}`);
    return getDistributionState(distributionData?.data?.value);
  }

  async function showModalPublishNewVersion() {
    return await modalPublishNewVersion.openModal();
  }

  async function showModalRepublish() {
    const shouldForce = ref(false);
    const isAccepted = await modalRepublish.openModal({
      onSubmit(closeModal: CallableFunction) {
        shouldForce.value = false;
        closeModal();
      },
      onPublish(closeModal: CallableFunction) {
        shouldForce.value = true;
        closeModal();
      },
    });

    return { isAccepted, shouldForce: shouldForce.value };
  }

  async function confirmPublishAction(experienceId: string): Promise<{ isAccepted: boolean; shouldForce?: boolean }> {
    const distributionState = await fetchDistributionState(experienceId);

    switch (distributionState) {
      case "in_review": {
        const isAccepted = await showModalPublishNewVersion();
        return { isAccepted, shouldForce: false };
      }
      case "unpublished": {
        const { isAccepted, shouldForce } = await showModalRepublish();
        return { isAccepted, shouldForce };
      }
      default:
        return { isAccepted: true, shouldForce: false };
    }
  }

  return { confirmPublishAction };
}
