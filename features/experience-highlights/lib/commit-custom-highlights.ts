import { HighlightsKey, GenericHighlight } from "@/types/Highlights";
import { handleHighlightActions } from "./handle-highlights-action";
import { useContentCommandApi } from "@/composables/useContentCommandApi";
import { ExperienceFlowCode, ExperienceStatusCode } from "@/types/DocumentStatuses";

export type CustomHighlightOptions = {
  curationFlowCode: ExperienceFlowCode;
  toBeEditedStatusCode: ExperienceStatusCode;
};
/**
 * @description creates the required promises to CRUD the given highlights in the backend
 */
export function commitCustomHighlights(
  experienceId: string,
  key: HighlightsKey,
  items: GenericHighlight[],
  { curationFlowCode, toBeEditedStatusCode }: CustomHighlightOptions
) {
  const api = useContentCommandApi();
  const actions = handleHighlightActions(experienceId, key, items, {
    curationFlowCode,
    toBeEditedStatusCode,
  });

  const promises = actions.flatMap(({ id, action, endpoint, item }) => {
    let promise: Promise<unknown> | [] = [];
    switch (action) {
      case "post":
        if (item != null) {
          promise = api.postCustomHighlight(endpoint, item);
        }
        break;

      case "put":
        if (item != null) {
          promise = api.putCustomHighlight(`${endpoint}/${id}`, item);
        }
        break;

      case "del":
        promise = api.deleteCustomHighlight(`${endpoint}/${id}`);

        break;
    }

    return promise;
  });

  return promises;
}
