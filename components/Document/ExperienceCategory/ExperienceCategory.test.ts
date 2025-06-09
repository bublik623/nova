import { describe, test, expect, vi } from "vitest";
import { mount, config } from "@vue/test-utils";
import ExperienceCategory, { Props } from "./ExperienceCategory.vue";

config.global.mocks = {
  $t: (text: string) => text,
};

vi.stubGlobal("useNuxtApp", () => ({
  $t: (s: string) => s,
}));

const selectors = {
  showBtn: "[data-testid='experience-category-show-btn']",
  editBtn: "[data-testid='experience-category-edit-btn']",
  modal: "[data-testid='modal']",
  category: "[data-testid='category-modal-category']",
  interest: "[data-testid='category-modal-interest']",
  nextBtn: "[data-testid='category-modal-next-btn']",
  saveBtn: "[data-testid='category-modal-save-btn']",
};

const props: Props = {
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
  selectedCategory: [],
  selectedInterests: [],
  readonly: false,
};

describe("ExperienceCategory", () => {
  test("it should render correctly", () => {
    const wrapper = mount(ExperienceCategory, { props });

    expect(wrapper).toBeTruthy();
    expect(wrapper.find(selectors.modal).exists()).toBe(false);
    expect(wrapper.find(selectors.editBtn).exists()).toBe(false);
    expect(wrapper.text()).toContain("experience.category.empty.title");
  });

  describe("when the user clicks on the button", () => {
    test("it should show the modal", async () => {
      const wrapper = mount(ExperienceCategory, { props });

      await wrapper.find(selectors.showBtn).trigger("click");

      expect(wrapper.find(selectors.modal).exists()).toBe(true);
    });
  });

  describe("when the user selects some values", () => {
    test("it should emit an event", async () => {
      const wrapper = mount(ExperienceCategory, { props });

      await wrapper.find(selectors.showBtn).trigger("click");
      await wrapper.find(selectors.category).trigger("click");
      await wrapper.find(selectors.nextBtn).trigger("click");

      const interests = wrapper.findAll(selectors.interest);
      await interests[0].find("input").trigger("click");
      await interests[1].find("input").trigger("click");

      await wrapper.find(selectors.saveBtn).trigger("click");

      const events = wrapper.emitted<Event[]>();
      expect(events["update:selectedCategory"]).toBeTruthy();
      expect(events["update:selectedCategory"][0][0]).toStrictEqual(["ACTIVITIES"]);
      expect(events["update:selectedInterests"]).toBeTruthy();
      expect(events["update:selectedInterests"][0][0]).toStrictEqual(["AIR_ACTIVITIES", "CLASSES_AND_WORKSHOPS"]);
    });
  });

  describe("when some values are already selected", () => {
    test("it should show those values", () => {
      const wrapper = mount(ExperienceCategory, {
        props: {
          ...props,
          selectedCategory: [props.categories[0].code],
          selectedInterests: props.interests.map((i) => i.code),
        },
      });

      expect(wrapper.text()).toContain("experience.category.title.category:");
      expect(wrapper.text()).toContain("experience.category.title.interests:");
      expect(wrapper.text()).toContain(props.categories[0].name);
      expect(wrapper.text()).toContain(props.interests.map((i) => i.name).join(", "));
      expect(wrapper.find(selectors.editBtn).exists()).toBe(true);
    });
  });

  describe("if the readonly props is true", () => {
    test("it should show the no content util if no element are selected", () => {
      const wrapper = mount(ExperienceCategory, {
        props: {
          ...props,
          readonly: true,
        },
      });

      expect(wrapper.findComponent({ name: "NoContentUtil" }).isVisible()).toBeTruthy();
    });

    test("it should show the component without the edit button if at least one element is selected", () => {
      const wrapper = mount(ExperienceCategory, {
        props: {
          ...props,
          readonly: true,
          selectedCategory: [props.categories[0].code],
          selectedInterests: props.interests.map((i) => i.code),
        },
      });

      expect(wrapper.text()).toContain("experience.category.title.category:");
      expect(wrapper.text()).toContain("experience.category.title.interests:");
      expect(wrapper.text()).toContain(props.categories[0].name);
      expect(wrapper.text()).toContain(props.interests.map((i) => i.name).join(", "));

      expect(wrapper.findComponent({ name: "NoContentUtil" }).exists()).toBeFalsy();
      expect(wrapper.find(selectors.editBtn).exists()).toBe(false);
    });
  });
});
