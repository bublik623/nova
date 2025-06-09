import { beforeEach, describe, expect, test, vi } from "vitest";
import { useCommercialContentItem } from "../useCommercialContentItem";

vi.stubGlobal("refreshNuxtData", vi.fn());

const useAsyncModalMock = {
  openModal: vi.fn(),
};
vi.mock("@/features/core-shared/composables/useAsyncModal", () => ({
  useAsyncModal: () => useAsyncModalMock,
}));

const useNotificationStoreMock = {
  addNotification: vi.fn(),
};
vi.mock("@/stores/notifications", () => ({
  useNotifications: () => useNotificationStoreMock,
}));

const masterDataStoreMock: any = {
  hierarchicalGroups: new Map(),
};
vi.mock("@/stores/master-data", () => ({
  useMasterData: () => masterDataStoreMock,
}));

const updatePremadeMock = vi.fn().mockResolvedValue();
vi.mock("@/composables/useExperienceMasterDataApi", () => ({
  useExperienceMasterDataApi: () => ({
    updatePremade: updatePremadeMock,
  }),
}));

const routerPushMock = vi.fn();
vi.mock("vue-router", () => ({
  useRoute: () => ({ params: { endpoint: "testEndpoint" } }),
  useRouter: () => ({ push: routerPushMock }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("handleTranslation", () => {
  test("opens the modal and calls the handler with the correct parameters", async () => {
    const { handleTranslation } = useCommercialContentItem();
    const translation = {
      id: "1",
      name: "Item",
      language_code: "it",
      code: "item_code",
    };
    const mainTranslation = {
      id: "2",
      name: "Main Item",
      language_code: "en",
      code: "item_code",
    };

    // Call the composable function with a valid mainTranslation
    await handleTranslation({ action: "add", translation, mainTranslation });

    // Verify that the modal is opened with the expected parameters
    expect(useAsyncModalMock.openModal).toHaveBeenCalledWith({
      action: "add",
      handler: expect.any(Function),
      mainTranslation,
      translationToUpdate: translation,
    });

    // Extract the handler passed to the modal and verify that it is a function
    const modalConfig = useAsyncModalMock.openModal.mock.calls[0][0];
    const handlerFunction = modalConfig.handler;
    expect(typeof handlerFunction).toBe("function");

    // Simulate calling the handler (as would be done within the dialog)
    await handlerFunction(translation, "New Translation Name");

    // Verify that the API call is made with the correct payload
    expect(updatePremadeMock).toHaveBeenCalledWith("testEndpoint", {
      ...translation,
      name: "New Translation Name",
    });

    // Verify that the data is refreshed
    expect(refreshNuxtData).toHaveBeenCalled();

    // Verify that a success notification is triggered
    expect(useNotificationStoreMock.addNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "toast",
        message: "notifications.success.updating.masterdata.translation",
        theme: "success",
      })
    );
  });

  test("does not open the modal if mainTranslation is not defined", async () => {
    const { handleTranslation } = useCommercialContentItem();
    const translation = {
      id: "1",
      name: "Item",
      language_code: "it",
      code: "item_code",
    };

    // Spy on console.warn to verify warning is issued
    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    // Call the function without a mainTranslation
    await handleTranslation({ action: "update", translation, mainTranslation: undefined });

    // Verify the warning is printed and the modal is not opened
    expect(consoleWarnSpy).toHaveBeenCalledWith("no en translation exist for this item");
    expect(useAsyncModalMock.openModal).not.toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
  });
});

describe("handleUpdateItemNameAndCategory", () => {
  test("opens the modal and calls the handler with the correct parameters", async () => {
    const { handleUpdateItemNameAndCategory } = useCommercialContentItem();
    const itemToUpdate = {
      id: "1",
      name: "Item",
      language_code: "it",
      code: "item_code",
    };

    // Set up the hierarchicalGroups in the masterDataStore
    masterDataStoreMock.hierarchicalGroups = new Map([["key1", { name: "CategoryName", code: "catCode" }]]);

    // Call the function with a valid item
    await handleUpdateItemNameAndCategory(itemToUpdate);

    // Expected category list generated from masterDataStore
    const expectedCategoryList = [{ label: "CategoryName", value: "catCode" }];
    expect(useAsyncModalMock.openModal).toHaveBeenCalledWith({
      handler: expect.any(Function),
      itemToUpdate,
      categoryList: expectedCategoryList,
    });

    // Extract the handler passed to the modal and verify that it is a function
    const modalConfig = useAsyncModalMock.openModal.mock.calls[0][0];
    const handlerFunction = modalConfig.handler;
    expect(typeof handlerFunction).toBe("function");

    // Simulate calling the handler (as would be done within the dialog)
    await handlerFunction(itemToUpdate, "New Item Name", "newCatCode");

    // Verify that the API call is made with the correct payload
    expect(updatePremadeMock).toHaveBeenCalledWith("testEndpoint", {
      ...itemToUpdate,
      name: "New Item Name",
      hierarchical_group_code: "newCatCode",
    });

    expect(refreshNuxtData).toHaveBeenCalled();

    // Verify that router.push is called with the correct path
    expect(routerPushMock).toHaveBeenCalledWith({
      path: `/masterdata-management/commercial-content/testEndpoint/newCatCode/${itemToUpdate.code}`,
    });

    // Verify that a success notification is triggered
    expect(useNotificationStoreMock.addNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "toast",
        message: "notifications.success.updating.masterdata.item",
        theme: "success",
      })
    );
  });

  test("does not open the modal if itemToUpdate is not defined", async () => {
    const { handleUpdateItemNameAndCategory } = useCommercialContentItem();

    // Spy on console.warn to verify warning is issued
    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    // Call the function without a valid item
    await handleUpdateItemNameAndCategory(undefined);

    // Verify that the warning is printed and the modal is not opened
    expect(consoleWarnSpy).toHaveBeenCalledWith("no entity exist for this item.");
    expect(useAsyncModalMock.openModal).not.toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
  });
});
