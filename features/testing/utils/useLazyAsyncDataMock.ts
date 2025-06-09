import { vi } from "vitest";

export function createLazyAsyncDataMock<T>() {
  return vi.fn<
    (
      key: string,
      handler: () => Promise<T>,
      options: { immediate: boolean }
    ) => Promise<{
      data: Ref<T | undefined>;
      refresh: () => Promise<void>;
      status: Ref<"idle" | "pending" | "success" | "error">;
    }>
  >(async (key: string, handler: () => Promise<T>, options: { immediate: boolean }) => {
    const dataRef = ref<T>();
    const statusRef = ref<"idle" | "pending" | "success" | "error">("idle");
    const updateDataRefFn = async () => {
      statusRef.value = "pending";
      dataRef.value = await handler();
      statusRef.value = "success";
    };

    if (options?.immediate) {
      updateDataRefFn();
    }

    return { data: dataRef, refresh: updateDataRefFn, status: statusRef };
  });
}
