import { useAsyncModal } from "@/features/core-shared/composables/useAsyncModal";
import UpdateTranslationDialog, { ValidDialogActions } from "../components/UpdateTranslationDialog.vue";
import EditItemDialog from "../components/EditItemDialog.vue";
import { useNotifications } from "@/stores/notifications";
import { useExperienceMasterDataApi } from "@/composables/useExperienceMasterDataApi";
import { useRoute, useRouter } from "vue-router";
import { useMasterData } from "@/stores/master-data";

export const useCommercialContentItem = () => {
  const notification = useNotifications();
  const masterdataApi = useExperienceMasterDataApi();
  const route = useRoute();
  const router = useRouter();
  const masterdataStore = useMasterData();

  const showNotification = (message: string, theme: "success" | "error") => {
    notification.addNotification({ type: "toast", message, theme });
  };

  const updateMasterData = async (
    endpoint: ExperienceMasterDataEndpoint,
    data: ExperienceMasterDataItem,
    successMessage: string,
    errorMessage: string
  ) => {
    try {
      await masterdataApi.updatePremade(endpoint, data);
      await refreshNuxtData();
      showNotification(successMessage, "success");
    } catch (error) {
      showNotification(errorMessage, "error");
      throw error;
    }
  };

  const handleTranslation = async (opt: {
    action: ValidDialogActions;
    translation: ExperienceMasterDataItem;
    mainTranslation: ExperienceMasterDataItem | undefined;
  }) => {
    if (!opt.mainTranslation) {
      console.warn("no en translation exist for this item");
      return;
    }

    const modal = useAsyncModal(UpdateTranslationDialog);
    await modal.openModal({
      handler: async (translationToUpdate: ExperienceMasterDataItem, newValue: string) => {
        await updateMasterData(
          route.params.endpoint as ExperienceMasterDataEndpoint,
          { ...translationToUpdate, name: newValue },
          "notifications.success.updating.masterdata.translation",
          "notifications.error.updating.masterdata.translation"
        );
      },
      mainTranslation: opt.mainTranslation,
      translationToUpdate: opt.translation,
      action: opt.action,
    });
  };

  async function handleUpdateItemNameAndCategory(itemToUpdate?: ExperienceMasterDataItem) {
    if (!itemToUpdate) {
      console.warn("no entity exist for this item.");
      return;
    }

    const categoryList = [...masterdataStore.hierarchicalGroups.values()].map(({ name, code }) => ({
      label: name,
      value: code,
    }));

    const modal = useAsyncModal(EditItemDialog);
    await modal.openModal({
      handler: async (translationToUpdate: ExperienceMasterDataItem, newItemName: string, newCategoryCode: string) => {
        const baseUrl = `/masterdata-management/commercial-content/${route.params.endpoint}`;
        await updateMasterData(
          route.params.endpoint as ExperienceMasterDataEndpoint,
          { ...translationToUpdate, name: newItemName, hierarchical_group_code: newCategoryCode },
          "notifications.success.updating.masterdata.item",
          "notifications.error.updating.masterdata.item"
        );
        await router.push({ path: `${baseUrl}/${newCategoryCode}/${translationToUpdate.code}` });
      },
      itemToUpdate,
      categoryList,
    });
  }

  return { handleUpdateItemNameAndCategory, handleTranslation };
};
