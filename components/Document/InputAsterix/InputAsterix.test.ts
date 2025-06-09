import { describe, test, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import InputAsterix, { Props } from "./InputAsterix.vue";
import { mockUseRuntimeConfig } from "@/__mocks__/useRuntimeConfig";

vi.stubGlobal("useRuntimeConfig", mockUseRuntimeConfig);

vi.mock("lodash.debounce", () => ({
  default: (callback: () => void) => callback,
}));

const charlieMasterDataApiMock = {
  getExperiences: vi.fn(() => Promise.resolve({ data: [] })),
};

vi.mock("@/composables/useCharlieContentMasterDataApi", () => ({
  useCharlieContentMasterDataApi: () => charlieMasterDataApiMock,
}));

const props: Props = {
  id: "test-id",
  placeholder: "placeholder",
  modelValue: "test value",
};

const selectors = {
  textInput: "[data-testid='test-id-input-text']",
};

describe("InputAsterix", () => {
  test("it should render correctly", () => {
    const wrapper = mount(InputAsterix, { props });

    expect(wrapper).toBeTruthy();
    expect(wrapper.find(selectors.textInput).exists()).toBe(true);
  });

  describe("when the search text is updated", () => {
    test("it should call the api with the correct search value", () => {
      const wrapper = mount(InputAsterix, { props });

      const input = wrapper.find(selectors.textInput);
      input.setValue("newValue");

      expect(charlieMasterDataApiMock.getExperiences).toHaveBeenCalledWith("experiences", {
        params: {
          contain: "newValue",
          limit: 20,
          offset: 0,
        },
      });
    });
  });
});
