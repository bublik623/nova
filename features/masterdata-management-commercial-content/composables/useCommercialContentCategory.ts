import { useAsyncModal } from "@/features/core-shared/composables/useAsyncModal";
import UpdateTranslationDialog, { ValidDialogActions } from "../components/UpdateTranslationDialog.vue";
import EditCategoryDialog from "../components/EditCategoryDialog.vue";
import { HierarchicalGroup } from "@/types/generated/ExperienceMasterDataApi";
import { useExperienceMasterDataApi } from "@/composables/useExperienceMasterDataApi";
import { useMasterData } from "@/stores/master-data";
import { useNotifications } from "@/stores/notifications";

export const useCommercialContentCategory = () => {
  const notification = useNotifications();
  const masterdataApi = useExperienceMasterDataApi();
  const masterdataStore = useMasterData();

  async function createUpdateHandler(
    translationToUpdate: HierarchicalGroup,
    newValue: string,
    successMessage: string,
    errorMessage: string
  ) {
    try {
      await masterdataApi.updateHierarchicalGroup({ ...translationToUpdate, name: newValue });
      await Promise.all([refreshNuxtData(), masterdataStore.fetchHierarchicalGroups()]);

      notification.addNotification({
        type: "toast",
        message: successMessage,
        theme: "success",
      });
    } catch (error) {
      notification.addNotification({
        type: "toast",
        message: errorMessage,
        theme: "error",
      });
      throw error;
    }
  }

  async function handleCategoryTranslation(opt: {
    action: ValidDialogActions;
    translation: HierarchicalGroup;
    mainTranslation?: HierarchicalGroup;
  }) {
    if (!opt.mainTranslation) {
      console.warn("no en translation exist for this category. maybe is uncategorized?");
      return;
    }

    const modal = useAsyncModal(UpdateTranslationDialog);
    await modal.openModal({
      handler: async (translationToUpdate: HierarchicalGroup, newTranslation: string) =>
        createUpdateHandler(
          translationToUpdate,
          newTranslation,
          "notifications.success.updating.masterdata.translation",
          "notifications.error.updating.masterdata.translation"
        ),
      mainTranslation: opt.mainTranslation,
      translationToUpdate: opt.translation,
      action: opt.action,
    });
  }

  async function handleEditCategoryName(category?: HierarchicalGroup) {
    if (!category) {
      console.warn("no entity exist for this category. maybe is uncategorized?");
      return;
    }

    const modal = useAsyncModal(EditCategoryDialog);
    await modal.openModal({
      handler: async (category: HierarchicalGroup, newCategoryName: string) =>
        createUpdateHandler(
          category,
          newCategoryName,
          "notifications.success.updating.masterdata.category",
          "notifications.error.updating.masterdata.category"
        ),
      category,
    });
  }

  return { handleCategoryTranslation, handleEditCategoryName };
};
