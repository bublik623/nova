import { formatPrefix } from "../format-prefix";
import { describe, test, expect } from "vitest";

const it = test;

describe("formatPrefix", () => {
  it("should format positive number prefix correctly", () => {
    expect(formatPrefix(123)).toEqual("+123");
  });

  it("should keep existing + sign in string prefix", () => {
    expect(formatPrefix("+123")).toEqual("+123");
  });

  it("should add + sign to string prefix without it", () => {
    expect(formatPrefix("123")).toEqual("+123");
  });

  it('should return "+00" for undefined prefix', () => {
    expect(formatPrefix(undefined)).toEqual("+00");
  });

  it('should return "+00" for null prefix', () => {
    expect(formatPrefix(null)).toEqual("+00");
  });

  it("should handle string containing only + sign", () => {
    expect(formatPrefix("+")).toEqual("+");
  });
});
