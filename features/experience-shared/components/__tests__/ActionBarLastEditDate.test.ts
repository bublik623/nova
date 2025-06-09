import { mount, config } from "@vue/test-utils";
import { test, expect, describe, vi } from "vitest";
import ActionBarLastEditDate from "../ActionBarLastEditDate.vue";
import { testId } from "@/utils/test.utils";
import { useActivityLogStore } from "@/features/experience-activity-log/stores/useActivityLogStore";

config.global.mocks = {
  $t: (text: string) => text,
};

const selectors = {
  text: "span",
  divTestId: testId("document-action-bar-autosave-saved"),
};

vi.mock("@/features/experience-activity-log/stores/useActivityLogStore");
const activityLogStoreMock = vi.mocked(useActivityLogStore);

describe("DocumentActionBarLastEditDate", () => {
  test("if the store as a last edit date it should show it", () => {
    // @ts-ignore ...
    activityLogStoreMock.mockReturnValueOnce({
      lastEditDate: "2050-07-10T00:00:00Z",
    });

    const wrapper = mount(ActionBarLastEditDate);

    expect(wrapper).toBeTruthy();
    expect(wrapper.find(selectors.text).text()).toBe("common.last_edit: 10 Jul 2050, 12:00 AM");
  });

  test("if the store does not have a last edit date it should not render", () => {
    // @ts-ignore ...
    activityLogStoreMock.mockReturnValueOnce({
      lastEditDate: undefined,
    });

    const wrapper = mount(ActionBarLastEditDate);

    expect(wrapper.find(selectors.divTestId).exists()).toBe(false);
  });
});
