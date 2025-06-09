import { config, mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";
import { testId } from "@/utils/test.utils";
import CategoryList from "@/features/masterdata-management-shared/components/CategoryList.vue";

config.global.mocks = {
  $t: (s: string) => s,
};

const props = {
  categories: [
    {
      name: "Food and drinks",
      items: [
        {
          id: "1",
          title:
            "This experience is part of Iconic Insiders, a selection of tours designed for first time visitors to uncover what matters and get oriented in a new city. Your destination insider is a licensed guid...",
        },
        { id: "2", title: "Drinks are included" },
        { id: "3", title: "Experience the real local food" },
      ],
    },
    {
      name: "Food and drinks",
      items: [
        {
          id: "1",
          title:
            "This experience is part of Iconic Insiders, a selection of tours designed for first time visitors to uncover what matters and get oriented in a new city. Your destination insider is a licensed guid...",
        },
        { id: "2", title: "Drinks are included" },
        { id: "3", title: "Experience the real local food" },
      ],
    },
    {
      name: "Clothing",
      items: [
        {
          id: "1",
          title:
            "This experience is part of Iconic Insiders, a selection of tours designed for first time visitors to uncover what matters and get oriented in a new city. Your destination insider is a licensed guid...",
        },
        { id: "2", title: "Drinks are included" },
        { id: "3", title: "Experience the real local food" },
      ],
    },
    {
      name: "Transportation",
      items: [
        {
          id: "1",
          title:
            "This experience is part of Iconic Insiders, a selection of tours designed for first time visitors to uncover what matters and get oriented in a new city. Your destination insider is a licensed guid...",
        },
        { id: "2", title: "Drinks are included" },
        { id: "3", title: "Experience the real local food" },
      ],
    },
  ],
};
describe("CategoryList", () => {
  test("it should mount correctly", () => {
    const wrapper = mount(CategoryList, { props });

    expect(wrapper.find(".CategoryList__action").isVisible()).toBeTruthy();
    expect(wrapper.findAll(testId("nova-collapse")).length).toBe(props.categories.length);
    expect(wrapper.findAll(testId("nova-collapse"))[0].findAll(".CategoryList__item").length).toBe(
      props.categories[0].items.length
    );
  });
});
