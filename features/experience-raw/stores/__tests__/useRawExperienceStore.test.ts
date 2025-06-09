import { setActivePinia, createPinia } from "pinia";
import { useRawExperienceStore } from "../useRawExperienceStore";
import { useDistributionContentStore } from "@/features/experience-shared/stores/useDistributionContentStore";
import { useRawSettingsStore } from "../useRawSettingsStore";
import { useExperienceRawQuery } from "../../queries/experience-raw-query";
import { vi, describe, beforeEach, it, expect, MockedFunction } from "vitest";
import { useRoute } from "vue-router";
import { useExperienceRawMutation } from "../../queries/experience-raw-mutation";
import { useSendToReviewMutation } from "../../queries/send-to-review-mutation";
import { useLegacyStores } from "../useLegacyStores";

vi.mock("@/features/experience-shared/stores/useDistributionContentStore");
vi.mock("../useLegacyStores");
vi.mock("../useRawSettingsStore");
vi.mock("../useRawApiConnectionStore");
vi.mock("@/features/experience-raw/stores/usePaxesStore");
vi.mock("../../queries/experience-raw-query");
vi.mock("vue-router", () => ({
  useRoute: vi.fn(),
}));

import { useRawApiConnectionStore } from "../useRawApiConnectionStore";
import { usePaxesStore } from "../usePaxesStore";

vi.mock("../../queries/experience-raw-mutation", () => ({
  useExperienceRawMutation: vi.fn(),
}));

vi.mock("../../queries/send-to-review-mutation", () => ({
  useSendToReviewMutation: vi.fn(() => ({ mutateAsync: vi.fn() })),
}));

const notificationStoreMock = {
  addNotification: vi.fn(),
};

vi.mock("@/stores/notifications", () => ({
  useNotifications: () => notificationStoreMock,
}));

const useRouteMock = useRoute as MockedFunction<any>;

const useExperienceRawQueryMock = useExperienceRawQuery as MockedFunction<any>;
const useExperienceRawMutationMock = useExperienceRawMutation as MockedFunction<any>;

const useDistributionContentStoreMock = useDistributionContentStore as any;
const useRawSettingsStoreMock = useRawSettingsStore as any;
const useRawApiConnectionStoreMock = useRawApiConnectionStore as any;
const useLegacyStoresMock = useLegacyStores as any;
const usePaxesStoreMock = usePaxesStore as any;

const useSendToReviewMutationMock = vi.mocked<any>(useSendToReviewMutation);

describe("useRawExperienceStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    useRouteMock.mockReturnValue({
      params: { id: "123" },
    });
    useExperienceRawQueryMock.mockReturnValue({
      data: { value: { status_code: "IN_DRAFT", id: "123", experience_id: "345" } },
    });
    useDistributionContentStoreMock.mockReturnValue({
      values: { supplier_id: "supplier123" },
      isSaving: false,
      save: vi.fn().mockResolvedValue(true),
      enabled: true,
    });
    useRawSettingsStoreMock.mockReturnValue({
      values: { title: "Test Title" },
      isSaving: false,
      save: vi.fn().mockResolvedValue(true),
      enabled: true,
    });
    useLegacyStoresMock.mockReturnValue({
      save: vi.fn().mockResolvedValue(true),
      isSaving: false,
      enabled: true,
    });
    useRawApiConnectionStoreMock.mockReturnValue({
      save: vi.fn().mockResolvedValue(true),
      isSaving: false,
      enabled: false,
    });
    usePaxesStoreMock.mockReturnValue({
      save: vi.fn().mockResolvedValue(true),
      isSaving: false,
      enabled: true,
    });
  });

  it("the store should have the correct values when first invoked", () => {
    const store = useRawExperienceStore();

    expect(store.experienceTitle).toBe("Test Title");
    expect(store.hasTitleAndSupplier).toBe(true);
    expect(store.statusCode).toBe("IN_DRAFT");
    expect(store.isSaving).toBe(false);
  });

  it("should return true for isSaving if any store is saving", () => {
    useDistributionContentStoreMock.mockReturnValueOnce({
      values: { supplier_id: "supplier123" },
      isSaving: true,
      enabled: true,
      save: vi.fn().mockResolvedValue(true),
    });
    const store = useRawExperienceStore();
    expect(store.isSaving).toBe(true);
  });

  it("should return the experience title", () => {
    const store = useRawExperienceStore();
    expect(store.experienceTitle).toBe("Test Title");
  });

  it("should return true if title and supplier are present", () => {
    const store = useRawExperienceStore();
    expect(store.hasTitleAndSupplier).toBe(true);
  });

  it("should not call save on all the disabled stores when save is called", async () => {
    const store = useRawExperienceStore();
    await store.save();
    expect(useDistributionContentStore().save).toHaveBeenCalled();
    expect(useRawSettingsStore().save).toHaveBeenCalled();
    expect(useLegacyStoresMock().save).toHaveBeenCalled();
    expect(useRawApiConnectionStore().save).not.toHaveBeenCalled();
  });

  it("should call save on all the enabled stores when save is called", async () => {
    useRawApiConnectionStoreMock.mockReturnValue({
      save: vi.fn().mockResolvedValue(true),
      isSaving: false,
      enabled: true,
    });

    const store = useRawExperienceStore();
    await store.save();
    expect(useRawSettingsStore().save).toHaveBeenCalled();
    expect(useLegacyStoresMock().save).toHaveBeenCalled();
    expect(useRawApiConnectionStore().save).toHaveBeenCalled();
    expect(useDistributionContentStore().save).toHaveBeenCalled();
  });

  it('should error if raw id is missing when "save" is called', async () => {
    useExperienceRawQueryMock.mockReturnValueOnce({
      data: { value: { status_code: "SENT_TO_REVIEW", experience_id: "345" } },
    });

    const store = useRawExperienceStore();

    await expect(() => store.save()).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: Raw ID is missing]`);
  });

  it('should error if experience id is missing when "save" is called', async () => {
    useExperienceRawQueryMock.mockReturnValueOnce({
      data: { value: { status_code: "SENT_TO_REVIEW", id: "123" } },
    });

    const store = useRawExperienceStore();

    await expect(() => store.save()).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: Experience ID is missing]`);
  });

  it('should update the status code when "save" is called', async () => {
    const store = useRawExperienceStore();
    await store.save();
  });

  it("should show a notification if the request saves successfully", async () => {
    const store = useRawExperienceStore();

    await store.save();

    expect(notificationStoreMock.addNotification).toHaveBeenCalledWith({
      message: "notifications.success.saving.document",
      theme: "success",
    });
  });

  it("should throw an error if saving fails", async () => {
    const store = useRawExperienceStore();

    // @ts-expect-error Mocking a rejected promise
    useDistributionContentStore().save.mockRejectedValueOnce(new Error("Save failed"));

    await expect(() => store.save()).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: Save failed]`);
  });

  it("should show a notification if the request fails", async () => {
    const store = useRawExperienceStore();

    // @ts-expect-error Mocking a rejected promise
    useDistributionContentStore().save.mockRejectedValueOnce(new Error("Save failed"));

    try {
      await store.save();
    } catch (error) {
      // Do nothing
    }

    expect(notificationStoreMock.addNotification).toHaveBeenCalledWith({
      message: "notifications.error.saving.document",
      theme: "error",
    });
  });

  it('should not update the status code when "save" fails', async () => {
    const mutateAsyncMock = vi.fn();

    useExperienceRawMutationMock.mockReturnValue({
      isPending: ref(false),
      mutateAsync: mutateAsyncMock,
    });

    const store = useRawExperienceStore();

    // @ts-expect-error Mocking a rejected promise
    useDistributionContentStore().save.mockRejectedValueOnce(new Error("Save failed"));

    try {
      await store.save();
    } catch (error) {
      // Do nothing
    }

    expect(mutateAsyncMock).not.toHaveBeenCalled();
  });

  it('should show a success notification when "publish" is called', async () => {
    useExperienceRawMutationMock.mockReturnValue({
      isPending: ref(false),
      mutateAsync: vi.fn(),
    });

    const store = useRawExperienceStore();
    await store.publish();

    expect(notificationStoreMock.addNotification).toHaveBeenCalledWith({
      message: "notifications.success.saving.document",
      theme: "success",
    });
  });

  it('should show an error notification when "publish" fails', async () => {
    useExperienceRawMutationMock.mockReturnValue({
      isPending: ref(false),
      mutateAsync: vi.fn().mockRejectedValueOnce(new Error("Publish failed")),
    });

    const store = useRawExperienceStore();
    try {
      await store.publish();
    } catch (error) {
      // Do nothing
    }

    expect(notificationStoreMock.addNotification).toHaveBeenCalledWith({
      message: "notifications.error.saving.document",
      theme: "error",
    });
  });

  it("it should trigger the save in all the stores when publishing", async () => {
    const store = useRawExperienceStore();
    await store.publish();
    expect(useDistributionContentStore().save).toHaveBeenCalled();
    expect(useRawSettingsStore().save).toHaveBeenCalled();
    expect(useLegacyStoresMock().save).toHaveBeenCalled();
  });

  it('should send the raw to review when "publish" is called', async () => {
    const sendToReviewMutationSpy = vi.fn();
    useSendToReviewMutationMock.mockReturnValue({
      isPending: ref(false),
      mutateAsync: sendToReviewMutationSpy,
    });

    const store = useRawExperienceStore();
    await store.publish();

    expect(sendToReviewMutationSpy).toHaveBeenCalledWith("123");
  });

  it("it should not publish if the save fails", async () => {
    const mutateAsyncMock = vi.fn();

    useExperienceRawMutationMock.mockReturnValue({
      isPending: ref(false),
      mutateAsync: mutateAsyncMock,
    });

    const store = useRawExperienceStore();
    // @ts-expect-error Mocking a rejected promise
    useDistributionContentStore().save.mockRejectedValueOnce(new Error("Save failed"));

    try {
      await store.publish();
    } catch (error) {
      // Do nothing
    }

    expect(mutateAsyncMock).not.toHaveBeenCalled();
  });
});
