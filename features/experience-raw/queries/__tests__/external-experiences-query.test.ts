import { beforeEach, describe, expect, test, vi } from "vitest";
import { ref, defineComponent } from "vue";
import { config, shallowMount } from "@vue/test-utils";
import { QueryClient } from "@tanstack/vue-query";
import { useExternalExperiencesQuery, useExternalLinkedExperienceQuery } from "../external-experiences-query";

config.global.provide.VUE_QUERY_CLIENT = new QueryClient();

const mockExperienceRawApi = {
  getExternalExperiences: vi.fn(),
  getLinkedExternalExperience: vi.fn(),
};

vi.mock("@/composables/useExperienceRawApi", () => ({
  useExperienceRawApi: () => mockExperienceRawApi,
}));

function getComponent(composableFunction: (idRef: Ref<string | undefined>) => {}, idRef: Ref<string | undefined>) {
  return defineComponent({
    setup() {
      const query = composableFunction(idRef);
      return { query };
    },
    template: "<div></div>",
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useExternalExperiencesQuery", () => {
  test("should call getExternalExperiences with the correct supplier ID when refetch is called", async () => {
    const supplierIdRef = ref("test-supplier-id");
    const wrapper = shallowMount(getComponent(useExternalExperiencesQuery, supplierIdRef));

    await wrapper.vm.query.refetch();

    expect(mockExperienceRawApi.getExternalExperiences).toHaveBeenCalledWith("test-supplier-id");
  });

  test("should not call getExternalExperiences if supplierIdRef refetch is not called", async () => {
    const supplierIdRef = ref(undefined);
    shallowMount(getComponent(useExternalExperiencesQuery, supplierIdRef));

    expect(mockExperienceRawApi.getExternalExperiences).not.toHaveBeenCalled();
  });

  test("should not call getExternalExperiences if supplierIdRef is undefined", async () => {
    const supplierIdRef = ref(undefined);
    const wrapper = shallowMount(getComponent(useExternalExperiencesQuery, supplierIdRef));

    await expect(async () => await wrapper.vm.query.refetch()).not.toThrow();
    expect(mockExperienceRawApi.getExternalExperiences).not.toHaveBeenCalled();
  });
});
describe("useExternalLinkedExperienceQuery", () => {
  test("should call getLinkedExternalExperience with the correct experience ID", () => {
    const experienceIdRef = ref("test-experience-id");

    shallowMount(getComponent(useExternalLinkedExperienceQuery, experienceIdRef));

    expect(mockExperienceRawApi.getLinkedExternalExperience).toHaveBeenCalledWith("test-experience-id");
  });

  test("should not call getLinkedExternalExperience if experienceIdRef is undefined", () => {
    const experienceIdRef = ref(undefined);

    shallowMount(getComponent(useExternalLinkedExperienceQuery, experienceIdRef));

    expect(mockExperienceRawApi.getLinkedExternalExperience).not.toHaveBeenCalled();
  });
});
