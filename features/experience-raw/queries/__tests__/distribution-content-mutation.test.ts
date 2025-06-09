import { describe, expect, test, vi } from "vitest";
import { config, shallowMount } from "@vue/test-utils";
import { QueryClient } from "@tanstack/vue-query";
import { useDistributionContentMutation } from "../distribution-content-mutation";

const queryClient = new QueryClient();
const invalidateQuerySpy = vi.spyOn(queryClient, "invalidateQueries");

config.global.provide.VUE_QUERY_CLIENT = queryClient;

const mockExperienceRawApi = {
  getDistributionContent: vi.fn(),
  patchDistributionContent: vi.fn(),
};

vi.mock("@/composables/useExperienceRawApi", () => ({
  useExperienceRawApi: () => mockExperienceRawApi,
}));

const mockData = {
  supplier_id: "test-supplier-id",
  id: "test-id",
};

describe("useDistributionContentMutation", () => {
  test("It should call the api with the correct parameters and invalidate the query", async () => {
    const component = getComponent();
    const wrapper = shallowMount(component);

    const { mutateAsync } = wrapper.vm;
    await mutateAsync(mockData);

    expect(mockExperienceRawApi.patchDistributionContent).toHaveBeenCalledWith("test-id", mockData);
  });

  test("it should invalidate the query when the mutation is settled", async () => {
    const component = getComponent();
    const wrapper = shallowMount(component);

    const { mutateAsync } = wrapper.vm;
    await mutateAsync(mockData);

    expect(invalidateQuerySpy).toHaveBeenCalled();
  });

  test("it should throw an error if the mutation fails", async () => {
    const component = getComponent();
    const wrapper = shallowMount(component);

    const { mutateAsync } = wrapper.vm;
    mockExperienceRawApi.patchDistributionContent.mockRejectedValue(new Error("test error"));

    try {
      await mutateAsync(mockData);
    } catch (e: any) {
      expect(e.message).toBe("test error");
    }
  });
});

function getComponent() {
  return defineComponent({
    setup: () => {
      return {
        ...useDistributionContentMutation(),
      };
    },
    template: "<Suspense><div></div></Suspense>",
  });
}
