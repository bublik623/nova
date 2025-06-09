import { beforeEach, describe, expect, test, vi } from "vitest";
import * as useAsyncModalModule from "@/features/core-shared/composables/useAsyncModal";
import * as useAsyncConfirmModalModule from "@/features/core-shared/composables/useAsyncConfirmModal";
import * as getExperienceStateModule from "@/features/experience-shared/utils/get-experience-state";
import { saveCurationContent } from "../saveCurationContent";
import * as sendToTranslationObj from "../sendToTranslation";

const options = {
  in_review_option: {
    id: "in_review_option_id",
    nextSection: "",
    publish: false,
    afterSaving: () => null,
    redirect: false,
    translate: false,
  },
};

const experienceCurationStoreMock = {
  updateCurationDocument: vi.fn(),
  sendToTranslation: vi.fn(),
  curationDocuments: {
    [options.in_review_option.id]: { data: options.in_review_option },
  },
  publishCurationExperience: vi.fn(),
};

const notificationStoreMock = {
  addNotification: vi.fn(),
};

const contentCommandApiMock = {
  publishTranslation: vi.fn(),
};

vi.mock("@/stores/experience-curation", () => ({
  useExperienceCuration: () => experienceCurationStoreMock,
}));

vi.mock("@/stores/notifications", () => ({
  useNotifications: () => notificationStoreMock,
}));

vi.mock("@/composables/useContentCommandApi", () => ({
  useContentCommandApi: () => contentCommandApiMock,
}));

vi.stubGlobal("useNuxtApp", () => ({ $t: (s: string) => s }));
vi.stubGlobal("useNuxtData", () => ({}));

const sendToTranslationMock = vi.spyOn(sendToTranslationObj, "sendToTranslation");

const getDistributionStateSpy = vi.spyOn(getExperienceStateModule, "getDistributionState");
getDistributionStateSpy.mockReturnValue("draft");

describe("saveCurationContent", () => {
  test("it should save the curation document", async () => {
    await saveCurationContent(options.in_review_option);
    expect(experienceCurationStoreMock.updateCurationDocument).toHaveBeenCalled();
  });

  test("it should show a notification", async () => {
    await saveCurationContent(options.in_review_option);
    expect(notificationStoreMock.addNotification).toHaveBeenCalledWith({
      message: "notifications.success.saving.document",
      theme: "success",
    });
  });

  describe("when there is an error", () => {
    test("it should show a message", async () => {
      experienceCurationStoreMock.updateCurationDocument.mockImplementationOnce(() => Promise.reject());
      await saveCurationContent(options.in_review_option);
      expect(notificationStoreMock.addNotification).toHaveBeenCalledWith({
        message: "notifications.error.saving.document",
        theme: "error",
      });
    });
  });

  describe("if the afterSaving function is passed", () => {
    test("it should call the function", async () => {
      let any = 0;
      await saveCurationContent({ ...options.in_review_option, afterSaving: () => any++ });
      expect(any).toBe(1);
    });
  });

  describe("if the publish param is true and translate is false", () => {
    test("it should update the document and call the publish endpoint", async () => {
      experienceCurationStoreMock.updateCurationDocument.mockClear();

      await saveCurationContent({ ...options.in_review_option, publish: true, translate: false, force: true });
      expect(experienceCurationStoreMock.updateCurationDocument).toHaveBeenCalled();
      expect(experienceCurationStoreMock.publishCurationExperience).toHaveBeenCalled();
    });
  });

  describe("if the translate param is true", () => {
    test("it should update the document and translate the document", async () => {
      experienceCurationStoreMock.updateCurationDocument.mockClear();
      await saveCurationContent({ ...options.in_review_option, translate: true });
      expect(experienceCurationStoreMock.updateCurationDocument).toHaveBeenCalledTimes(1);

      expect(experienceCurationStoreMock.updateCurationDocument).toHaveBeenCalled();
      expect(sendToTranslationMock).toHaveBeenCalledWith(options.in_review_option.id);
    });
  });

  let called = false;

  function fakePromise(): Promise<void> {
    return new Promise((resolve) => {
      called = true;
      resolve();
    });
  }

  describe("if the promise param exist", () => {
    test("it should call the function", async () => {
      await saveCurationContent({ ...options.in_review_option, promise: fakePromise });
      expect(called).toBe(true);
    });
  });

  describe("display 'publish new version' modal, when distribution state is in_review", () => {
    const confirmModalMock = { openModal: vi.fn(() => Promise.resolve(false)) };
    const useAsyncConfirmModalSpy = vi.spyOn(useAsyncConfirmModalModule, "useAsyncConfirmModal");
    useAsyncConfirmModalSpy.mockImplementation(() => confirmModalMock);

    beforeEach(() => {
      getDistributionStateSpy.mockReturnValue("in_review");
      vi.clearAllMocks();
    });

    test("should not show modal when publishing is not requested", async () => {
      await saveCurationContent({ id: "testId", publish: false });

      expect(confirmModalMock.openModal).not.toBeCalled();
      expect(experienceCurationStoreMock.updateCurationDocument).toHaveBeenCalled();
    });

    test("should not proceed with saving if user cancels the publish action", async () => {
      confirmModalMock.openModal.mockResolvedValue(false);
      await saveCurationContent({ id: "testId", publish: true });

      expect(confirmModalMock.openModal).toHaveBeenCalled();
      expect(experienceCurationStoreMock.updateCurationDocument).not.toHaveBeenCalled();
    });

    test("should publish when user accepts the publish action", async () => {
      confirmModalMock.openModal.mockResolvedValue(true);
      await saveCurationContent({ id: "testId", publish: true });

      expect(confirmModalMock.openModal).toHaveBeenCalled();
      expect(experienceCurationStoreMock.updateCurationDocument).toHaveBeenCalled();
      expect(experienceCurationStoreMock.publishCurationExperience).toHaveBeenCalled();
    });
  });

  describe("display 'republish' modal, when distribution state is 'unpublished'", () => {
    const modalMock = { openModal: vi.fn(() => Promise.resolve(false)) };
    const useAsyncModalSpy = vi.spyOn(useAsyncModalModule, "useAsyncModal");
    useAsyncModalSpy.mockImplementation(() => modalMock);

    beforeEach(() => {
      getDistributionStateSpy.mockReturnValue("unpublished");
      vi.clearAllMocks();
    });

    test("should not show modal when publishing is not requested", async () => {
      await saveCurationContent({ id: "testId", publish: false });

      expect(modalMock.openModal).not.toHaveBeenCalled();
      expect(experienceCurationStoreMock.updateCurationDocument).toHaveBeenCalled();
    });

    test("should not proceed with saving if user cancels the publish action", async () => {
      modalMock.openModal.mockResolvedValue(false);

      await saveCurationContent({ id: "testId", publish: true });

      expect(modalMock.openModal).toHaveBeenCalled();
      expect(experienceCurationStoreMock.updateCurationDocument).not.toHaveBeenCalled();
    });

    test("should publish when user clicks on submit", async () => {
      modalMock.openModal.mockResolvedValue(true);

      await saveCurationContent({ id: "testId", publish: true });

      expect(modalMock.openModal).toHaveBeenCalled();
      expect(experienceCurationStoreMock.updateCurationDocument).toHaveBeenCalled();
      expect(experienceCurationStoreMock.publishCurationExperience).toHaveBeenCalled();
    });

    test.skip("should set 'force' to true and publish if user clicks on publish", async () => {
      modalMock.openModal.mockResolvedValue(true);

      await saveCurationContent({ id: "test-id", publish: true, force: false });

      expect(modalMock.openModal).toHaveBeenCalled();
      expect(experienceCurationStoreMock.updateCurationDocument).toHaveBeenCalled();

      // second value is the force, which should be true
      expect(experienceCurationStoreMock.publishCurationExperience).toHaveBeenCalledWith("test-id", false);
    });
  });
});
