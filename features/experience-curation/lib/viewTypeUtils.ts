import { usePermissionsStore } from "@/features/roles/stores/usePermissionsStore";
import { ViewType } from "../components/ViewSelect.vue";

export const VIEW_TYPE_ALL: ViewType = "all";
export const VIEW_TYPE_COMMERCIAL: ViewType = "commercial";
const NOVA_COPYWRITER_ROLE = "nova_copywriter";

export function viewIsTypeAll(view: string) {
  return view === VIEW_TYPE_ALL;
}

export function viewIsTypeCommercial(view: string) {
  return view === VIEW_TYPE_COMMERCIAL;
}

function userIsCopywriterOnly() {
  const permissionStore = usePermissionsStore();
  return permissionStore.currentRoles[0] === NOVA_COPYWRITER_ROLE;
}

export function userShouldDefaultToCommercialView() {
  // We default to the commercial view if they ONLY have the nova_copywriter role
  return userIsCopywriterOnly();
}

export function areNonCommercialFieldsEditableForUser() {
  return !userIsCopywriterOnly();
}
