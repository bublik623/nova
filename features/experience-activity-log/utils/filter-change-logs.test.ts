import { describe, it, expect, vi } from "vitest";
import { filterChangeLogs } from "./filter-change-logs";
import { NOT_FOUND_DEFAULT } from "@/constants/i18n.constants";
import { Log } from "@/types/generated/ContentAnalyticsApi";
import { ExperienceFlowCode } from "@/types/DocumentStatuses";

vi.stubGlobal("useNuxtApp", () => ({
  $t: vi.fn((key) => {
    // add the 'reject' key to the entity to reject it
    if (key.includes("reject")) {
      return NOT_FOUND_DEFAULT;
    }

    return key;
  }),
}));

vi.mock("lodash.flow", () => ({
  default: (fns: any[]) => (input: any) => fns.reduce((acc, fn) => fn(acc), input),
}));

vi.mock("@/types/DocumentStatuses", () => ({
  ExperienceFlowCode: {},
}));

vi.mock("@/types/generated/ContentAnalyticsApi", () => ({
  Log: {},
}));

vi.mock("./change-logs", () => ({
  filterLogsByFlow: vi.fn((logs) => logs.filter(() => true)),
  mapStatusChangeToLabel: vi.fn((logs) => logs),
  groupAdditionalServiceExtraInfo: vi.fn((logs) => logs),
  aggregateLogsByField: vi.fn((logs) => logs),
  sortLogsByDate: vi.fn((logs) => logs),
  cleanLogFieldNames: vi.fn((logs) => logs),
}));

describe("filterChangeLogs", () => {
  it("should filter and transform logs correctly", () => {
    const mockLogs: Log[] = [
      { entity: "entity1", field: "field1", action: "action1", date: "2023-01-01" } as any,
      { entity: "entity2", field: "field2", action: "action2", date: "2023-01-02" } as any,
    ];
    const mockFlowCodes: ExperienceFlowCode[] = ["code1", "code2"] as any;

    const result = filterChangeLogs(mockLogs, mockFlowCodes);

    expect(result.accepted).toHaveLength(2);
    expect(result.rejected).toHaveLength(0);
    expect(result.accepted[0]).toHaveProperty("message");
    expect(result.accepted[0]).toHaveProperty("action", "changelog.action.action1");
  });

  it("should separate logs into accepted and rejected based on translation availability", () => {
    const mockLogs: Log[] = [
      { entity: "entity1", field: "field1", action: "action1", date: "2023-01-01" } as any,
      { entity: "reject", field: "field3", action: "action3", date: "2023-01-03" } as any,
    ];
    const mockFlowCodes: ExperienceFlowCode[] = ["code1", "code2"] as any;

    const result = filterChangeLogs(mockLogs, mockFlowCodes);

    expect(result.accepted).toHaveLength(1);
    expect(result.rejected).toHaveLength(1);
    expect(result.rejected[0].message).toBe(NOT_FOUND_DEFAULT);
  });

  it("should handle empty logs gracefully", () => {
    const mockLogs: Log[] = [];
    const mockFlowCodes: ExperienceFlowCode[] = ["code1", "code2"] as any;

    const result = filterChangeLogs(mockLogs, mockFlowCodes);

    expect(result.accepted).toHaveLength(0);
    expect(result.rejected).toHaveLength(0);
  });
});
