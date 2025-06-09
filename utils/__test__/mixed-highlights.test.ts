import { describe, test, expect } from "vitest";
import { GenericHighlight } from "@/types/Highlights";
import { mapGenericToManageableHighlight, mixedHighlightListValidator } from "@/utils/mixed-highlights";

describe("MixedHighlightListValidator", () => {
  const validData: GenericHighlight[] = [
    {
      id: "1234",
      action: "NOOP",
      name: "Highlight 1",
      visualization_order: 0,
      language_code: "en",
    },
    {
      id: "2345",
      action: "NOOP",
      name: "Highlight 2",
      visualization_order: 1,
      language_code: "en",
    },
    {
      id: "3456",
      action: "NOOP",
      name: "Highlight 3",
      visualization_order: 2,
      language_code: "en",
    },
  ];
  test("It should validate a custom only highlight array", () => {
    expect(
      mixedHighlightListValidator({
        custom: validData,
        premade: [],
      })
    ).toBe(true);
  });

  test("It should validate a premade only highlight array", () => {
    expect(
      mixedHighlightListValidator({
        custom: [],
        premade: validData,
      })
    ).toBe(true);
  });

  test("It should not validate an empty array", () => {
    expect(
      mixedHighlightListValidator({
        custom: [],
        premade: [],
      })
    ).toBe(false);
  });

  test("It should handle invalid data", () => {
    expect(
      mixedHighlightListValidator({
        // @ts-expect-error passing invalid data
        custom: null,
        // @ts-expect-error passing invalid data
        premade: undefined,
      })
    ).toBe(false);
  });
});

describe("mapGenericToManageableHighlight", () => {
  const genericItems: GenericHighlight[] = [
    {
      id: "id-1",
      name: "Highlight 1",
      language_code: "en",
      visualization_order: 0,
    },
    {
      id: "id-2",
      name: "Highlight 2",
      language_code: "en",
      visualization_order: 1,
    },
    {
      id: "id-3",
      name: "Highlight 3",
      language_code: "en",
      visualization_order: 2,
    },
  ];

  test("It returns a manageable array", () => {
    const result = mapGenericToManageableHighlight(genericItems);

    expect(result.length).toBe(3);
    expect(result[0].id).toBe("id-1");
    expect(result[0].action).toBe("NOOP");
    expect(result[0].visualization_order).toBe(0);
  });
});
