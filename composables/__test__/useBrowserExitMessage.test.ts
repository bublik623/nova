import { ref } from "vue";
import { describe, test, expect, vi, afterEach } from "vitest";
import { useBrowserExitMessage } from "../useBrowserExitMessage";
import { mockLoadComposableInApp } from "../../features/testing/utils/mock-load-composable-in-app";

const addEventListenerMock = vi.fn();
const removeEventListenerMock = vi.fn();

vi.stubGlobal("addEventListener", addEventListenerMock);
vi.stubGlobal("removeEventListener", removeEventListenerMock);

describe("useBrowserExitMessage", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("when it's enabled", () => {
    test("it should add the event listener", async () => {
      const isEnabled = ref(false);
      mockLoadComposableInApp(() => useBrowserExitMessage(isEnabled));

      isEnabled.value = true;
      await Promise.resolve();

      expect(addEventListenerMock).toHaveBeenCalled();
    });
  });

  describe("when it's disabled", () => {
    test("it should remove the event listener", async () => {
      const isEnabled = ref(true);
      mockLoadComposableInApp(() => useBrowserExitMessage(isEnabled));

      isEnabled.value = false;
      await Promise.resolve();

      expect(removeEventListenerMock).toHaveBeenCalled();
    });
  });

  describe("when it's unmounted", () => {
    test("it should remove the event listener", () => {
      const isEnabled = ref(true);
      const { app } = mockLoadComposableInApp(() => useBrowserExitMessage(isEnabled));
      // @ts-expect-error the unmount method is present
      app.unmount();
      expect(removeEventListenerMock).toHaveBeenCalled();
    });
  });
});
