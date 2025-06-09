import { describe, test, expect, vi } from "vitest";
import * as configcat from "configcat-js";
import { useConfigcat } from "../useConfigCat";

vi.mock("configcat-js", () => ({
  getClient: vi.fn(() => ({
    getValueAsync: vi.fn(async (key, defaultValue) => defaultValue),
  })),
  PollingMode: { AutoPoll: "AutoPoll" },
}));

describe("useConfigcat", () => {
  test("it should initialize configCatClient correctly", async () => {
    const { configCatClient } = useConfigcat();

    expect(configcat.getClient).toHaveBeenCalledWith("test-configcat-key", configcat.PollingMode.AutoPoll, {
      pollIntervalSeconds: 60,
    });

    const defaultValue = "defaultValue";
    const value = await configCatClient.getValueAsync("anyKey", defaultValue);
    expect(value).toBe(defaultValue);
  });
});
