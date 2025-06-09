import { beforeEach, describe, expect, test, vi } from "vitest";
import { useAsyncModal } from "../useAsyncModal";

const sharedApp = createApp();

vi.stubGlobal("useNuxtApp", () => ({
  $t: (text: string) => text,
  vueApp: sharedApp,
}));

describe("useAsyncConfirmModal", () => {
  beforeEach(() => {
    document.body.innerHTML = `<div id="root"></div>`;
  });

  test("modal is rendered when openModal is called", async () => {
    const component = () => h("div", { id: "foo" }, "Hello World!");

    const modal = useAsyncModal(component);

    // we deliberately not await the openModal
    // otherwise the modal would not render
    // @ts-expect-error missing props
    modal.openModal();

    await nextTick();

    expect(document.body.querySelector('[data-testid="modal"]')).toBeTruthy();
    expect(document.body.innerHTML.includes("Hello World!")).toBeTruthy();
  });

  test("we can access the application context (eg: $t)", async () => {
    const component = () =>
      h(
        "div",
        {
          onVnodeMounted: () => {
            const { $t } = useNuxtApp();

            expect(typeof $t).toBe("function");
          },
        },
        "Hello World!"
      );

    const modal = useAsyncModal(component);

    // @ts-expect-error missing props
    modal.openModal();

    await nextTick();
  });
});
