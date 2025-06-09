import { config, shallowMount } from "@vue/test-utils";
import { describe, test, expect, vi } from "vitest";
import CollectionCriteriaButton from "../CollectionCriteriaButton.vue";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";

config.global.mocks = {
  $t: (s: string) => s,
};

const useAsyncModalMock = {
  openModal: vi.fn(),
};

vi.mock("@/features/core-shared/composables/useAsyncModal", () => ({
  useAsyncModal: () => useAsyncModalMock,
}));

const props = {
  exceptionalExperiences: "Value 1",
  bestValueGuaranteed: "Value 2",
  createdWithCare: "Value 3",
};

describe("CollectionCriteriaButton", () => {
  test("it should invoke the async modal with the correct props on click", async () => {
    const wrapper = shallowMount(CollectionCriteriaButton, {
      props,
    });
    const button = wrapper.findComponent(NovaButton);

    await button.trigger("click");

    expect(useAsyncModalMock.openModal).toHaveBeenCalledWith(props);
  });
});
