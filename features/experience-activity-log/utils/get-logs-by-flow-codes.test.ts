import { describe, it, expect, vi, Mock } from "vitest";
import { getLogsByFlowCodes } from "./get-logs-by-flow-codes";
import { filterChangeLogs } from "./filter-change-logs";
import { removeSystemActivityLogs } from "./remove-system-activities";
import { groupLogsByDate } from "./change-logs";
import { Log } from "@/types/generated/ContentAnalyticsApi";
import { ExperienceFlowCode } from "@/types/DocumentStatuses";

vi.mock("./filter-change-logs", () => ({
  filterChangeLogs: vi.fn(),
}));

vi.mock("./remove-system-activities", () => ({
  removeSystemActivityLogs: vi.fn(),
}));

vi.mock("./change-logs", () => ({
  groupLogsByDate: vi.fn(),
}));

describe("getLogsByFlowCodes", () => {
  it("should return grouped logs, unused logs, last activity, last edit date, and filtered logs", () => {
    const logs: Log[] = [
      {
        id: "1",
        entity: "entity1",
        field: "field1",
        action_date: "2023-01-01",
        action: "created",
        user: "",
        new_value: "",
        old_value: "",
      },
      {
        id: "2",
        entity: "entity2",
        field: "field2",
        action_date: "2023-01-02",
        action: "created",
        user: "",
        new_value: "",
        old_value: "",
      },
    ];
    const codes: ExperienceFlowCode[] = ["BASE", "CURATION"];

    const acceptedLogs = [{ id: "1", entity: "entity1", field: "field1", action_date: "2023-01-01" }];
    const rejectedLogs = [{ id: "2", entity: "entity2", field: "field2", action_date: "2023-01-02" }];

    (filterChangeLogs as Mock).mockReturnValue({
      accepted: acceptedLogs,
      rejected: rejectedLogs,
    });

    (removeSystemActivityLogs as Mock).mockReturnValue([acceptedLogs[0]]);
    (groupLogsByDate as Mock).mockReturnValue({
      "2023-01-01": [acceptedLogs[0]],
    });

    const result = getLogsByFlowCodes(logs, codes);

    expect(filterChangeLogs).toHaveBeenCalledWith(logs, codes);
    expect(removeSystemActivityLogs).toHaveBeenCalledWith(acceptedLogs);
    expect(groupLogsByDate).toHaveBeenCalledWith(acceptedLogs);

    expect(result).toEqual({
      groupedLogs: {
        "2023-01-01": [acceptedLogs[0]],
      },
      unusedLogs: ["entity2.field2"],
      lastActivity: acceptedLogs[0],
      lastEditDate: "2023-01-01",
      filteredLogs: acceptedLogs,
    });
  });

  it("should handle empty logs and codes", () => {
    const logs: Log[] = [];
    const codes: ExperienceFlowCode[] = [];

    (filterChangeLogs as Mock).mockReturnValue({
      accepted: [],
      rejected: [],
    });

    (removeSystemActivityLogs as Mock).mockReturnValue([]);
    (groupLogsByDate as Mock).mockReturnValue({});

    const result = getLogsByFlowCodes(logs, codes);

    expect(filterChangeLogs).toHaveBeenCalledWith(logs, codes);
    expect(removeSystemActivityLogs).toHaveBeenCalledWith([]);
    expect(groupLogsByDate).toHaveBeenCalledWith([]);

    expect(result).toEqual({
      groupedLogs: {},
      unusedLogs: [],
      lastActivity: undefined,
      lastEditDate: undefined,
      filteredLogs: [],
    });
  });
});
