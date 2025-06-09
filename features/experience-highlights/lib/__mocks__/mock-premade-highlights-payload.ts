import { GenericHighlight } from "@/types/Highlights";

export function mockPremadeHighlightsPayload(key: string): GenericHighlight[] {
  const items: GenericHighlight[] = [];

  for (let index = 0; index < 3; index++) {
    items.push({
      id: `test-id-${index}`,
      name: `test-name-${index}-${key}`,
      visualization_order: index,
      code: `test-code-${index}`,
    });
  }

  return items;
}
