import { GenericHighlight, MixedHighlightValue } from "@/types/Highlights";

export function mixedHighlightListValidator(value: MixedHighlightValue): boolean {
  return removeDeletedItems(value.custom)?.length > 0 || removeDeletedItems(value.premade)?.length > 0;

  function removeDeletedItems(items: GenericHighlight[]) {
    return items?.filter((item) => item.action !== "DELETE");
  }
}

export function mapGenericToManageableHighlight(items: Partial<GenericHighlight>[]): GenericHighlight[] {
  return items.map((item, index) => {
    return {
      language_code: item.language_code,
      code: item.code,
      name: item.name || "",
      action: "NOOP",
      id: item.id || Math.floor(Math.random() * 10000).toString(),
      visualization_order: item.visualization_order || index,
    };
  });
}
