import { describe, test, expect, vi } from "vitest";
import { datadogRum } from "@datadog/browser-rum";
import { useLogger } from "../useLogger";
import { UserFlow } from "@/types/Datadog";

const spy = vi.spyOn(datadogRum, "addError");
const testError = new Error("test-error");

describe("useLogger", () => {
  describe("logError", () => {
    const { logError } = useLogger();

    test("it should log a custom datadog error with the correct message", () => {
      logError("create-raw", testError);
      expect(spy).toHaveBeenCalledWith(new Error("Error while creating raw experience"), { originalError: testError });
      logError("not-valid" as UserFlow, testError);
      expect(spy).toHaveBeenCalledWith(new Error("Unknown error"), {
        originalError: testError,
      });
    });
  });
});
