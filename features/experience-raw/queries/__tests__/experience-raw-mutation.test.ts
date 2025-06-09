/* eslint-disable vue/one-component-per-file */
import { describe, expect, test, vi } from "vitest";
import { config, shallowMount } from "@vue/test-utils";
import { QueryClient } from "@tanstack/vue-query";
import { useExperienceRawMutation } from "../experience-raw-mutation";

const queryClient = new QueryClient();
const invalidateQuerySpy = vi.spyOn(queryClient, "invalidateQueries");

config.global.provide.VUE_QUERY_CLIENT = queryClient;

const mockExperienceRawApi = {
  updateExperienceRaw: vi.fn(),
};

vi.mock("@/composables/useExperienceRawApi", () => ({
  useExperienceRawApi: () => mockExperienceRawApi,
}));

describe("useExperienceRawMutation", () => {
  test("It should call the api with the correct parameters", async () => {
    const mockData = {
      commercial: {
        title: "test-title",
      },
      experience_id: "test-experience-id",
    };

    const component = getComponent();
    const wrapper = shallowMount(component);

    const { mutateAsync } = wrapper.vm;
    await mutateAsync({ id: "test-id", ...mockData });

    expect(mockExperienceRawApi.updateExperienceRaw).toHaveBeenCalledWith("test-id", mockData);
  });

  test("it should invalidate the query when the mutation is settled", async () => {
    const mockData = {
      commercial: {
        title: "test-title",
      },
      experience_id: "test-experience-id",
      id: "test-id",
    };

    const component = getComponent();
    const wrapper = shallowMount(component);

    const { mutateAsync } = wrapper.vm;
    await mutateAsync(mockData);

    expect(invalidateQuerySpy.mock.calls[0][0]).toMatchInlineSnapshot(`
      {
        "queryKey": [
          "raw-experience-query-key",
        ],
      }
    `);
  });

  test("it should throw an error if the mutation fails", async () => {
    const mockData = {
      commercial: {
        title: "test-title",
      },
      experience_id: "test-experience-id",
      id: "test-id",
    };

    const component = getComponent();
    const wrapper = shallowMount(component);

    const { mutateAsync } = wrapper.vm;
    mockExperienceRawApi.updateExperienceRaw.mockRejectedValue(new Error("test error"));

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
        ...useExperienceRawMutation(),
      };
    },
    template: "<Suspense><div></div></Suspense>",
  });
}
