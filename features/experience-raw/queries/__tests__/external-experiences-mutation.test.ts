import { describe, expect, test, vi } from "vitest";
import { shallowMount, config } from "@vue/test-utils";
import { QueryClient } from "@tanstack/vue-query";
import { EXTERNAL_LINKED_EXPERIENCE_QUERY_KEY } from "../external-experiences-query";
import { useExternalLinkedExperienceMutation } from "../external-experiences-mutation";

const queryClient = new QueryClient();
const invalidateQuerySpy = vi.spyOn(queryClient, "invalidateQueries");

config.global.provide.VUE_QUERY_CLIENT = queryClient;

const mockExperienceRawApi = {
  linkExternalExperience: vi.fn(),
  unlinkExternalExperience: vi.fn(),
};

vi.mock("@/composables/useExperienceRawApi", () => ({
  useExperienceRawApi: () => mockExperienceRawApi,
}));

const mockLinkData = {
  eventId: "test-event-id",
  experienceId: "test-experience-id",
  experienceRefCode: "test-ref-code",
  previousLinkToRemove: "test-previous-link-id",
};

const mockUnlinkData = {
  eventId: "test-event-id-unlink",
};

describe("ExternalLinkedExperienceMutation", () => {
  test("should call the link API with the correct parameters", async () => {
    const component = getComponent();
    const wrapper = shallowMount(component);

    const { link } = wrapper.vm;
    await link.mutateAsync(mockLinkData);
    expect(mockExperienceRawApi.linkExternalExperience).toHaveBeenCalledWith("test-event-id", {
      experience_id: "test-experience-id",
      reference_code: "test-ref-code",
      previous_link_id_to_remove: "test-previous-link-id",
    });
  });

  test("should invalidate the query when the mutation is settled", async () => {
    const component = getComponent();
    const wrapper = shallowMount(component);

    const { link } = wrapper.vm;
    await link.mutateAsync(mockLinkData);

    expect(invalidateQuerySpy).toHaveBeenCalledWith({
      queryKey: [EXTERNAL_LINKED_EXPERIENCE_QUERY_KEY],
    });
  });

  test("should throw an error if the mutation fails", async () => {
    const component = getComponent();
    const wrapper = shallowMount(component);

    const { link } = wrapper.vm;
    mockExperienceRawApi.linkExternalExperience.mockRejectedValue(new Error("test error"));

    try {
      await link.mutateAsync(mockLinkData);
    } catch (e: any) {
      expect(e.message).toBe("test error");
    }
  });

  test("should call the unlink API with the correct parameters", async () => {
    const component = getComponent();
    const wrapper = shallowMount(component);

    const { unlink } = wrapper.vm;
    await unlink.mutateAsync(mockUnlinkData);

    expect(mockExperienceRawApi.unlinkExternalExperience).toHaveBeenCalledWith("test-event-id-unlink");
  });

  test("should invalidate the query after the unlink mutation is settled", async () => {
    const component = getComponent();
    const wrapper = shallowMount(component);

    const { unlink } = wrapper.vm;
    await unlink.mutateAsync(mockUnlinkData);

    expect(invalidateQuerySpy).toHaveBeenCalledWith({
      queryKey: [EXTERNAL_LINKED_EXPERIENCE_QUERY_KEY],
    });
  });
  test("should throw an error if the unlink mutation fails", async () => {
    const component = getComponent();
    const wrapper = shallowMount(component);

    const { unlink } = wrapper.vm;
    mockExperienceRawApi.unlinkExternalExperience.mockRejectedValue(new Error("unlink test error"));

    await expect(unlink.mutateAsync(mockUnlinkData)).rejects.toThrow("unlink test error");
  });
});

function getComponent() {
  return defineComponent({
    setup: () => {
      return {
        ...useExternalLinkedExperienceMutation(),
      };
    },
    template: "<Suspense><div></div></Suspense>",
  });
}
