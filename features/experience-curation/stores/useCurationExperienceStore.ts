import { hasPermission } from "@/features/roles/lib/has-permission";
import { useRouteQuery } from "@vueuse/router";
import { defineStore } from "pinia";
import { ViewType } from "../components/ViewSelect.vue";
import { userShouldDefaultToCommercialView, VIEW_TYPE_ALL, VIEW_TYPE_COMMERCIAL } from "../lib/viewTypeUtils";

export const useCurationExperienceStore = defineStore("useCurationExperienceStore", () => {
  const isReadonly = !hasPermission("experience.curation.canWrite");
  const showRawFields = ref(true);
  const selectedView = useRouteQuery<ViewType>("view", VIEW_TYPE_ALL);
  const isCommercialView = computed(() => selectedView.value === VIEW_TYPE_COMMERCIAL);

  setCommercialViewIfNecessary();

  return {
    isReadonly,
    showRawFields,
    selectedView,
    isCommercialView,
  };

  function setCommercialViewIfNecessary() {
    if (userShouldDefaultToCommercialView()) {
      selectedView.value = VIEW_TYPE_COMMERCIAL;
    }
  }
});
