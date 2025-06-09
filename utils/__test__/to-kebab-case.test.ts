import { describe, test, expect } from "vitest";
import { toKebabCase } from "../to-kebab-case";

describe("toKebabCase", () => {
  test("it returns a kebab-cased string", () => {
    const cases = ["Hello world", "HELLO_WORLD"];
    const expected = "hello-world";

    cases.map((s) => expect(toKebabCase(s)).toBe(expected));
  });
});
