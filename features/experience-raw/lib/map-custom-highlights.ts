import { CustomHighlights } from "@/types/generated/ExperienceRawServiceApi";
import { GenericHighlight } from "@/types/Highlights";

/**
 * @description maps a generic highlight to a raw custom highlight
 */
export function mapManageableHighlightsToRawHighlight(items: GenericHighlight[]): CustomHighlights[] {
  const parsedItems: GenericHighlight[] = [];

  // in the raw experience the highlights are just a json object,
  // so we can just update the array and post it
  // The DELETE action is only on the frontend, it means that it has not been
  // created yet in the backend.
  for (const item of items) {
    if (item.action !== "DELETE") {
      parsedItems.push(item);
    }
  }

  return parsedItems;
}
