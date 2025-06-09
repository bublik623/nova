import { setActivePinia, createPinia } from "pinia";
import { useActivityLogStore } from "./useActivityLogStore";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { filterChangeLogs } from "../utils/filter-change-logs";
import { groupLogsByDate } from "../utils/change-logs";
import { useChangeLogsQuery } from "../queries/change-logs-query";
import { getSelectedCodesFromUrl } from "../utils/get-selected-codes-from-url";

const mockRoute = {
  fullPath: "/experience/12345/raw/settings",
};

vi.stubGlobal("useRoute", () => mockRoute);

vi.mock("../utils/get-selected-codes-from-url");
const getSelectedCodesFromUrlMock = vi.mocked(getSelectedCodesFromUrl);

const logsMock: any[] = [
  {
    id: "2ba52f79-1419-496a-9e22-7edee022ddec",
    field: "title",
    entity: "experienceTranslation",
    action: "updated",
    user: "6869190c-1db1-48cc-a6b8-d15d3a4e1840",
    flow_code: "CURATION",
    action_date: "2022-10-10T14:10:00Z",
    new_value: "new",
    old_value: "old",
  },
  {
    id: "2ba52f79-1419-496a-9e22-7edee022ddec",
    field: "highlights",
    entity: "experienceMetadata",
    action: "deleted",
    user: "6869190c-1db1-48cc-a6b8-d15d3a4e1840",
    flow_code: "CURATION",
    action_date: "2022-10-07T13:10:00Z",
    new_value: "new",
    old_value: "old",
  },
  {
    id: "2ba52f79-1419-496a-9e22-7edee022ddec",
    field: "creation_date",
    entity: "experienceTranslation",
    action: "updated",
    user: "6869190c-1db1-48cc-a6b8-d15d3a4e1840",
    flow_code: "CURATION",
    action_date: "2022-10-03T13:10:00Z",
    new_value: "new",
    old_value: "old",
  },
  {
    id: "2ba52f79-1419-496a-9e22-7edee022ddec",
    field: "newField",
    entity: "experienceTranslation",
    action: "updated",
    user: "6869190c-1db1-48cc-a6b8-d15d3a4e1840",
    action_date: "2022-10-03T13:15:00Z",
    new_value: "new",
    old_value: "old",
  },
];

vi.mock("../queries/change-logs-query", () => ({
  useChangeLogsQuery: vi.fn(() => ({
    isLoading: ref(false),
    isError: ref(false),
    data: ref({ logs: logsMock }),
  })),
}));

const refParam = ref("123");

vi.mock("@vueuse/router", () => ({
  useRouteParams: vi.fn(() => refParam),
}));

vi.mock("../utils/change-logs", () => ({
  groupLogsByDate: vi.fn(() => ({})),
}));

vi.mock("../utils/filter-change-logs", () => ({
  filterChangeLogs: vi.fn(() => ({ accepted: logsMock, rejected: [] })),
}));

const filterChangeLogsMock = vi.mocked(filterChangeLogs);
const groupLogsByDateMock = vi.mocked(groupLogsByDate);
const useChangeLogsQueryMock = vi.mocked(useChangeLogsQuery);

describe("useActivityLogStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("should initialize the query correctly", () => {
    const store = useActivityLogStore();

    expect(useChangeLogsQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        idRef: refParam,
        languageRef: refParam,
      })
    );

    expect(store.loading).toBe(false);
    expect(store.error).toBe(false);
  });

  it("should return the last edit date", () => {
    const store = useActivityLogStore();

    filterChangeLogsMock.mockReturnValueOnce({
      accepted: logsMock,
      rejected: [],
    });

    expect(store.lastEditDate).toBe("2022-10-10T14:10:00Z");
  });

  it("it should get the selected codes from the url", () => {
    useActivityLogStore();
    expect(getSelectedCodesFromUrlMock).toHaveBeenCalledWith(mockRoute.fullPath);
  });

  it("should return the grouped logs", () => {
    const store = useActivityLogStore();

    groupLogsByDateMock.mockReturnValue({
      "123": logsMock[0],
    });

    expect(store.groupedLogs).toMatchInlineSnapshot(`
      {
        "123": {
          "action": "updated",
          "action_date": "2022-10-10T14:10:00Z",
          "entity": "experienceTranslation",
          "field": "title",
          "flow_code": "CURATION",
          "id": "2ba52f79-1419-496a-9e22-7edee022ddec",
          "new_value": "new",
          "old_value": "old",
          "user": "6869190c-1db1-48cc-a6b8-d15d3a4e1840",
        },
      }
    `);
  });
});
