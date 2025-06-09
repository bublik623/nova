import { beforeEach, describe, expect, test, vi } from "vitest";
import { useCommercialContentCategory } from "../useCommercialContentCategory";

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

const masterDataStoreMock = {
  fetchHierarchicalGroups: vi.fn(),
};

vi.mock("@/stores/master-data", () => ({
  useMasterData: () => masterDataStoreMock,
}));

const updateHandlerMock = vi.fn().mockResolvedValue();

vi.mock("@/composables/useExperienceMasterDataApi", () => ({
  useExperienceMasterDataApi: () => ({
    updateHierarchicalGroup: updateHandlerMock,
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("handleEditCategoryName", () => {
  test("open the modal and call the handler with the correct parameters", async () => {
    const { handleEditCategoryName } = useCommercialContentCategory();
    const category = { id: "1", name: "Category", language_code: "it", code: "category_code" };

    await handleEditCategoryName(category);

    expect(useAsyncModalMock.openModal).toHaveBeenCalledWith({
      handler: expect.any(Function),
      category,
    });

    const modalConfig = useAsyncModalMock.openModal.mock.calls[0][0];
    const handlerFunction = modalConfig.handler;
    expect(typeof handlerFunction).toBe("function");

    await handlerFunction(category, "New Category Name");

    expect(updateHandlerMock).toHaveBeenCalledWith({
      ...category,
      name: "New Category Name",
    });

    expect(masterDataStoreMock.fetchHierarchicalGroups).toHaveBeenCalled();
    expect(useNotificationStoreMock.addNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "toast",
        message: "notifications.success.updating.masterdata.category",
        theme: "success",
      })
    );
  });

  test("do not open the modal if the category is ont defined", async () => {
    const { handleEditCategoryName } = useCommercialContentCategory();
    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    await handleEditCategoryName(undefined);

    expect(consoleWarnSpy).toHaveBeenCalledWith("no entity exist for this category. maybe is uncategorized?");
    expect(useAsyncModalMock.openModal).not.toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
  });
});

describe("handleTranslation", () => {
  test("open the modal and call the handler with the correct parameters", async () => {
    const { handleCategoryTranslation } = useCommercialContentCategory();
    const translation = { id: "1", name: "Category", language_code: "it", code: "category_code" };
    const mainTranslation = { id: "2", name: "Main Category", language_code: "en", code: "category_code" };

    await handleCategoryTranslation({ action: "add", translation, mainTranslation });

    expect(useAsyncModalMock.openModal).toHaveBeenCalledWith({
      action: "add",
      handler: expect.any(Function),
      mainTranslation,
      translationToUpdate: translation,
    });

    const modalConfig = useAsyncModalMock.openModal.mock.calls[0][0];
    const handlerFunction = modalConfig.handler;
    expect(typeof handlerFunction).toBe("function");

    await handlerFunction(translation, "New Translation Name");

    expect(updateHandlerMock).toHaveBeenCalledWith({
      ...translation,
      name: "New Translation Name",
    });

    expect(masterDataStoreMock.fetchHierarchicalGroups).toHaveBeenCalled();
    expect(useNotificationStoreMock.addNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "toast",
        message: "notifications.success.updating.masterdata.translation",
        theme: "success",
      })
    );
  });

  test("do not open the modal if the main translation (en) is ont defined", async () => {
    const { handleCategoryTranslation } = useCommercialContentCategory();
    const translation = { id: "1", name: "Category", language_code: "it", code: "category_code" };
    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    await handleCategoryTranslation({ action: "add", translation });

    expect(consoleWarnSpy).toHaveBeenCalledWith("no en translation exist for this category. maybe is uncategorized?");
    expect(useAsyncModalMock.openModal).not.toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
  });
});
