import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useExperienceLockStore } from "./useExperienceLockStore";
import { useFeatureFlag } from "@/features/experience-shared/composables/useFeatureFlag";
import { getLockByActivityLogs } from "../libs/get-lock-by-activity-logs";

vi.mock("@/features/experience-shared/composables/useFeatureFlag", () => ({
  useFeatureFlag: vi.fn(),
}));

vi.mock("../libs/get-lock-by-activity-logs", () => ({
  getLockByActivityLogs: vi.fn(),
}));

describe("useExperienceLockStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("should return an empty map when the feature flag is disabled", () => {
    (useFeatureFlag as Mock).mockReturnValue(false);

    const store = useExperienceLockStore();
    expect(store.locks.size).toBe(0);
  });

  it("should populate locks when the feature flag is enabled and locks are active", () => {
    (useFeatureFlag as Mock).mockReturnValue(true);
    (getLockByActivityLogs as Mock)
      .mockImplementationOnce(() => ({ locked: true, message: "Base lock active" }))
      .mockImplementationOnce(() => ({ locked: true, message: "Editorial lock active" }));

    const store = useExperienceLockStore();
    expect(store.locks.size).toBe(2);
    expect(store.locks.get("experience.activity-cooldown.raw")).toBe("Base lock active");
    expect(store.locks.get("experience.activity-cooldown.editorial")).toBe("Editorial lock active");
  });

  it("should not add locks when they are not active", () => {
    (useFeatureFlag as Mock).mockReturnValue(true);
    (getLockByActivityLogs as Mock)
      .mockImplementationOnce(() => ({ locked: false }))
      .mockImplementationOnce(() => ({ locked: false }));

    const store = useExperienceLockStore();
    expect(store.locks.size).toBe(0);
  });

  it("should return the correct lock result for getOne", () => {
    (useFeatureFlag as Mock).mockReturnValue(true);
    (getLockByActivityLogs as Mock)
      .mockImplementationOnce(() => ({ locked: true, message: "Base lock active" }))
      .mockImplementationOnce(() => ({ locked: false }));

    const store = useExperienceLockStore();
    const result1 = store.getOne("experience.activity-cooldown.raw");
    const result2 = store.getOne("experience.activity-cooldown.editorial");

    expect(result1).toEqual({ locked: true, message: "Base lock active" });
    expect(result2).toEqual({ locked: false, message: "" });
  });

  it("when the feature flag is disabled, it should return an empty map and a warning", async () => {
    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    (useFeatureFlag as Mock).mockReturnValue(false);

    const store = useExperienceLockStore();
    expect(store.locks).toEqual(new Map());
    expect(consoleWarnSpy).toHaveBeenCalledWith("[FEATURE FLAG] Experience locks are disabled");
  });
});
