import { datadogRum } from "@datadog/browser-rum";
import { UserAction, UserFlow } from "@/types/Datadog";

const errorMsg: Record<UserFlow, string> = {
  "load-experiences": "Error while loading experiences",
  "master-data": "Error while fetching the master data",
  "load-raw": "Error while loading raw experience",
  "create-raw": "Error while creating raw experience",
  "update-raw": "Error while saving raw experience",
  "delete-raw": "Error while deleting raw experience",
  "publish-raw": "Error while sending raw experience to review",
  "load-curation": "Error while loading curation content",
  "update-curation": "Error while saving curation content",
  "publish-curation": "Error while publishing curation content",
  "create-translation": "Error while creating translation",
  "update-translation": "Error while saving translation",
  "publish-translation": "Error while publishing translation",
  "load-translation": "Error while loading translation",
  "load-media": "Error while loading media",
  "upload-media": "Error while uploading media",
  "delete-media": "Error while deleting media",
  "update-media": "Error while saving media",
  "publish-media": "Error while publishing media",
  "load-option": "Error while loading option",
  "create-option": "Error while creating option",
  "update-option": "Error while saving option",
  "update-agenda-slot-capacity": "Error while updating agenda slot capacity",
  "toggle-agenda-slot": "Error while toggling agenda slot",
  "load-activity-log": "Error while loading activity log change logs",
  "load-i18n": "Error while loading i18n bundle",
  "create-premade-item": "Error while creating premade item",
  "create-premade-category": "Error while creating premade category",
  "update-masterdata-translation": "Error while updating masterdata translation",
  "get-distribution-content": "Error while fetching distribution content",
  "advanced-search-result-translation-missing": "Translation missing for the results of the advanced search",
  "load-revision": "Error while loading revision",
  "load-raw-asterix-service-and-modalities": "Error while loading Asterix Service and Modalities in Raw",
  "roles-no-such-role": "No such role",
  "load-allotments": "Error while loading allotments",
};

export function useLogger() {
  function logError(flow: UserFlow, originalError?: unknown) {
    datadogRum.addError(new Error(errorMsg[flow] ?? "Unknown error"), {
      originalError,
    });
  }

  function logAction(name: UserAction, context: object) {
    datadogRum.addAction(name, context);
  }

  return {
    logError,
    logAction,
  };
}
