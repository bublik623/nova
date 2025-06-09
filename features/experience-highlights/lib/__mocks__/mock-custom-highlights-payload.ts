import { GenericHighlight } from "@/types/Highlights";

export function mockCustomHighlightsPayload(key: string): GenericHighlight[] {
  const items: GenericHighlight[] = [];

  for (let index = 0; index < 3; index++) {
    items.push({
      id: `${key}-test-id-${index}`,
      name: `${key}-test-name-${index}`,
      visualization_order: index,
      code: `${key}-test-code-${index}`,
    });
  }

  return items;
}
