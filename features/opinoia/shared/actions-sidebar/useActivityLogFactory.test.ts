import { vi, describe, expect, test } from "vitest";
import { useActivityLogFactory } from "./useActivityLogFactory";
import { ChangeLog } from "@/types/generated/ContentAnalyticsApi";

const useChangeLogsQueryMock = vi.hoisted(() => vi.fn());

vi.mock("@/features/experience-activity-log/queries/change-logs-query", () => {
  return {
    useChangeLogsQuery: useChangeLogsQueryMock,
  };
});

vi.stubGlobal("useNuxtApp", () => ({
  $t: (s: string) => s,
}));

function getQueryData(): ChangeLog {
  return {
    experienceId: "exp-id",
    languageCode: "en",
    logs: [
      {
        id: "base-a",
        flow_code: "BASE",
        entity: "entity",
        field: "field",
        action: "created",
        user: "user",
        old_value: "",
        new_value: "",
        action_date: "2025-03-30T17:33Z",
      },
      {
        id: "base-b",
        flow_code: "BASE",
        entity: "entity",
        field: "field",
        action: "created",
        user: "user",
        old_value: "",
        new_value: "",
        action_date: "2025-03-29T17:33Z",
      },
      {
        id: "curation-a",
        flow_code: "CURATION",
        entity: "entity",
        field: "field",
        action: "created",
        user: "user",
        old_value: "",
        new_value: "",
        action_date: "2025-03-28T17:33Z",
      },
      {
        id: "curation-b",
        flow_code: "CURATION",
        entity: "entity",
        field: "field",
        action: "created",
        user: "user",
        old_value: "",
        new_value: "",
        action_date: "2025-03-27T17:33Z",
      },
    ],
  };
}

describe("useActivityLogFactory", () => {
  describe("useActivityLog", () => {
    describe("lastEditDate", () => {
      test("it returns the the action_date of the most recent change log belonging to the given flows, experience and language code", () => {
        const experienceId = "exp-id";
        const languageCode = "en";

        useChangeLogsQueryMock.mockReturnValueOnce({ data: { value: getQueryData() } });

        const useActivityLog = useActivityLogFactory(["CURATION"]);
        const activityLog = useActivityLog(ref(experienceId), ref(languageCode));

        expect(activityLog.lastEditDate.value).toBe("2025-03-28T17:33Z");

        expect(useChangeLogsQueryMock).toHaveBeenCalledWith({
          idRef: expect.objectContaining({ value: experienceId }),
          languageRef: expect.objectContaining({ value: languageCode }),
        });
      });
    });
  });
});
