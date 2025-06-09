import { describe, it, expect, vi, test, beforeEach } from "vitest";
import { useUnsavedChanges } from "@/features/experience-calendar/composables/useUnsavedChanges";
import * as useAsyncConfirmModalModule from "@/features/core-shared/composables/useAsyncConfirmModal";

vi.stubGlobal("useNuxtApp", () => ({ $t: (s: string) => s }));
vi.mock("@/features/core-shared/composables/useAsyncConfirmModal");
vi.mock("@/features/core-shared/composables/useAsyncConfirmModal", () => ({
  useAsyncConfirmModal: vi.fn(() => ({
    openModal: vi.fn(),
  })),
}));

const confirmModalMock = { openModal: vi.fn() };
vi.spyOn(useAsyncConfirmModalModule, "useAsyncConfirmModal").mockImplementation(() => confirmModalMock);

const triggerOnBeforeRouteUpdate = ref<(to: { path: string }, from: { path: string }) => Promise<any>>(() =>
  Promise.resolve()
);
const onBeforeRouteUpdateMock = vi.fn(async (cb) => {
  triggerOnBeforeRouteUpdate.value = cb;
});

vi.stubGlobal("onBeforeRouteUpdate", onBeforeRouteUpdateMock);

const triggerOnBeforeRouteLeave = ref<(to: { path: string }, from: { path: string }) => Promise<any>>(() =>
  Promise.resolve()
);
const onBeforeRouteLeaveMock = vi.fn(async (cb) => {
  triggerOnBeforeRouteLeave.value = cb;
});

vi.stubGlobal("onBeforeRouteLeave", onBeforeRouteLeaveMock);

describe("useUnsavedChanges", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("when the destination route path and the origin route path differ", () => {
    it("if there are no unsaved changes it shouldn't open modal", async () => {
      const confirmCallback = vi.fn();
      const cancelCallback = vi.fn();

      const { hasUnsavedChanges } = useUnsavedChanges({ confirmCallback });
      hasUnsavedChanges.value = false;

      // manually trigger onBeforeRouteLeave
      await triggerOnBeforeRouteLeave.value({ path: "destination/route/path" }, { path: "origin/route/path" });

      expect(confirmModalMock.openModal).not.toHaveBeenCalled();
      expect(confirmCallback).not.toHaveBeenCalled();
      expect(cancelCallback).not.toHaveBeenCalled();
    });

    it("calls confirmCallback on confirm", async () => {
      const confirmCallback = vi.fn();
      const cancelCallback = vi.fn();
      confirmModalMock.openModal.mockResolvedValue(true); //accept the modal

      const { hasUnsavedChanges } = useUnsavedChanges({ confirmCallback });
      hasUnsavedChanges.value = true;

      // manually trigger onBeforeRouteLeave
      await triggerOnBeforeRouteLeave.value({ path: "destination/route/path" }, { path: "origin/route/path" });

      expect(confirmModalMock.openModal).toHaveBeenCalled();
      expect(confirmCallback).toHaveBeenCalled();
      expect(cancelCallback).not.toHaveBeenCalled();
    });

    it("calls cancelCallback on cancel", async () => {
      const confirmCallback = vi.fn();
      const cancelCallback = vi.fn();
      confirmModalMock.openModal.mockResolvedValue(false); // cancel the modal

      const { hasUnsavedChanges } = useUnsavedChanges({ confirmCallback, cancelCallback });
      hasUnsavedChanges.value = true;

      // manually trigger onBeforeRouteLeave
      await triggerOnBeforeRouteLeave.value({ path: "destination/route/path" }, { path: "origin/route/path" });

      expect(confirmModalMock.openModal).toHaveBeenCalled();
      expect(cancelCallback).toHaveBeenCalled();
      expect(confirmCallback).not.toHaveBeenCalled();
    });
  });

  describe("when the destination route path and the origin route path are the same", () => {
    test("it shouldn't open modal, even if there are unsaved changes", async () => {
      const confirmCallback = vi.fn();
      const cancelCallback = vi.fn();

      const { hasUnsavedChanges } = useUnsavedChanges({ confirmCallback });
      hasUnsavedChanges.value = true;

      // manually trigger onBeforeRouteLeave
      await triggerOnBeforeRouteLeave.value({ path: "/same/route/path" }, { path: "/same/route/path" });

      expect(confirmModalMock.openModal).not.toHaveBeenCalled();
      expect(confirmCallback).not.toHaveBeenCalled();
      expect(cancelCallback).not.toHaveBeenCalled();
    });
  });
});
