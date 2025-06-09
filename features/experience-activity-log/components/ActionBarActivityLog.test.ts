import { describe, test, expect } from "vitest";
import { mount, config } from "@vue/test-utils";
import ActionBarActivityLog, { Props } from "./ActionBarActivityLog.vue";

const props: Props = {
  logs: [
    {
      id: "id-1",
      field: "description",
      entity: "experienceTranslation",
      action: "created",
      user: "user-1",
      action_date: "2022-10-03T13:10:00Z",
      new_value: "",
      old_value: "",
      message: "",
    },
    {
      id: "id-2",
      field: "title",
      entity: "experienceTranslation",
      action: "updated",
      user: "user-1",
      action_date: "2022-10-03T14:10:00Z",
      new_value: "",
      old_value: "",
      message: "",
    },
    {
      id: "id-3",
      field: "highlights",
      entity: "experienceMetadata",
      action: "deleted",
      user: "user-1",
      action_date: "2022-10-07T13:10:00Z",
      new_value: "",
      old_value: "",
      message: "",
    },
  ],
};

const selectors = {
  logs: "[data-testid='activity-log-item']",
  logsText: "[data-testid='activity-log-text']",
  logsDate: "[data-testid='activity-log-date']",
};

config.global.mocks = {
  $t: (text: string) => text,
};

describe("ActionBarActivityLog", () => {
  test("it should render correctly", () => {
    const wrapper = mount(ActionBarActivityLog, { props });

    expect(wrapper.text()).not.toContain("action.bar.activity.current");
    expect(wrapper.findAll(selectors.logs).length).toBe(1);
    expect(wrapper.findAll(selectors.logsText)[0].text()).toBe("user-1 action.bar.activity.changes");
    expect(wrapper.findAll(selectors.logsDate)[0].text()).toBe("action.bar.activity.last-edit: 1:10 PM");
  });

  test("if there is changes by multiple users, it should display the correct placeholder", () => {
    const wrapper = mount(ActionBarActivityLog, {
      props: {
        ...props,
        logs: [
          ...props.logs,
          {
            id: "id-4",
            field: "highlights",
            entity: "experienceMetadata",
            action: "deleted",
            user: "user-2",
            action_date: "2022-10-07T13:10:00Z",
            new_value: "",
            old_value: "",
            message: "",
          },
        ],
      },
    });

    expect(wrapper.findAll(selectors.logsText)[0].text()).toBe(
      "common.placeholder.multiple-users action.bar.activity.changes"
    );
  });

  test("if the user string is an uuid, it should display the correct placeholder", () => {
    const wrapper = mount(ActionBarActivityLog, {
      props: {
        ...props,
        logs: [
          {
            id: "id-4",
            field: "highlights",
            entity: "experienceMetadata",
            action: "deleted",
            user: "12345678-1234-1234-1234-123456789012",
            action_date: "2022-10-07T13:10:00Z",
            new_value: "",
            old_value: "",
            message: "",
          },
        ],
      },
    });
    expect(wrapper.findAll(selectors.logsText)[0].text()).toBe(
      "common.placeholder.single-user action.bar.activity.changes"
    );
  });

  describe("when the changelogs is the current version", () => {
    test("it should display a 'current version' label", () => {
      const wrapper = mount(ActionBarActivityLog, {
        props: { ...props, isCurrentVersion: true },
      });

      expect(wrapper.text()).toContain("action.bar.activity.current");
    });
  });

  describe("when the user clicks on the fist log", () => {
    test("it should expand the log list", async () => {
      const wrapper = mount(ActionBarActivityLog, { props });

      await wrapper.findAll(selectors.logs)[0].trigger("click");

      expect(wrapper.findAll(selectors.logs).length).toBe(props.logs.length + 1);
    });
  });
});
