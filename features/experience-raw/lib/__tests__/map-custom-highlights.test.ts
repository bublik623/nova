import { GenericHighlight } from "@/types/Highlights";
import { test, describe, expect } from "vitest";
import { mapManageableHighlightsToRawHighlight } from "../map-custom-highlights";

describe("mapManageableHighlightsToRawHighlight", () => {
  test("it maps correctly", () => {
    const items: GenericHighlight[] = [
      {
        id: "1",
        name: "highlight_1_custom",
        action: "NOOP",
        visualization_order: 0,
      },
      {
        id: "2",
        name: "highlight_2_custom",
        action: "DELETE",
        visualization_order: 0,
      },
    ];

    const map = mapManageableHighlightsToRawHighlight(items);

    // DELETE shouldn't show up
    expect(map.length).toBe(1);
  });
});
