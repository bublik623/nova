import { describe, expect, test, vi } from "vitest";
import { config, shallowMount } from "@vue/test-utils";
import { QueryClient } from "@tanstack/vue-query";
import { useDistributionContentQuery } from "../distribution-content-query";

config.global.provide.VUE_QUERY_CLIENT = new QueryClient();

const mockExperienceRawApi = {
  getDistributionContent: vi.fn(),
};

vi.mock("@/composables/useExperienceRawApi", () => ({
  useExperienceRawApi: () => mockExperienceRawApi,
}));

describe("useDistributionContentQuery", () => {
  test("it should call the api with the correct parameters", () => {
    const idRef = ref("test-id");

    shallowMount(getComponent(idRef));

    expect(mockExperienceRawApi.getDistributionContent).toHaveBeenCalledWith("test-id");
  });

  test("it should not trigger the request if the ref is undefined", () => {
    const idRef = ref(undefined);

    shallowMount(getComponent(idRef));

    expect(mockExperienceRawApi.getDistributionContent).not.toHaveBeenCalledWith();
  });
});

function getComponent(idRef: Ref<string | undefined>) {
  return defineComponent({
    setup: () => useDistributionContentQuery(idRef),
    template: "<div></div>",
  });
}
