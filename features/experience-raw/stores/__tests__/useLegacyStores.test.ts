import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useLegacyStores } from "../useLegacyStores";
import { useRefundPoliciesStore } from "@/features/experience-shared/stores/useRefundPoliciesStore";
import { useExperienceRaw, getOfferExperiencePayload } from "@/stores/experience-raw";
import { useBookingInformationStore } from "@/features/experience-shared/stores/useBookingInformationStore";
import { useExperienceLocationStore } from "@/features/experience-shared/stores/useExperienceLocationStore";
import { useRoute } from "vue-router";
import { useActivityLogStore } from "@/features/experience-activity-log/stores/useActivityLogStore";

vi.mock("@/stores/experience-raw");
vi.mock("@/features/experience-shared/stores/useRefundPoliciesStore");
vi.mock("@/features/experience-shared/stores/useBookingInformationStore");
vi.mock("@/features/experience-shared/stores/useExperienceLocationStore");
vi.mock("@/features/experience-activity-log/stores/useActivityLogStore");

vi.mock("vue-router", () => ({
  useRoute: vi.fn(),
}));

describe("useLegacyStores", () => {
  const useExperienceLocationStoreMock = useExperienceLocationStore as any;
  const useRefundPoliciesStoreMock = useRefundPoliciesStore as any;
  const useBookingInformationStoreMock = useBookingInformationStore as any;
  const useActivityLogStoreMock = useActivityLogStore as any;
  const useExperienceRawMock = useExperienceRaw as any;
  const getOfferExperiencePayloadMock = getOfferExperiencePayload as Mock;

  const useRouteMock = useRoute as any;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    useExperienceLocationStoreMock.mockReturnValue({
      $reset: vi.fn(),
      loadLocation: vi.fn(),
    });
    useRefundPoliciesStoreMock.mockReturnValue({
      $reset: vi.fn(),
      saveRefundPolicies: vi.fn(),
      loadRefundPolicies: vi.fn(),
    });
    useBookingInformationStoreMock.mockReturnValue({
      $reset: vi.fn(),
      loadBookingInfo: vi.fn(),
    });
    useActivityLogStoreMock.mockReturnValue({
      $reset: vi.fn(),
    });
    useExperienceRawMock.mockReturnValue({
      updateRawDocument: vi.fn(),
      saveSupplierId: vi.fn(),
      getRawDocument: vi.fn(),
      refetchOptions: vi.fn(),
      rawContents: {
        ["123"]: "myVal",
      },
    });

    getOfferExperiencePayloadMock.mockImplementation(() => ({}));
  });

  it("initializes with default values", () => {
    const store = useLegacyStores();
    expect(store.hasChanges).toBe(false);
    expect(store.isSaving).toBe(false);
  });

  it("resets all stores", () => {
    const store = useLegacyStores();
    store.$reset();
    expect(useRefundPoliciesStore().$reset).toHaveBeenCalled();
    expect(useBookingInformationStore().$reset).toHaveBeenCalled();
    expect(useExperienceLocationStore().$reset).toHaveBeenCalled();
    expect(useActivityLogStore().$reset).toHaveBeenCalled();
  });

  it('it updates the experience correctly in the "experience-id-raw-api-connection" page', async () => {
    useRouteMock.mockReturnValueOnce({ name: "experience-id-raw-api-connection", params: { id: "123" } });

    const store = useLegacyStores();

    store.hasChanges = true;

    await store.save();

    expect(store.isSaving).toBe(false);
    expect(store.hasChanges).toBe(false);

    expect(useExperienceRaw().updateRawDocument).toHaveBeenCalled();
  });

  it('it updates the experience correctly in the "experience-id-raw-pricing-and-availability" page', async () => {
    useRouteMock.mockReturnValueOnce({ name: "experience-id-raw-pricing-and-availability", params: { id: "123" } });

    const store = useLegacyStores();

    store.hasChanges = true;

    await store.save();

    expect(store.isSaving).toBe(false);
    expect(store.hasChanges).toBe(false);

    expect(useExperienceRaw().updateRawDocument).toHaveBeenCalledWith("123");
    expect(useExperienceRaw().saveSupplierId).toHaveBeenCalledWith("123", {});
    expect(useRefundPoliciesStore().saveRefundPolicies).toHaveBeenCalled();
  });

  it("it updates the experience correctly in any other page", async () => {
    useRouteMock.mockReturnValueOnce({ name: "experience-id-raw-other", params: { id: "123" } });

    const store = useLegacyStores();

    store.hasChanges = true;

    await store.save();

    expect(store.isSaving).toBe(false);
    expect(store.hasChanges).toBe(false);

    expect(useExperienceRaw().updateRawDocument).toHaveBeenCalledWith("123");
  });

  it("does not save if there are no changes", async () => {
    const store = useLegacyStores();
    store.hasChanges = false;

    await store.save();

    expect(store.isSaving).toBe(false);
    expect(useExperienceRaw().updateRawDocument).not.toHaveBeenCalled();
  });

  it("resets the hasChanges and isSaving flags after saving", async () => {
    useRouteMock.mockReturnValueOnce({ name: "experience-id-raw-other", params: { id: "123" } });
    const store = useLegacyStores();
    store.hasChanges = true;

    await store.save();

    expect(store.isSaving).toBe(false);
    expect(store.hasChanges).toBe(false);
  });

  it("should be enabled", () => {
    const store = useLegacyStores();

    expect(store.enabled).toBe(true);
  });
});
