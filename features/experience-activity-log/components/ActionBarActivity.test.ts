import { describe, test, expect, vi } from "vitest";
import { mount, config } from "@vue/test-utils";
import ActionBarActivity from "./ActionBarActivity.vue";
import { LogsGroupedByDate } from "../utils/change-logs";
import { useActivityLogStore } from "../stores/useActivityLogStore";

const logsMock: LogsGroupedByDate = {
  "1664755200000": [
    {
      id: "id-1",
      field: "description",
      message: "test-message",
      entity: "experienceTranslation",
      action: "created",
      user: "user-1",
      action_date: "2022-10-03T13:10:00Z",
      new_value: "new",
      old_value: "old",
    },
    {
      id: "id-2",
      field: "title",
      message: "test-message",
      entity: "experienceTranslation",
      action: "updated",
      user: "user-1",
      action_date: "2022-10-03T14:10:00Z",
      new_value: "new",
      old_value: "old",
    },
  ],
  "1665100800000": [
    {
      id: "id-3",
      field: "highlights",
      message: "test-message",
      entity: "experienceMetadata",
      action: "deleted",
      user: "user-1",
      action_date: "2022-10-07T13:10:00Z",
      new_value: "new",
      old_value: "old",
    },
  ],
};

const selectors = {
  logs: "[data-testid='activity-log-item']",
  groupDate: "[data-testid='activity-log-group-date']",
};

config.global.mocks = {
  $t: (text: string) => text,
};
config.global.stubs = {
  ActionBarActivity: { template: "<div data-testid='log'></div>" },
};

vi.mock("@/features/experience-activity-log/stores/useActivityLogStore");
const activityLogStoreMock = vi.mocked(useActivityLogStore);

describe("ActionBarActivity", () => {
  test("it should render correctly", () => {
    // @ts-ignore ...
    activityLogStoreMock.mockReturnValueOnce({
      lastEditDate: undefined,
      loading: false,
      error: false,
      groupedLogs: logsMock,
    });

    const wrapper = mount(ActionBarActivity);

    expect(wrapper.findAll(selectors.logs).length).toBe(2);
    expect(wrapper.findAll(selectors.groupDate)[0].text()).toBe("Oct 3, 2022");
    expect(wrapper.findAll(selectors.groupDate)[1].text()).toBe("Oct 7, 2022");
  });

  describe("when it's loading", () => {
    test("it should display a skeleton", () => {
      // @ts-ignore ...
      activityLogStoreMock.mockReturnValueOnce({
        loading: true,
      });

      const wrapper = mount(ActionBarActivity);

      expect(wrapper.find(selectors.logs).exists()).toBe(false);
      expect(wrapper.find(selectors.groupDate).exists()).toBe(false);
      expect(wrapper.find(".skeleton_item").exists()).toBe(true);
    });
  });

  describe("when there are no entries", () => {
    test("it should display a message", () => {
      // @ts-ignore ...
      activityLogStoreMock.mockReturnValueOnce({
        lastEditDate: undefined,
        loading: false,
        error: false,
        groupedLogs: {},
      });

      const wrapper = mount(ActionBarActivity);

      expect(wrapper.text()).toContain("activity.no.entries");
    });
  });

  describe("when there is an error", () => {
    test("it should display a message", () => {
      // @ts-ignore ...
      activityLogStoreMock.mockReturnValueOnce({
        lastEditDate: undefined,
        loading: false,
        error: true,
        groupedLogs: {},
      });

      const wrapper = mount(ActionBarActivity);

      expect(wrapper.text()).toContain("activity.error.loading");
    });
  });
});
