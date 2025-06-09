import { describe, it, expect } from "vitest";
import { removeSystemActivityLogs } from "./remove-system-activities";
import { SYSTEM_USER } from "@/features/experience-lock/constants";

describe("removeSystemActivityLogs", () => {
  it("should remove logs with the SYSTEM_USER", () => {
    const logs = [
      { user: "user1", message: "Log 1" },
      { user: SYSTEM_USER, message: "Log 2" },
      { user: "user2", message: "Log 3" },
    ];

    const result = removeSystemActivityLogs(logs);

    expect(result).toEqual([
      { user: "user1", message: "Log 1" },
      { user: "user2", message: "Log 3" },
    ]);
  });

  it("should return the same logs if no SYSTEM_USER logs are present", () => {
    const logs = [
      { user: "user1", message: "Log 1" },
      { user: "user2", message: "Log 2" },
    ];

    const result = removeSystemActivityLogs(logs);

    expect(result).toEqual(logs);
  });

  it("should return an empty array if all logs are from SYSTEM_USER", () => {
    const logs = [
      { user: SYSTEM_USER, message: "Log 1" },
      { user: SYSTEM_USER, message: "Log 2" },
    ];

    const result = removeSystemActivityLogs(logs);

    expect(result).toEqual([]);
  });

  it("should handle an empty logs array", () => {
    const logs: { user: string; message: string }[] = [];

    const result = removeSystemActivityLogs(logs);

    expect(result).toEqual([]);
  });
});
