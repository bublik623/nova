import { describe, it, expect, vi } from "vitest";
import { waitForTimeout } from "../wait";
import { beforeAll } from "vitest";
import { afterAll } from "vitest";

const testDuration = 5000; // 5 seconds

describe(
  "waitForTimeout",
  () => {
    describe("unit tests", () => {
      beforeAll(() => {
        vi.stubGlobal("useRuntimeConfig", () => ({ public: { APP_ENV: "test" } }));
      });

      afterAll(() => {
        vi.unstubAllGlobals();
      });

      it("should not wait for timeout in vitest", async () => {
        vi.stubEnv("MODE", "test");
        const promise = await waitForTimeout(testDuration);

        await expect(promise).toBeUndefined();
      });
    });
    describe("playwright", () => {
      beforeAll(() => {
        vi.stubEnv("MODE", "not-test");
        vi.stubGlobal("useRuntimeConfig", () => ({ public: { APP_ENV: "playwright" } }));
      });
      afterAll(() => {
        vi.unstubAllEnvs();
        vi.unstubAllGlobals();
      });
      it("should not wait for timeout in playwright tests", async () => {
        const promise = await waitForTimeout(testDuration);

        await expect(promise).toBeUndefined();
      });
    });

    describe("for production", () => {
      beforeAll(() => {
        vi.stubGlobal("useRuntimeConfig", () => ({ public: { APP_ENV: "production" } }));
        vi.stubEnv("MODE", "production");
        vi.useFakeTimers();
      });

      afterAll(() => {
        vi.unstubAllEnvs();
        vi.useRealTimers();
        vi.unstubAllGlobals();
      });

      it("should wait for the specified time", async () => {
        const promise = waitForTimeout(testDuration);

        // Fast-forward time by 5 seconds
        vi.advanceTimersByTime(testDuration);

        await expect(promise).resolves.toBeUndefined();
      });
    });
  },

  { timeout: 300 } // test will also fail if we wait for more than the timeout
);
