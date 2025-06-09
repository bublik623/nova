import { CustomHighlightsEndpoint, HighlightsKey, GenericHighlight } from "@/types/Highlights";
import { CustomHighlightOptions } from "./commit-custom-highlights";

interface Action {
  id?: string;
  endpoint: CustomHighlightsEndpoint;
  action: "post" | "put" | "del";
  item?: Omit<GenericHighlight, "id">;
}

/**
 *
 * @param experienceId
 * @param key the store key for the highlights
 * @param items the generic highlights to be handled
 * @returns an array of actions to execute
 * @description converts an array of generic highlights to an array of "actions",
 * containing the necessary data to update the entities in the backend.
 */
export function handleHighlightActions(
  experienceId: string,
  key: HighlightsKey,
  items: GenericHighlight[],
  options: CustomHighlightOptions
) {
  const { curationFlowCode, toBeEditedStatusCode } = options;
  const apiKey = getApiKey(key);

  let order = 0;

  const actions: Action[] = items.flatMap((item) => {
    let action: Action | null = null;

    if (item.name == null || item.name.length === 0) {
      item.action = "NOOP";
    }

    switch (item.action) {
      case undefined:
        // do nothing...
        order++;
        break;

      case "NOOP":
        // do nothing...
        order++;
        break;

      case "EDIT":
        if (item.id) {
          action = {
            id: item.id,
            endpoint: apiKey.custom,
            item: createUpdatedItem(item, order),
            action: "put",
          };
        } else {
          throw new Error("Cannot edit a custom highlight that has no id!");
        }

        order++;

        break;

      case "CREATE":
        action = {
          endpoint: apiKey.custom,
          item: createUpdatedItem(item, order),
          action: "post",
        };
        order++;

        break;

      case "DELETE":
        if (item.id) {
          action = {
            id: item.id,
            endpoint: apiKey.custom,
            action: "del",
          };
        } else {
          throw new Error("Cannot delete a custom highlight that has no id!");
        }

        break;

      case "REMOVE":
        throw new Error(`The REMOVE action must not be processed by the commit function. Id: ${item.id}`);

      default:
        throw new Error(`Could not handle custom highlights action! Highlight id: ${item.id}, action: ${item.action}`);
    }

    return action || [];
  });

  return actions;

  function createUpdatedItem(item: GenericHighlight, index: number) {
    return {
      experience_id: experienceId,
      language_code: item.language_code,
      flow_code: curationFlowCode,
      status_code: toBeEditedStatusCode,
      name: item.name,
      visualization_order: index,
      code: item.code,
    };
  }
}

function getApiKey(key: string): {
  custom: CustomHighlightsEndpoint;
  premade: null;
} {
  switch (key) {
    case "highlights":
      return {
        custom: "custom-highlights",
        premade: null,
      };

    case "included":
      return { custom: "custom-included", premade: null };

    case "non_included":
      return { custom: "custom-non-included", premade: null };

    case "important_information":
      return { custom: "custom-important-information", premade: null };

    default:
      throw new Error(`Could not define api key for custom highlights! Requested key: ${key}`);
  }
}
