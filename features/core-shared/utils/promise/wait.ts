import { promiseTimeout } from "@vueuse/core";

export function waitForTimeout(timeout: number) {
  const config = useRuntimeConfig();

  // skip timeout for unit and integration tests
  if (import.meta.env.MODE === "test" || config.public.APP_ENV === "playwright") {
    return Promise.resolve();
  }

  return promiseTimeout(timeout);
}
