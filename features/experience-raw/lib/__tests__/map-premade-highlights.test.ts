import { GenericHighlight } from "@/types/Highlights";
import { test, describe, expect } from "vitest";
import { mapManageableHighlightToPremadeHighlight } from "../map-premade-highlights";

describe("mapManageableHighlightsToRawHighlight", () => {
  test("it maps correctly", () => {
    const items: GenericHighlight[] = [
      {
        id: "1",
        name: "highlight_1_custom",
        action: "NOOP",
        visualization_order: 0,
        code: "code-1",
      },
      {
        id: "2",
        name: "highlight_2_custom",
        action: "DELETE",
        visualization_order: 0,
        code: "code-2",
      },
    ];

    const map = mapManageableHighlightToPremadeHighlight(items);

    // DELETE shouldn't show up
    expect(map.length).toBe(1);
    expect(map).toStrictEqual(["code-1"]);
  });

  test("it errors correctly", () => {
    const items: GenericHighlight[] = [
      {
        id: "1",
        name: "highlight_1_custom",
        action: "NOOP",
        visualization_order: 0,
      },
    ];

    expect(() => mapManageableHighlightToPremadeHighlight(items)).toThrowError("Premade highlight must have a code.");
  });
});
