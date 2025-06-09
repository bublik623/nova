import { describe, expect, test, vi } from "vitest";
import { commitCustomHighlights } from "../commit-custom-highlights";
import { mockCustomHighlightsPayload } from "../__mocks__/mock-custom-highlights-payload";

const contentCommandApiMock = {
  postCustomHighlight: vi.fn(() => {}),
  putCustomHighlight: vi.fn(() => {}),
  deleteCustomHighlight: vi.fn(() => {}),
};

vi.mock("@/composables/useContentCommandApi", () => ({
  useContentCommandApi: () => contentCommandApiMock,
}));

const masterDataMock = {
  getFlowByCode: () => ({
    id: "flow-id",
  }),
  getStatusByCode: () => ({
    id: "status-id",
  }),
};

vi.mock("@/stores/master-data", () => ({
  useMasterData: () => masterDataMock,
}));

const TEST_ID = "test-id";

describe("commitCustomHighlights", () => {
  test("it creates the correct promises", async () => {
    const items = mockCustomHighlightsPayload("highlights");

    items[0].action = "CREATE";
    items[1].action = "EDIT";
    items[2].action = "DELETE";

    commitCustomHighlights(TEST_ID, "highlights", items, {
      curationFlowCode: "CURATION",
      toBeEditedStatusCode: "TO_BE_EDIT",
    });

    expect(contentCommandApiMock.putCustomHighlight).toHaveBeenCalledWith("custom-highlights/highlights-test-id-1", {
      code: "highlights-test-code-1",
      experience_id: "test-id",
      language_code: undefined,
      flow_code: "CURATION",
      status_code: "TO_BE_EDIT",
      name: "highlights-test-name-1",
      visualization_order: 1,
    });

    expect(contentCommandApiMock.postCustomHighlight).toHaveBeenCalledWith("custom-highlights", {
      code: "highlights-test-code-0",
      experience_id: "test-id",
      language_code: undefined,
      flow_code: "CURATION",
      status_code: "TO_BE_EDIT",
      name: "highlights-test-name-0",
      visualization_order: 0,
    });
    expect(contentCommandApiMock.deleteCustomHighlight).toHaveBeenCalledWith("custom-highlights/highlights-test-id-2");
  });
});
