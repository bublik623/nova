import { describe, expect, test, vi } from "vitest";
import { getAllCustomHighlights } from "../get-all-custom-highlights";
import { mockCustomHighlightsPayload } from "../__mocks__/mock-custom-highlights-payload";

const contentCommandApiMock = {
  getCustomHighlights: vi.fn((key) => ({
    data: mockCustomHighlightsPayload(key),
  })),
};

vi.mock("@/composables/useContentCommandApi", () => ({
  useContentCommandApi: () => contentCommandApiMock,
}));

const TEST_ID = "test-id";
const TEST_LANGUAGE = "en";

describe("getAllCustomHighlights", () => {
  test("it request the correct endpoints", async () => {
    const request = await getAllCustomHighlights(TEST_LANGUAGE, TEST_ID);

    const paramsObj = {
      params: {
        filters: "language_code==en;experience_id==test-id",
        sort: "visualization_order",
      },
    };

    const keys = ["custom-highlights", "custom-important-information", "custom-included", "custom-non-included"];

    keys.forEach((key, index) => {
      expect(contentCommandApiMock.getCustomHighlights).toHaveBeenNthCalledWith(index + 1, key, paramsObj);
    });

    expect(request.custom_highlights).toStrictEqual(mockCustomHighlightsPayload("custom-highlights"));

    expect(request.custom_important_information).toStrictEqual(
      mockCustomHighlightsPayload("custom-important-information")
    );

    expect(request.custom_included).toStrictEqual(mockCustomHighlightsPayload("custom-included"));

    expect(request.custom_non_included).toStrictEqual(mockCustomHighlightsPayload("custom-non-included"));
  });
});
