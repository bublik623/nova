import { test, expect, describe, beforeEach } from "vitest";
import { useAsyncConfirmModal } from "../useAsyncConfirmModal";
import { testId } from "@/utils/test.utils";

const props = {
  ctaCancelText: "Cancel",
  ctaConfirmText: "Ok",
  description: "Lorem ipsum dolor sit amet",
  title: "Attention!",
};

describe("useAsyncConfirmModal", () => {
  beforeEach(() => {
    document.body.innerHTML = `<div id="root"></div>`;
  });

  test("modal is rendered when openModal is called", async () => {
    const { openModal } = useAsyncConfirmModal(props);
    openModal();

    await nextTick();

    expect(document.body.querySelector('[data-testid="modal"]')).toBeTruthy();
  });

  test("openModal returns a promise that resolves to true when confirm is called", async () => {
    const { openModal } = useAsyncConfirmModal(props);

    const modalPromise = openModal();

    await nextTick();

    document.body.querySelector<HTMLElement>(testId("modal-save-btn"))?.click();

    expect(await modalPromise).toBe(true);
  });

  test("openModal returns a promise that resolves to false when cancel is called", async () => {
    const { openModal } = useAsyncConfirmModal(props);

    const modalPromise = openModal();

    await nextTick();

    document.body.querySelector<HTMLElement>("button:nth-child(1)")?.click();

    expect(await modalPromise).toBe(false);
  });

  test("modal is removed from DOM when cancel or confirm is called", async () => {
    const { openModal } = useAsyncConfirmModal(props);

    openModal();
    await nextTick();
    document.body.querySelector<HTMLElement>(testId("modal-save-btn"))?.click();

    await nextTick();

    // The fade out animation has started...
    expect(
      document.body.querySelector('[data-testid="modal"]')?.classList.contains("Modal__transition-leave-active")
    ).toBe(true);

    openModal();
    await nextTick();
    document.body.querySelector<HTMLElement>(testId("modal-leave-btn"))?.click();

    await nextTick();

    // The fade out animation has started...
    expect(
      document.body.querySelector('[data-testid="modal"]')?.classList.contains("Modal__transition-leave-active")
    ).toBe(true);
  });
});
