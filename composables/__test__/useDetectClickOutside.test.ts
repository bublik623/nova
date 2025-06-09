import { ref } from "vue";
import { describe, test, expect, vi, afterEach } from "vitest";
import { useDetectClickOutside } from "../useDetectClickOutside";
import { mockLoadComposableInApp } from "../../features/testing/utils/mock-load-composable-in-app";

const addEventListenerMock = vi.fn();
const removeEventListenerMock = vi.fn();

vi.stubGlobal("addEventListener", addEventListenerMock);
vi.stubGlobal("removeEventListener", removeEventListenerMock);

const element = ref(document.createElement("div"));
const callback = vi.fn();

describe("useDetectClickOutside", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("it should add the event listener when mounted", () => {
    mockLoadComposableInApp(() => useDetectClickOutside(element, callback));

    expect(addEventListenerMock).toHaveBeenCalled();
  });

  test("it should remove the event listener when unmounted", () => {
    const { app } = mockLoadComposableInApp(() => useDetectClickOutside(element, callback));

    expect(addEventListenerMock).toHaveBeenCalled();
    // @ts-expect-error the unmount method is present
    app.unmount();
    expect(removeEventListenerMock).toHaveBeenCalled();
  });
});
