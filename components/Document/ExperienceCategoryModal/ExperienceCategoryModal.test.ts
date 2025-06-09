import { describe, test, expect } from "vitest";
import { mount, config } from "@vue/test-utils";
import ExperienceCategoryModal, { Props } from "./ExperienceCategoryModal.vue";

config.global.mocks = {
  $t: (text: string) => text,
};

const selectors = {
  category: "[data-testid='category-modal-category']",
  interest: "[data-testid='category-modal-interest']",
  nextBtn: "[data-testid='category-modal-next-btn']",
  saveBtn: "[data-testid='category-modal-save-btn']",
  backBtn: "[data-testid='category-modal-back-btn']",
  closeBtn: "[data-testid='category-modal-close-btn']",
  interestsFilter: "[data-testid='experience-interests-search-bar-input-text']",
};

const props: Props = {
  show: true,
  modelValue: { categories: [], interests: [] },
  categories: [
    {
      id: "75d5a37f-73ee-4899-b029-eee1fd6517d0",
      code: "ACTIVITIES",
      name: "Activities",
      language_code: "en",
    },
    {
      id: "146a7eec-498a-4ef2-a071-68d0c5a1c1f7",
      code: "BOAT_TRIPS",
      name: "Boat trips",
      language_code: "en",
    },
  ],
  interests: [
    {
      code: "AIR_ACTIVITIES",
      name: "Air activities",
      language_code: "en",
      id: "f628e0ad-92b0-4e1f-859c-cd47c10127e7",
      category_group_code: "",
    },
    {
      code: "CLASSES_AND_WORKSHOPS",
      name: "Classes & workshops",
      language_code: "en",
      id: "7e5547d6-f1f0-4a77-be3a-f312977accae",
      category_group_code: "",
    },
    {
      code: "FOOD_AND_DRINK",
      name: "Food & drink",
      language_code: "en",
      id: "23ef3863-9ccc-415c-9228-93d938ff33da",
      category_group_code: "",
    },
  ],
};

describe("ExperienceCategoryModal", () => {
  test("it should render correctly", () => {
    const wrapper = mount(ExperienceCategoryModal, { props });

    expect(wrapper).toBeTruthy();
    expect(wrapper.text()).toContain("1/2");

    const categories = wrapper.findAll(selectors.category);
    expect(categories.length).toBe(props.categories.length);
    categories.forEach((c, idx) => {
      expect(c.text()).toBe(props.categories[idx].name);
    });
  });

  describe("when the user clicks on the close button", () => {
    test("it should emit an event", async () => {
      const wrapper = mount(ExperienceCategoryModal, { props });

      await wrapper.find(selectors.closeBtn).trigger("click");

      const events = wrapper.emitted<Event[]>()["close:modal"];
      expect(events).toBeTruthy();
    });
  });

  describe("when the user selects a category", () => {
    test("it should be able to go on the second step", async () => {
      const wrapper = mount(ExperienceCategoryModal, { props });

      await wrapper.find(selectors.category).trigger("click");
      expect(wrapper.find(selectors.nextBtn).attributes().disabled).toBeFalsy();

      await wrapper.find(selectors.nextBtn).trigger("click");

      expect(wrapper.text()).toContain("2/2");
      const interests = wrapper.findAll(selectors.interest);
      expect(interests.length).toBe(props.interests.length);
      interests.forEach((i, idx) => {
        expect(i.text()).toBe(props.interests[idx].name);
      });
    });
  });

  describe("when the user selects one or more interests", () => {
    test("it should be able to save", async () => {
      const wrapper = mount(ExperienceCategoryModal, { props });

      await wrapper.find(selectors.category).trigger("click");
      expect(wrapper.find(selectors.nextBtn).attributes().disabled).toBeFalsy();

      await wrapper.find(selectors.nextBtn).trigger("click");

      const interests = wrapper.findAll(selectors.interest);
      await interests[0].find("input").trigger("click");
      await interests[1].find("input").trigger("click");
      await interests[2].find("input").trigger("click");
      await interests[2].find("input").trigger("click");
      expect(wrapper.find(selectors.saveBtn).attributes().disabled).toBeFalsy();

      await wrapper.find(selectors.saveBtn).trigger("click");

      const events = wrapper.emitted<Event[]>();
      expect(events["close:modal"]).toBeTruthy();
      expect(events["update:modelValue"]).toBeTruthy();
      expect(events["update:modelValue"][0][0]).toStrictEqual({
        categories: ["ACTIVITIES"],
        interests: ["AIR_ACTIVITIES", "CLASSES_AND_WORKSHOPS"],
      });
    });
  });

  describe("when the user tries to filter the interests", () => {
    test("it should show only the filtered interests", async () => {
      const wrapper = mount(ExperienceCategoryModal, { props });

      await wrapper.find(selectors.category).trigger("click");
      expect(wrapper.find(selectors.nextBtn).attributes().disabled).toBeFalsy();

      await wrapper.find(selectors.nextBtn).trigger("click");
      await wrapper.find(selectors.interestsFilter).setValue(props.interests[1].name);

      expect(wrapper.findAll(selectors.interest).length).toBe(1);
    });
  });
});
