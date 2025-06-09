import { describe, expect, test, vi } from "vitest";
import { useExperienceRawQuery } from "../experience-raw-query";
import { config, shallowMount } from "@vue/test-utils";
import { QueryClient } from "@tanstack/vue-query";

config.global.provide.VUE_QUERY_CLIENT = new QueryClient();

const mockExperienceRawApi = {
  getExperienceRawV2ByExperienceId: vi.fn(),
};

vi.mock("@/composables/useExperienceRawApi", () => ({
  useExperienceRawApi: () => mockExperienceRawApi,
}));

describe("useExperienceRawQuery", () => {
  test("it should call the api with the correct parameters", () => {
    const idRef = ref("test-id");

    shallowMount(getComponent(idRef));

    expect(mockExperienceRawApi.getExperienceRawV2ByExperienceId).toHaveBeenCalledWith("test-id");
  });

  test("it should not trigger the request if the ref is undefined", () => {
    const idRef = ref(undefined);

    shallowMount(getComponent(idRef));

    expect(mockExperienceRawApi.getExperienceRawV2ByExperienceId).not.toHaveBeenCalledWith();
  });
});

// https://test-utils.vuejs.org/guide/advanced/reusability-composition#Testing-composables
function getComponent(idRef: Ref<string | undefined>) {
  return defineComponent({
    setup: () => useExperienceRawQuery(idRef),
    template: "<div></div>",
  });
}
