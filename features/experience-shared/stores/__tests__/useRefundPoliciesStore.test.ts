import { describe, expect, test, vi } from "vitest";
import { createPinia } from "pinia";
import { useRefundPoliciesStore, ManageableRefundPolicy } from "../useRefundPoliciesStore";

const offerServiceMock = {
  getRefundPolicies: vi.fn(),
  postRefundPolicy: vi.fn(() => Promise.resolve(refundPolicies[0])),
  putRefundPolicy: vi.fn(),
  deleteRefundPolicy: vi.fn(),
};

vi.mock("@/composables/useOfferServiceApi.ts", () => ({
  useOfferServiceApi: () => offerServiceMock,
}));

const refundPolicies: ManageableRefundPolicy[] = [
  {
    id: "refund-policy-1",
    experience: "experience-id",
    period: "P5D",
    refund_type_code: "PERCENTAGE",
    value: 100,
    action: "NOOP",
  },
  {
    id: "refund-policy-2",
    experience: "experience-id",
    period: "P3D",
    refund_type_code: "PERCENTAGE",
    value: 100,
    action: "DELETE",
  },
  {
    id: "12345",
    experience: "experience-id",
    period: "P1D",
    refund_type_code: "PERCENTAGE",
    value: 100,
    action: "CREATE",
  },
  {
    id: "refund-policy-3",
    experience: "experience-id",
    period: "P2D",
    refund_type_code: "PERCENTAGE",
    value: 60,
    action: "EDIT",
  },
];

describe("useRefundPoliciesStore", () => {
  describe("actions", () => {
    describe("loadRefundPolicies", () => {
      test("it loads data and initializes the store", async () => {
        offerServiceMock.getRefundPolicies.mockResolvedValueOnce({
          data: refundPolicies,
        });

        const pinia = createPinia();
        const store = useRefundPoliciesStore(pinia);

        await store.loadRefundPolicies("experience-id");

        expect(store.isLoading).toBe(false);
        expect(store.field.value).toStrictEqual(refundPolicies.map((r) => ({ ...r, action: "NOOP" })));
      });
    });

    describe("saveRefundPolicies", () => {
      test("it should update the refund policies in the BE", async () => {
        const pinia = createPinia();
        const store = useRefundPoliciesStore(pinia);
        store.field.value = refundPolicies;

        await store.saveRefundPolicies();

        expect(offerServiceMock.postRefundPolicy).toHaveBeenCalledOnce();
        expect(offerServiceMock.postRefundPolicy).toHaveBeenCalledWith(refundPolicies[2]);
        expect(offerServiceMock.deleteRefundPolicy).toHaveBeenCalledOnce();
        expect(offerServiceMock.deleteRefundPolicy).toHaveBeenCalledWith("refund-policy-2");
        expect(offerServiceMock.putRefundPolicy).toHaveBeenCalledOnce();
        expect(offerServiceMock.putRefundPolicy).toHaveBeenCalledWith(refundPolicies[3]);
        expect(store.field.value.length).toBe(refundPolicies.length - 1);
      });
    });
  });
});
