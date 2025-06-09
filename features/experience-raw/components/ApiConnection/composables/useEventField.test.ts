import { describe, it, expect, beforeEach, vi } from "vitest";
import { ref, Ref } from "vue";
import { setActivePinia, createPinia } from "pinia";
import { useEventField } from "./useEventField";
import { ExperienceExternalCatalog } from "@/types/generated/ExperienceRawServiceApi";

const mockEventList = ref<ExperienceExternalCatalog[]>([]);
const mockLinkedEvent = ref<ExperienceExternalCatalog | null>(null);

vi.mock("@/features/experience-raw/stores/useRawApiConnectionStore", () => ({
  useRawApiConnectionStore: vi.fn(() => ({
    get eventList() {
      return mockEventList.value;
    },
    get linkedEvent() {
      return mockLinkedEvent.value;
    },
    getEventById: vi.fn((id) => mockEventList.value.find((event) => event.id === id)),
    resetEvent: vi.fn(),
  })),
}));

describe("useEventField composable", () => {
  let searchQuery: Ref<string>;
  let supplierId: string;
  let selectedEventId: Ref<string | undefined>;

  beforeEach(() => {
    setActivePinia(createPinia());
    searchQuery = ref("");
    supplierId = "supplier123";
    selectedEventId = ref(undefined);

    mockEventList.value = [];
    mockLinkedEvent.value = null;
  });

  it("should return empty optionsEventList when eventList is empty", () => {
    const { optionsEventList } = useEventField({ searchQuery, supplierId, selectedEventId });
    expect(optionsEventList.value).toEqual([]);
  });

  it("should map events to optionsEventList correctly", () => {
    mockEventList.value = [
      { id: "1", sip_name: "Event A", sip_id: "A1", linked: false },
      { id: "2", sip_name: "Event B", sip_id: "B2", linked: true, reference_code: "exp-1" },
    ];
    const { optionsEventList } = useEventField({ searchQuery, supplierId, selectedEventId });
    expect(optionsEventList.value).toEqual([
      { label: "Event A", code: "A1", value: "1", disabled: false, badge: undefined },
      {
        label: "Event B",
        code: "B2",
        value: "2",
        disabled: true,
        badge: { text: "Connected to exp-1", theme: "middle-grey" },
      },
    ]);
  });

  it("should set badge to 'Connected' when event matches linkedEvent", () => {
    mockEventList.value = [{ id: "1", sip_name: "Event A", sip_id: "A1", linked: false }];
    mockLinkedEvent.value = { id: "1" };
    const { optionsEventList } = useEventField({ searchQuery, supplierId, selectedEventId });
    expect(optionsEventList.value[0].badge).toEqual({ text: "Connected", theme: "solid-green" });
  });

  it("should filter events based on searchQuery", () => {
    mockEventList.value = [
      { id: "1", sip_name: "Event A", sip_id: "A1", linked: false },
      { id: "2", sip_name: "Event B", sip_id: "B2", linked: false },
    ];
    searchQuery.value = "B";
    const { filteredEventList } = useEventField({ searchQuery, supplierId, selectedEventId });
    expect(filteredEventList.value).toEqual([
      { label: "Event B", code: "B2", value: "2", disabled: false, badge: undefined },
    ]);
  });

  it("should correctly compute selectedEventOption based on store selection", () => {
    selectedEventId.value = "1";
    mockEventList.value = [
      { id: "1", sip_name: "Event A", sip_id: "A1" },
      { id: "2", sip_name: "Event B", sip_id: "B2" },
    ];
    const { selectedEventOption } = useEventField({ searchQuery, supplierId, selectedEventId });
    expect(selectedEventOption.value).toEqual({
      label: "Event A",
      value: "1",
      code: "A1",
    });
  });

  it("should return hasValidChanges as true when a different event is selected", () => {
    selectedEventId.value = "2";
    mockLinkedEvent.value = { id: "1" }; // Mock a different linked event ID
    const { hasValidChanges } = useEventField({ searchQuery, supplierId, selectedEventId });

    expect(hasValidChanges.value).toBe(true);
  });

  it("should return hasValidChanges as false when no changes are made", () => {
    selectedEventId.value = "1";
    mockLinkedEvent.value = { id: "1" }; // Same linked event ID
    const { hasValidChanges } = useEventField({ searchQuery, supplierId, selectedEventId });

    expect(hasValidChanges.value).toBe(false);
  });

  it("should return eventListLoadedForOtherSupplier as true if no events match the supplierId", () => {
    mockEventList.value = [{ id: "1", sip_name: "Event A", sip_id: "A1", supplier_id: "supplierXYZ" }];
    const { eventListLoadedForOtherSupplier } = useEventField({ searchQuery, supplierId, selectedEventId });
    expect(eventListLoadedForOtherSupplier.value).toBe(true);
  });

  it("should return eventListLoadedForOtherSupplier as false if events match the supplierId", () => {
    mockEventList.value = [{ id: "1", sip_name: "Event A", sip_id: "A1", supplier_id: "supplier123" }];
    const { eventListLoadedForOtherSupplier } = useEventField({ searchQuery, supplierId, selectedEventId });
    expect(eventListLoadedForOtherSupplier.value).toBe(false);
  });

  it("should update selectedEventRecap when selectedEventId changes", () => {
    mockEventList.value = [
      { id: "1", sip_name: "Event A", sip_id: "A1" },
      { id: "2", sip_name: "Event B", sip_id: "B2" },
    ];
    selectedEventId.value = "1";
    const { selectedEventRecap } = useEventField({ searchQuery, supplierId, selectedEventId });
    expect(selectedEventRecap.value).toEqual({ code: "A1", title: "Event A" });

    selectedEventId.value = "2";
    expect(selectedEventRecap.value).toEqual({ code: "B2", title: "Event B" });
  });

  it("should update optionsEventList when new events are added to eventList", async () => {
    mockEventList.value = [{ id: "1", sip_name: "Event A", sip_id: "A1", linked: false }];
    const { optionsEventList } = useEventField({ searchQuery, supplierId, selectedEventId });
    expect(optionsEventList.value.length).toBe(1);

    mockEventList.value.push({ id: "2", sip_name: "Event B", sip_id: "B2", linked: false });
    await nextTick();
    expect(optionsEventList.value.length).toBe(2);
  });

  it("should update hasValidChanges when selectedEventId or linkedEvent changes", async () => {
    selectedEventId.value = "2";
    mockLinkedEvent.value = { id: "1" };
    const { hasValidChanges } = useEventField({ searchQuery, supplierId, selectedEventId });
    expect(hasValidChanges.value).toBe(true);

    mockLinkedEvent.value = { id: "2" };
    await nextTick();
    expect(hasValidChanges.value).toBe(false);
  });
});
