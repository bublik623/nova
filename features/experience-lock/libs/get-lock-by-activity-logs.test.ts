import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { getLockByActivityLogs } from "./get-lock-by-activity-logs";
import { useActivityLogStore } from "@/features/experience-activity-log/stores/useActivityLogStore";
import { useAuthStore } from "@/features/auth/useAuthStore";
import { LATEST_ACTIVITY_COOLDOWN_TIME } from "../constants";

vi.mock("@/features/experience-activity-log/stores/useActivityLogStore", () => ({
  useActivityLogStore: vi.fn(),
}));

vi.mock("@/features/auth/useAuthStore", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("#app", () => ({
  useNuxtApp: () => ({
    $t: vi.fn((key: string, { placeholders }: any) => `${key} - ${placeholders.user}`),
  }),
}));

describe("getLockByActivityLogs", () => {
  const mockActivityLogStore = {
    getBySelectedCodes: vi.fn(),
  };

  const mockAuthStore = {
    userName: "",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useActivityLogStore as unknown as Mock).mockReturnValue(mockActivityLogStore);
    (useAuthStore as unknown as Mock).mockReturnValue(mockAuthStore);
  });

  it("should return locked: false if there is no last activity", () => {
    mockActivityLogStore.getBySelectedCodes.mockReturnValue({ lastActivity: null });

    const result = getLockByActivityLogs(["BASE"]);

    expect(result).toEqual({ locked: false });
  });

  it("should return locked: false if the last activity is from the current user", () => {
    mockAuthStore.userName = "currentUser";
    mockActivityLogStore.getBySelectedCodes.mockReturnValue({
      lastActivity: { user: "currentUser", action_date: new Date().toISOString() },
    });

    const result = getLockByActivityLogs(["BASE"]);

    expect(result).toEqual({ locked: false });
  });

  it("should return locked: true with a message if the last activity is within the cooldown window and from a different user", () => {
    mockAuthStore.userName = "currentUser";
    const otherUser = "otherUser";
    const recentDate = new Date(Date.now() - LATEST_ACTIVITY_COOLDOWN_TIME + 1000).toISOString();
    mockActivityLogStore.getBySelectedCodes.mockReturnValue({
      lastActivity: { user: otherUser, action_date: recentDate },
    });

    const result = getLockByActivityLogs(["BASE"]);

    expect(result).toEqual({
      locked: true,
      message: "experience.locks.warn-concurrent-users - otherUser",
    });
  });

  it("should return locked: false if the last activity is outside the cooldown window", () => {
    mockAuthStore.userName = "currentUser";
    const otherUser = "otherUser";
    const oldDate = new Date(Date.now() - LATEST_ACTIVITY_COOLDOWN_TIME - 1000).toISOString();
    mockActivityLogStore.getBySelectedCodes.mockReturnValue({
      lastActivity: { user: otherUser, action_date: oldDate },
    });

    const result = getLockByActivityLogs(["BASE"]);

    expect(result).toEqual({ locked: false });
  });
});
