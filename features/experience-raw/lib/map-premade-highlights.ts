import { GenericHighlight } from "@/types/Highlights";

// we need to send the code of the premade highlight to the metadata service
// and filter out items that have action = DELETE
export function mapManageableHighlightToPremadeHighlight(items: GenericHighlight[]) {
  return items
    .filter((i) => i.action !== "DELETE")
    .map((i) => {
      if (i.code == null) {
        throw new Error("Premade highlight must have a code.");
      }
      return i.code;
    });
}
