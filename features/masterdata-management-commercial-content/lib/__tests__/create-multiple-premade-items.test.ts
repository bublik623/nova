import { beforeEach, describe, expect, test, vi } from "vitest";
import { createMultiplePremadeItems } from "../create-multiple-premade-items";

const UUID = "uuid";
const ITEMS = ["a", "b", "c"];
const CATEGORY_CODE = "category-code";

const masterDataApiMock = {
  createPremadeHighlight: vi.fn(),
  translatePremadeHighlight: vi.fn(),
  createMultipleItemsV2: vi.fn(),
};

vi.mock("@/composables/useExperienceMasterDataApi", () => ({
  useExperienceMasterDataApi: () => masterDataApiMock,
}));

const getMasterdataManagementLanguagesMock = {
  manualLanguages: ["ru"],
  automaticLanguages: ["es", "it", "de"],
};

vi.mock("../get-masterdata-management-languages", () => ({
  getMasterdataManagementLanguages: () => getMasterdataManagementLanguagesMock,
}));

vi.mock("@datadog/browser-core", () => ({ generateUUID: () => UUID }));

describe("CreateMultiplePremadeItems ", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("it creates multiple items correctly with the v2 logic", async () => {
    const createdMultipleItems = await createMultiplePremadeItems("important-information", ITEMS, CATEGORY_CODE);

    expect(createdMultipleItems).toStrictEqual([UUID, UUID, UUID]);

    expect(masterDataApiMock.createPremadeHighlight).not.toHaveBeenCalled();
    expect(masterDataApiMock.translatePremadeHighlight).not.toHaveBeenCalled();

    expect(masterDataApiMock.createMultipleItemsV2).toHaveBeenCalledWith("important-information", {
      automatic_languages: getMasterdataManagementLanguagesMock.automaticLanguages,
      items: [
        {
          code: "uuid",
          hierarchical_group_code: "category-code",
          language_code: "en",
          name: "a",
        },
        {
          code: "uuid",
          hierarchical_group_code: "category-code",
          language_code: "en",
          name: "b",
        },
        {
          code: "uuid",
          hierarchical_group_code: "category-code",
          language_code: "en",
          name: "c",
        },
      ],
      manual_languages: getMasterdataManagementLanguagesMock.manualLanguages,
    });
  });
});
