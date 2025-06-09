import { describe, expect, test, vi } from "vitest";
import { mockPremadeHighlightsPayload } from "../__mocks__/mock-premade-highlights-payload";
import { getAllPremadeHighlights } from "../get-all-premade-highlights";

const masterDataApiMock = {
  getPremades: vi.fn((key: string) => ({
    data: mockPremadeHighlightsPayload(key),
  })),
};

const metadataApiMock = {
  get: vi.fn((key: string) => {
    const removeExperienceString = key.replace("experience-", "");

    return {
      data: [
        {
          id: "relation-id",
          [removeExperienceString.replace("-", "_")]: [`test-code-0`, `test-code-1`, `test-code-2`],
        },
      ],
    };
  }),
};

vi.mock("@/composables/useExperienceMasterDataApi", () => ({
  useExperienceMasterDataApi: () => masterDataApiMock,
}));

vi.mock("@/composables/useMetadataExperienceApi", () => ({
  useMetadataExperienceApi: () => metadataApiMock,
}));

const TEST_ID = "test-id";
const TEST_LANGUAGE = "en";

describe("getAllPremadeHighlights", () => {
  test("it request the correct endpoints", async () => {
    const request = await getAllPremadeHighlights(TEST_LANGUAGE, TEST_ID);

    expect(request.premade_highlights).toStrictEqual(mockPremadeHighlightsPayload("highlights"));
    expect(request.premade_included).toStrictEqual(mockPremadeHighlightsPayload("included"));
    expect(request.premade_non_included).toStrictEqual(mockPremadeHighlightsPayload("included"));
    expect(request.premade_important_information).toStrictEqual(mockPremadeHighlightsPayload("important-information"));

    const lang = {
      language_code: "en",
    };

    expect(masterDataApiMock.getPremades).toHaveBeenNthCalledWith(1, "highlights", lang);
    expect(masterDataApiMock.getPremades).toHaveBeenNthCalledWith(2, "important-information", lang);
    expect(masterDataApiMock.getPremades).toHaveBeenNthCalledWith(3, "included", lang);
  });
});
