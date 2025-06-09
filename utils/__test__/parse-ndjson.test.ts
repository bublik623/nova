import { describe, test, expect } from "vitest";
import { parseNDJSON } from "../parse-ndjson";

describe("parseNDJSON", () => {
  describe("when the response is a single object", () => {
    test("it should return an array containing only that object", () => {
      const data = { id: "test", items: ["item-1", "item-2"] };

      expect(parseNDJSON(data)).toStrictEqual([data]);
    });
  });

  describe("when the response is a NDJSON string", () => {
    test("it should return an array containing the parsed objects", () => {
      const data = `{"id":"test-1","items":["item-1","item-2"]}\n{"id":"test-2","items":["item-1","item-2"]}\n{"id":"test-3","items":["item-1","item-2"]}`;

      expect(parseNDJSON(data)).toStrictEqual([
        { id: "test-1", items: ["item-1", "item-2"] },
        { id: "test-2", items: ["item-1", "item-2"] },
        { id: "test-3", items: ["item-1", "item-2"] },
      ]);
    });
  });
});
