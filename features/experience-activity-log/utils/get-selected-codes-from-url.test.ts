import { describe, it, expect } from "vitest";
import { getSelectedCodesFromUrl } from "./get-selected-codes-from-url";

describe("getSelectedCodesFromUrl", () => {
  it("should return ['BASE'] when the URL includes 'raw'", () => {
    const result = getSelectedCodesFromUrl("https://example.com/raw");
    expect(result).toEqual(["BASE"]);
  });

  it("should return ['CURATION'] when the URL includes 'curation'", () => {
    const result = getSelectedCodesFromUrl("https://example.com/curation");
    expect(result).toEqual(["CURATION"]);
  });

  it("should return ['MEDIA'] when the URL includes 'media'", () => {
    const result = getSelectedCodesFromUrl("https://example.com/media");
    expect(result).toEqual(["MEDIA"]);
  });

  it("should return ['AUTOTRANSLATION', 'MANUAL_TRANSLATION'] when the URL includes 'translation'", () => {
    const result = getSelectedCodesFromUrl("https://example.com/translation");
    expect(result).toEqual(["AUTOTRANSLATION", "MANUAL_TRANSLATION"]);
  });

  it("should return an empty array when the URL does not match any case", () => {
    const result = getSelectedCodesFromUrl("https://example.com/unknown");
    expect(result).toEqual([]);
  });
});
