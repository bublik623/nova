import { describe, test, vi, expect, beforeEach } from "vitest";
import { usePublishModals } from "@/features/experience-shared/composables/usePublishModals";
import * as useAsyncModalModule from "@/features/core-shared/composables/useAsyncModal";
import * as useAsyncConfirmModalModule from "@/features/core-shared/composables/useAsyncConfirmModal";
import * as getExperienceStateModule from "@/features/experience-shared/utils/get-experience-state";

vi.mock("@/features/core-shared/composables/useAsyncModal");
vi.mock("@/features/core-shared/composables/useAsyncConfirmModal");
vi.stubGlobal("useNuxtApp", () => ({ $t: (s: string) => s }));
vi.stubGlobal("useNuxtData", () => ({}));

const modalMock = { openModal: vi.fn() };
const confirmModalMock = { openModal: vi.fn() };
vi.spyOn(useAsyncModalModule, "useAsyncModal").mockImplementation(() => modalMock);
vi.spyOn(useAsyncConfirmModalModule, "useAsyncConfirmModal").mockImplementation(() => confirmModalMock);

const getDistributionStateSpy = vi.spyOn(getExperienceStateModule, "getDistributionState");
getDistributionStateSpy.mockReturnValue("ready");

describe("usePublishModals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("when distribution state is unpublished show republish modal", () => {
    test("should return isAccepted false if user clicks cancel", async () => {
      getDistributionStateSpy.mockReturnValue("unpublished");
      modalMock.openModal.mockResolvedValue(false);

      const { confirmPublishAction } = usePublishModals();
      const { isAccepted, shouldForce } = await confirmPublishAction("test-id");

      expect(isAccepted).toBe(false);
      expect(shouldForce).toBe(false);
    });

    test("should return isAccepted true and shouldForce true if user clicks submit", async () => {
      getDistributionStateSpy.mockReturnValue("unpublished");
      modalMock.openModal.mockResolvedValue(true);

      const { confirmPublishAction } = usePublishModals();
      const { isAccepted, shouldForce } = await confirmPublishAction("test-id");

      expect(isAccepted).toBe(true);
      expect(shouldForce).toBe(false);
    });

    test("should return isAccepted true and shouldForce true if user clicks publish", async () => {
      getDistributionStateSpy.mockReturnValue("unpublished");
      modalMock.openModal.mockResolvedValue(true);

      const { confirmPublishAction } = usePublishModals();
      const { isAccepted, shouldForce } = await confirmPublishAction("test-id");

      expect(isAccepted).toBe(true);
      expect(shouldForce).toBe(false);
    });
  });

  describe("when distribution state is in_review show publish new version modal", () => {
    test("should return isAccepted false if user clicks cancel", async () => {
      getDistributionStateSpy.mockReturnValue("in_review");
      confirmModalMock.openModal.mockResolvedValue(false);

      const { confirmPublishAction } = usePublishModals();
      const { isAccepted, shouldForce } = await confirmPublishAction("test-id");

      expect(isAccepted).toBe(false);
      expect(shouldForce).toBe(false);
    });

    test("should return isAccepted true if user clicks confirm", async () => {
      getDistributionStateSpy.mockReturnValue("in_review");
      confirmModalMock.openModal.mockResolvedValue(true);

      const { confirmPublishAction } = usePublishModals();
      const { isAccepted, shouldForce } = await confirmPublishAction("test-id");

      expect(isAccepted).toBe(true);
      expect(shouldForce).toBe(false);
    });
  });
});
