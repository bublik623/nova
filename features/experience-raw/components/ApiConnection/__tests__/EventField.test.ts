import { config, mount, VueWrapper } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach, MockedFunction } from "vitest";
import NovaSelectSearch from "@/ui-kit/NovaSelectSearch/NovaSelectSearch.vue";
import EventFieldRecap from "../EventFieldRecap.vue";
import { useRawApiConnectionStore } from "@/features/experience-raw/stores/useRawApiConnectionStore";
import EventField from "../EventField.vue";
import { createTestingPinia } from "@pinia/testing";
import { nextTick } from "vue";
import {
  useExternalExperiencesQuery,
  useExternalLinkedExperienceQuery,
} from "@/features/experience-raw/queries/external-experiences-query";
import { useDistributionContentStore } from "@/features/experience-shared/stores/useDistributionContentStore";

vi.mock("@/features/experience-shared/stores/useDistributionContentStore");
vi.mock("@/features/experience-raw/queries/external-experiences-query");
vi.mock("@/features/experience-raw/queries/external-experiences-mutation");

const mockExternalExperiencesQuery = useExternalExperiencesQuery as MockedFunction<any>;
const mockExternalLinkedExperienceQuery = useExternalLinkedExperienceQuery as MockedFunction<any>;

const useDistributionContentStoreMock = useDistributionContentStore as any;

const mountComponent = (props = {}) => {
  return mount(EventField, {
    props: {
      appliedEvent: "1234",
      supplierId: "supplier-1",
      ...props,
    },
    global: {
      plugins: [createTestingPinia()],
    },
  });
};

const $tMock = vi.fn((s: string) => s);
vi.stubGlobal("useNuxtApp", () => ({
  $t: $tMock,
}));
config.global.mocks = {
  $t: $tMock,
};

const selectors = {
  cancelButton: '[data-testid="raw-event-selection-field-cancel"]',
  saveButton: '[data-testid="raw-event-selection-field-save"]',
  editButton: '[data-testid="raw-event-selection-field-edit"]',
};

describe("EventField", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockExternalExperiencesQuery.mockReturnValue({
      refetch: vi.fn(),
      data: { value: [{ id: "1", sip_name: "Event 1" }] },
      isLoading: { value: false },
    });

    mockExternalLinkedExperienceQuery.mockReturnValue({
      refetch: vi.fn().mockResolvedValue(true),
      data: { value: undefined },
      suspense: vi.fn().mockResolvedValue(true),
    });

    useDistributionContentStoreMock.mockReturnValue({
      values: { supplier_id: "supplier123", id: "experience123" },
      isSaving: false,
      save: vi.fn().mockResolvedValue(true),
    });
  });

  it("renders the EventFieldRecap component when isEditable is false", () => {
    const wrapper = mountComponent({ isEditable: false });
    expect(wrapper.findComponent(EventFieldRecap).exists()).toBe(true);
    expect(wrapper.find(selectors.editButton).exists()).toBe(true);
  });

  it("renders the NovaSelectSearch component when isEditable is true after clicking edit button", async () => {
    const wrapper = mountComponent();
    await wrapper.find(selectors.editButton).trigger("click");
    await nextTick();

    expect(wrapper.findComponent(NovaSelectSearch as any).exists()).toBe(true);
    expect(wrapper.find(selectors.cancelButton).exists()).toBe(true);
    expect(wrapper.find(selectors.saveButton).exists()).toBe(true);
  });

  it("calls handleCancel and hides the NovaSelectSearch component", async () => {
    const wrapper: VueWrapper<any> = mountComponent();
    const apiConnectionStore = useRawApiConnectionStore();
    await wrapper.find(selectors.editButton).trigger("click");
    await nextTick();

    await wrapper.find(selectors.cancelButton).trigger("click");
    await nextTick();

    expect(apiConnectionStore.resetEvent).toHaveBeenCalled();
    expect(wrapper.vm.isEditable).toBe(false);
    expect(wrapper.findComponent(NovaSelectSearch as any).isVisible()).toBe(false);
  });

  it("calls handleSave and emits 'update:appliedEvent' with the selected option value", async () => {
    const wrapper = mountComponent();

    await wrapper.find(selectors.editButton).trigger("click");
    await nextTick();

    const selectSearch = wrapper.findComponent(NovaSelectSearch as any);
    expect(selectSearch.exists()).toBe(true);

    const option = { value: "new-event", label: "New Event" };
    await selectSearch.vm.$emit("select:option", option);
    await nextTick();

    await wrapper.find(selectors.saveButton).trigger("click");
    await nextTick();

    expect(wrapper.emitted("update:appliedEvent")).toBeTruthy();
    expect(wrapper.emitted("update:appliedEvent")?.[0]).toEqual(["new-event"]);
  });

  it("loads event list when handleEventEdit is triggered and eventList is empty", async () => {
    const wrapper: VueWrapper<any> = mountComponent();
    const apiConnectionStore = useRawApiConnectionStore();
    apiConnectionStore.eventList = [];

    await wrapper.find(selectors.editButton).trigger("click");

    expect(apiConnectionStore.loadEventList).toHaveBeenCalled();
    expect(wrapper.vm.isEditable).toBe(true);
  });
});
