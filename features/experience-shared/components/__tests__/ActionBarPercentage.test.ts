import { mount, config } from "@vue/test-utils";
import { test, expect, describe } from "vitest";
import ActionBarPercentage, { Props } from "../ActionBarPercentage.vue";

config.global.mocks = {
  $t: (text: string) => text,
};

const props: Props = {
  percentage: 50,
};

const selectors = {
  text: "p",
};

describe("DocumentActionBarPercentage", () => {
  test("it should mount and render correctly", () => {
    const wrapper = mount(ActionBarPercentage, { props });

    expect(wrapper).toBeTruthy();
    expect(wrapper.find(selectors.text).text()).toBe("50% common.complete");
    expect(wrapper.find(selectors.text).attributes().style).toContain("color: rgb(169, 91, 0)");
  });

  describe("when the percentage is 100", () => {
    test("the text should be green", () => {
      const wrapper = mount(ActionBarPercentage, {
        props: { percentage: 100 },
      });

      expect(wrapper.find(selectors.text).text()).toBe("100% common.complete");
      expect(wrapper.find(selectors.text).attributes().style).toContain("color: rgb(38, 128, 57)");
    });
  });
});
