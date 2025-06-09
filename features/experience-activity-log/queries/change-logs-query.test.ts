import { describe, expect, test, vi } from "vitest";
import { config, shallowMount } from "@vue/test-utils";
import { QueryClient } from "@tanstack/vue-query";
import { useChangeLogsQuery } from "./change-logs-query";
import { AvailableLanguage } from "@/types/Language";

config.global.provide.VUE_QUERY_CLIENT = new QueryClient();

const useContentAnalyticsApiMock = {
  getChangeLogs: vi.fn(),
};

vi.mock("@/features/core-shared/composables/useContentAnalyticsApi", () => ({
  useContentAnalyticsApi: () => useContentAnalyticsApiMock,
}));

describe("useDistributionContentQuery", () => {
  test("it should call the api with the correct parameters", () => {
    const idRef = ref("test-id");
    const languageRef = ref("en" as AvailableLanguage);

    shallowMount(getComponent(idRef, languageRef));

    expect(useContentAnalyticsApiMock.getChangeLogs).toHaveBeenCalledWith(
      expect.objectContaining({
        experience_id: "test-id",
        language_code: "en",
        start_date: expect.any(String),
        end_date: expect.any(String),
      })
    );
  });

  test("it should not trigger the request if the ref is undefined", () => {
    const idRef = ref<undefined>(undefined);
    const languageRef = ref("en" as AvailableLanguage);

    shallowMount(getComponent(idRef, languageRef));

    expect(useContentAnalyticsApiMock.getChangeLogs).not.toHaveBeenCalledWith();
  });
});

function getComponent(idRef: Ref<string | undefined>, languageRef: Ref<AvailableLanguage>) {
  return defineComponent({
    setup: () => useChangeLogsQuery({ idRef, languageRef }),
    template: "<div></div>",
  });
}
