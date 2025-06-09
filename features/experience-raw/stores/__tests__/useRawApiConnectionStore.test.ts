import { setActivePinia, createPinia } from "pinia";
import { useDistributionContentStore } from "@/features/experience-shared/stores/useDistributionContentStore";
import { vi, describe, beforeEach, it, expect, MockedFunction } from "vitest";
import {
  useExternalExperiencesQuery,
  useExternalLinkedExperienceQuery,
} from "../../queries/external-experiences-query";
import { useRawApiConnectionStore } from "../useRawApiConnectionStore";
import { flushPromises } from "@vue/test-utils";
import { useExternalLinkedExperienceMutation } from "../../queries/external-experiences-mutation";

vi.mock("@/features/experience-shared/stores/useDistributionContentStore");
vi.mock("../../queries/external-experiences-query.ts");
vi.mock("../../queries/external-experiences-mutation.ts");
const mockGetExternalExperiences = vi.fn();
const mockAddNotification = vi.fn();
const mockLinkExternalExperience = vi.fn().mockResolvedValue(true);
const mockUnlinkExternalExperience = vi.fn().mockResolvedValue(true);

describe("useRawApiConnectionStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    mockExternalExperiencesQuery.mockReturnValue({
      refetch: mockGetExternalExperiences,
      data: { value: [{ id: "1", sip_name: "Event 1" }] },
      isLoading: { value: false },
    });

    mockExternalLinkedExperienceQuery.mockReturnValue({
      refetch: vi.fn().mockResolvedValue(true),
      data: { value: { id: "2", sip_name: "Linked Event" } },
      suspense: vi.fn().mockResolvedValue(true),
    });

    mockExternalLinkedExperienceMutation.mockReturnValue({
      link: { mutateAsync: mockLinkExternalExperience },
      unlink: { mutateAsync: mockUnlinkExternalExperience },
      isLoading: { value: false },
    });

    useDistributionContentStoreMock.mockReturnValue({
      values: { supplier_id: "supplier123", id: "experience123" },
      isSaving: false,
      save: vi.fn().mockResolvedValue(true),
    });

    vi.mock("@/stores/notifications", () => ({
      useNotifications: () => ({
        addNotification: mockAddNotification,
      }),
    }));
  });

  const mockExternalExperiencesQuery = useExternalExperiencesQuery as MockedFunction<any>;
  const mockExternalLinkedExperienceQuery = useExternalLinkedExperienceQuery as MockedFunction<any>;
  const mockExternalLinkedExperienceMutation = useExternalLinkedExperienceMutation as MockedFunction<any>;
  const useDistributionContentStoreMock = useDistributionContentStore as any;

  it("the store should have the correct values when first invoked", () => {
    const store = useRawApiConnectionStore();

    expect(store.fields.event.value).toBe("2");
    expect(store.isLoadingEvents).toBe(false);
    expect(store.isSaving).toBe(false);
    expect(store.eventList).toEqual([{ id: "1", sip_name: "Event 1" }]);
  });

  it("loads the event list successfully", async () => {
    const store = useRawApiConnectionStore();
    const mockData = [{ id: "1", sip_name: "Event 1" }];
    mockGetExternalExperiences.mockResolvedValueOnce({ data: mockData });

    await store.loadEventList();

    expect(store.isLoadingEvents).toBe(false);
    expect(store.eventList).toEqual(mockData);
    expect(mockAddNotification).not.toHaveBeenCalledWith({
      message: "notifications.error.fetching.external-experiences",
      theme: "error",
    });
  });

  it("handles error while loading the event list", async () => {
    const store = useRawApiConnectionStore();

    mockGetExternalExperiences.mockImplementationOnce(() => Promise.reject(new Error("API error")));

    await store.loadEventList();

    expect(store.isLoadingEvents).toBe(false);
    expect(store.eventList).toEqual([{ id: "1", sip_name: "Event 1" }]);
    expect(mockAddNotification).toHaveBeenCalledWith({
      theme: "error",
      message: "notifications.error.fetching.external-experiences",
    });
  });

  it("loads a linked event successfully", async () => {
    mockExternalLinkedExperienceQuery.mockReturnValueOnce({
      data: { value: { id: "3", sip_name: "Linked Event3" } },
      suspense: vi.fn().mockResolvedValue(true),
    });

    const store = useRawApiConnectionStore();
    expect(store.fields.event.value).toEqual("3");
    expect(mockAddNotification).not.toHaveBeenCalled();
  });

  it("handles error while loading a linked event when ID changes", async () => {
    mockExternalLinkedExperienceQuery.mockReturnValueOnce({
      data: { value: null },
      suspense: vi.fn().mockRejectedValue(new Error("Error fetching linked experience")),
    });

    const store = useRawApiConnectionStore();
    const distributionContentStore = useDistributionContentStore();
    distributionContentStore.values.id = "new-experience-id";

    await flushPromises();

    expect(store.fields.event.value).toBeUndefined();
    expect(mockAddNotification).toHaveBeenCalledWith({
      theme: "error",
      message: "notifications.error.fetching.external-linked-experience",
    });
  });

  it("resets the event to the linked event ID", () => {
    const store = useRawApiConnectionStore();
    store.fields.event.value = "some-other-id";

    store.resetEvent();

    expect(store.fields.event.value).toBe("2");
  });

  it("retrieves an event by ID from eventList or linkedEvent", () => {
    const store = useRawApiConnectionStore();
    const event1 = { id: "1", sip_name: "Event 1" };
    const linkedEvent = { id: "2", sip_name: "Linked Event" };

    expect(store.getEventById("1")).toEqual(event1);
    expect(store.getEventById("2")).toEqual(linkedEvent);
    expect(store.getEventById("nonexistent")).toBeUndefined();
  });

  it("should be enabled if the experience_source is SIP", () => {
    const store = useRawApiConnectionStore();
    const distributionContentStore = useDistributionContentStore();
    distributionContentStore.values.experience_source = "SIP";

    expect(store.enabled).toBe(true);
  });

  it("should not be enabled if the experience_source is not SIP", () => {
    const store = useRawApiConnectionStore();
    const distributionContentStore = useDistributionContentStore();
    distributionContentStore.values.experience_source = "NOVA";

    expect(store.enabled).toBe(false);
  });

  it("should not be initialized when the queries are loading", async () => {
    mockExternalLinkedExperienceQuery.mockReturnValueOnce({
      data: { value: undefined },
      suspense: vi.fn().mockResolvedValue(true),
      isLoading: { value: true },
    });

    const store = useRawApiConnectionStore();
    await flushPromises();
    expect(store.isInitialized).toBe(false);
  });

  it("should be initialized when the queries are loaded", async () => {
    mockExternalLinkedExperienceQuery.mockReturnValueOnce({
      data: { value: undefined },
      suspense: vi.fn().mockResolvedValue(true),
      isLoading: { value: false },
    });

    const store = useRawApiConnectionStore();
    await flushPromises();
    expect(store.isInitialized).toBe(true);
  });

  it("should have hasChanges true if the linked experience is different from the selected one", () => {
    const store = useRawApiConnectionStore();
    store.fields.event.value = "different-event-id";

    expect(store.hasChanges).toBe(true);
  });

  it("should have hasChanges false if the linked experience and the selected one are the same", () => {
    mockExternalLinkedExperienceQuery.mockReturnValueOnce({
      data: { value: { id: "linked-evt", sip_name: "Linked Event" } },
      suspense: vi.fn().mockResolvedValue(true),
    });

    const store = useRawApiConnectionStore();
    store.fields.event.value = "linked-evt";

    expect(store.hasChanges).toBe(false);
  });

  describe("save action", () => {
    it("calls the unlink mutation with correct parameters", async () => {
      mockExternalLinkedExperienceQuery.mockReturnValueOnce({
        data: { value: { id: "linked-event-id" } },
        suspense: vi.fn().mockResolvedValue(true),
      });

      const store = useRawApiConnectionStore();
      await flushPromises();
      store.fields.event.value = undefined;

      await store.save();

      expect(mockUnlinkExternalExperience).toHaveBeenCalledWith({
        eventId: "linked-event-id",
      });
    });

    it("calls the link mutation without the event to remove if no events was linked before", async () => {
      mockExternalLinkedExperienceQuery.mockReturnValueOnce({
        data: { value: undefined },
        suspense: vi.fn().mockResolvedValue(true),
      });
      const distributionContentStore = useDistributionContentStore();
      const store = useRawApiConnectionStore();
      distributionContentStore.values.reference_code = "ref-code-distribution";
      await flushPromises();
      store.fields.event.value = "new-event-id";

      await store.save();

      expect(mockLinkExternalExperience).toHaveBeenCalledWith({
        eventId: "new-event-id",
        experienceId: "experience123",
        experienceRefCode: "ref-code-distribution",
        previousLinkToRemove: undefined,
      });
    });

    it("calls the link mutation with the event to remove if an events was already linked", async () => {
      mockExternalLinkedExperienceQuery.mockReturnValueOnce({
        data: { value: { id: "old-event-id" } },
        suspense: vi.fn().mockResolvedValue(true),
      });
      const distributionContentStore = useDistributionContentStore();
      const store = useRawApiConnectionStore();
      distributionContentStore.values.reference_code = "ref-code-distribution";
      await flushPromises();
      store.fields.event.value = "new-event-id";

      await store.save();

      expect(mockLinkExternalExperience).toHaveBeenCalledWith({
        eventId: "new-event-id",
        experienceId: "experience123",
        experienceRefCode: "ref-code-distribution",
        previousLinkToRemove: "old-event-id",
      });
    });
  });
});
