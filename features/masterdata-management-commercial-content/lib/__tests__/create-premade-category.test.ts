import { describe, expect, test, vi } from "vitest";
import { createPremadeCategory } from "../create-premade-category";
import * as createMultiplePremadeItemsMock from "@/features/masterdata-management-commercial-content/lib/create-multiple-premade-items";

const UUID = "uuid";
const ENDPOINT = "test-endpoint";
const NAME = "test-name";
const ITEMS = ["a", "b", "c"];

const apiMocks = {
  createHierarchicalGroupV2: vi.fn(),
};

vi.mock("@/composables/useExperienceMasterDataApi", () => ({
  useExperienceMasterDataApi: () => apiMocks,
}));

vi.mock("@datadog/browser-core", () => ({ generateUUID: () => UUID }));

const getMasterdataManagementLanguagesMock = {
  manualLanguages: ["en"],
  automaticLanguages: ["es", "it", "de"],
};

vi.mock("../get-masterdata-management-languages", () => ({
  getMasterdataManagementLanguages: () => getMasterdataManagementLanguagesMock,
}));

const multipleItemCreateSpy = vi.spyOn(createMultiplePremadeItemsMock, "createMultiplePremadeItems");
multipleItemCreateSpy.mockImplementation(() => Promise.resolve(ITEMS));

describe("CreatePremadeCategory", () => {
  test("it creates a category correctly", async () => {
    const returnedCategoryCode = await createPremadeCategory(ENDPOINT, NAME, ITEMS);

    expect(apiMocks.createHierarchicalGroupV2).toHaveBeenCalledWith({
      automatic_languages: getMasterdataManagementLanguagesMock.automaticLanguages,
      manual_languages: getMasterdataManagementLanguagesMock.manualLanguages,
      group: {
        code: UUID,
        language_code: "en",
        name: NAME,
      },
    });

    expect(multipleItemCreateSpy).toHaveBeenNthCalledWith(1, ENDPOINT, ITEMS, UUID);
    expect(returnedCategoryCode).toBe(UUID);
  });
});
