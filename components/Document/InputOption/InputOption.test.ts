import { describe, test, expect, vi, beforeEach } from "vitest";
import { mount, config } from "@vue/test-utils";
import InputOption, { Props } from "./InputOption.vue";
import { mockUseRuntimeConfig } from "@/__mocks__/useRuntimeConfig";

config.global.mocks = {
  $t: (text: string) => text,
};

vi.stubGlobal("useRuntimeConfig", mockUseRuntimeConfig);

const charlieMasterDataApiMock = {
  getModalities: vi.fn(() => {
    return {
      data: [
        {
          code: "1H10H",
          default_name: "Spirit 1h 10h00 ticket only",
          experience_id: "E-E20-LPA150",
        },
        {
          code: "2H10H",
          default_name: "Spirit 2h 10h00 ticket only",
          experience_id: "E-E20-LPA150",
        },
        {
          code: "3H10H",
          default_name: "Spirit 3h 10h00 ticket only",
          experience_id: "E-E20-LPA150",
        },
      ],
    };
  }),
};

vi.mock("@/composables/useCharlieContentMasterDataApi", () => ({
  useCharlieContentMasterDataApi: () => charlieMasterDataApiMock,
}));

const props: Props = {
  asterixId: "asterix-id",
  modelValue: {
    value: "9H10H",
    label: "Spirit 9h 10h00 ticket only",
  },
};

const selectors = {
  selectBtn: "[data-testid='select-button']",
  options: "[data-testid^='options-list-list-item-']",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("InputOption", () => {
  test("it should render correctly", () => {
    const wrapper = mount(InputOption, { props });

    expect(wrapper).toBeTruthy();
    expect(wrapper.find(selectors.selectBtn).exists()).toBe(true);
    expect(wrapper.find(selectors.selectBtn).text()).include("Spirit 9h 10h00 ticket only");
  });

  describe("if the asterixCode is missing", () => {
    test("it should not call the api", () => {
      mount(InputOption, {
        props: {
          modelValue: {
            value: "9H10H",
            label: "Spirit 9h 10h00 ticket only",
          },
        },
      });
      expect(charlieMasterDataApiMock.getModalities).not.toHaveBeenCalled();
    });
  });

  describe("when the prop AsterixCode change", () => {
    test("it should call the api with the correct search value", async () => {
      const wrapper = mount(InputOption, { props });

      expect(charlieMasterDataApiMock.getModalities).toHaveBeenCalledWith("modalities", {
        params: {
          contain: "asterix-id",
          limit: 10,
          offset: 0,
        },
      });
      await wrapper.setProps({ asterixId: "new-asterix-id" });

      expect(charlieMasterDataApiMock.getModalities).toHaveBeenCalledWith("modalities", {
        params: {
          contain: "new-asterix-id",
          limit: 10,
          offset: 0,
        },
      });

      // check if is not calling the api if the asterix id is removed
      vi.clearAllMocks();
      await wrapper.setProps({ modelValue: undefined });
      expect(charlieMasterDataApiMock.getModalities).not.toHaveBeenCalled();
    });

    test("it should deselect the option and emit an event with a null value", async () => {
      const wrapper = mount(InputOption, { props });

      await wrapper.find(selectors.selectBtn).trigger("click");
      await wrapper.findAll(selectors.options)[0].trigger("click");

      await wrapper.setProps({
        asterixId: "new-asterix-id",
        modelValue: undefined,
      });

      const events = wrapper.emitted<Event[]>()["update:modelValue"];
      expect(events[1][0]).toEqual(null);
    });
  });

  describe("if you click an option", () => {
    test("it should become the selected one and emit the event", async () => {
      const wrapper = mount(InputOption, { props });
      await wrapper.find(selectors.selectBtn).trigger("click");
      await wrapper.findAll(selectors.options)[0].trigger("click");

      const events = wrapper.emitted<Event[]>()["update:modelValue"];
      expect(events[0][0]).toEqual({
        label: "Spirit 1h 10h00 ticket only",
        value: "1H10H",
      });

      await wrapper.find(selectors.selectBtn).trigger("click");
      await wrapper.findAll(selectors.options)[1].trigger("click");

      expect(events[1][0]).toEqual({
        label: "Spirit 2h 10h00 ticket only",
        value: "2H10H",
      });
    });
  });
});
