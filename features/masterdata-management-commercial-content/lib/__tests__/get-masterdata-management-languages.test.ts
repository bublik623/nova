import { describe, it, expect, vi } from "vitest";
import { getMasterdataManagementLanguages } from "../get-masterdata-management-languages";
import { useMasterData } from "@/stores/master-data";

vi.mock("@/stores/master-data", () => ({
  useMasterData: vi.fn(),
}));

const masterDataMock = vi.mocked(useMasterData);

describe("getMasterdataManagementLanguages", () => {
  it("should not return the english language at all", () => {
    const mockUseMasterData = {
      availableLanguages: new Set(["en", "fr", "de"]),
      automaticTranslationLanguages: new Set(["en"]),
    };

    // @ts-expect-error ...
    masterDataMock.mockReturnValue(mockUseMasterData);

    const result = getMasterdataManagementLanguages();
    expect(result.manualLanguages).not.toContain("en");
    expect(result.automaticLanguages).not.toContain("en");
  });

  it("should return manual and automatic languages correctly", () => {
    const mockUseMasterData = {
      availableLanguages: new Set(["en", "fr", "de"]),
      automaticTranslationLanguages: new Set([]),
    };
    // @ts-expect-error ...
    masterDataMock.mockReturnValue(mockUseMasterData);

    const result = getMasterdataManagementLanguages();

    expect(result).toEqual({
      manualLanguages: ["fr", "de"],
      automaticLanguages: [],
    });
  });

  it("should return empty arrays if both availableLanguages and automaticTranslationLanguages are empty", () => {
    const mockUseMasterData = {
      availableLanguages: new Set(),
      automaticTranslationLanguages: new Set(),
    };

    // @ts-expect-error ...
    masterDataMock.mockReturnValue(mockUseMasterData);

    const result = getMasterdataManagementLanguages();

    expect(result).toEqual({
      manualLanguages: [],
      automaticLanguages: [],
    });
  });
});
