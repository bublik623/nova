import { config, mount, VueWrapper } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import ApiConnectionForm from "../ApiConnectionForm.vue";
import FormSection from "@/components/Document/FormSection/FormSection.vue";
import EventField from "../../components/ApiConnection/EventField.vue";

vi.mock("@/features/experience-shared/stores/useDistributionContentStore", () => ({
  useDistributionContentStore: vi.fn(() => ({
    values: {
      supplier_id: "supplier-1",
    },
  })),
}));

const stopBusMock = vi.fn();
vi.mock("@/features/experience-shared/composables/useEventBus", () => ({
  eventBusRaw: {
    on: vi.fn(() => stopBusMock),
  },
}));

const $tMock = vi.fn((s: string) => s);
vi.stubGlobal("useNuxtApp", () => ({
  $t: $tMock,
}));
config.global.mocks = {
  $t: $tMock,
};

const apiConnectionStoreMock = ref({
  fields: { event: { value: "1234", required: true, category: "api-connection" } },
  getEventById: vi.fn(),
  resetEvent: vi.fn(),
  loadEventList: vi.fn(),
  isInitialized: true,
});

vi.mock("../../stores/useRawApiConnectionStore", () => ({
  useRawApiConnectionStore: () => apiConnectionStoreMock.value,
}));

describe("ApiConnectionForm", () => {
  let wrapper: VueWrapper<any>;

  beforeEach(() => {
    wrapper = mount(ApiConnectionForm, {
      props: {
        experienceId: "experience123",
        readonly: false,
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders FormSection with correct props", () => {
    const formSection = wrapper.findComponent(FormSection);
    expect(formSection.exists()).toBe(true);
    expect(formSection.props("id")).toBe("raw-event-selection-form");
    expect(formSection.props("required")).toBe(true);
    expect(formSection.props("slotMaxWidth")).toBe(700);
    expect(formSection.props("showDescription")).toBe(true);
  });

  it("renders EventField with correct props", () => {
    const eventField = wrapper.findComponent(EventField);
    expect(eventField.exists()).toBe(true);
    expect(eventField.props("supplierId")).toBe("supplier-1");
    expect(eventField.props("appliedEvent")).toBe("1234");
  });

  it("disables editing when readonly is true", async () => {
    await wrapper.setProps({ readonly: true });
    const eventField = wrapper.findComponent(EventField);
    expect(eventField.props("readonly")).toBe(true);
  });
});
