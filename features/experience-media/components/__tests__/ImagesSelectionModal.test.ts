import { config, mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";
import { testId } from "@/utils/test.utils";
import ImageSelectionModal, { Props } from "../ImagesSelectionModal.vue";

config.global.mocks = {
  $t: (text: string) => text,
};

const props: Props = {
  images: [
    {
      filename: "ImageTest1",
      preview_url: "test-url-1",
    },
    {
      filename: "ImageTest2",
      preview_url: "test-url-2",
    },
  ],
  modelValue: [],
  open: true,
};

const searchbar = testId("experience.media.selection-modal.searchbar-input-text");
const saveBtn = testId("experience.media.selection-modal.save");
const closeBtn = testId("experience.media.selection-modal.close");
const clearAllBtn = testId("experience.media.selection-modal.clear-all");
const selectAllCheckbox = "#checkbox-select-all-images";
const listItems = testId("image-selection-modal-list-item");

describe("ImagesSelectionModal", () => {
  test("it should render correctly", () => {
    const wrapper = mount(ImageSelectionModal, { props });
    expect(wrapper.find(searchbar).isVisible).toBeTruthy();
    expect(wrapper.find(selectAllCheckbox).isVisible).toBeTruthy();
    expect(wrapper.findAll(listItems).length).toBe(props.images.length);
  });

  describe("if the user press a checkbox on an item and save", () => {
    test("it should emit the event for that item", async () => {
      const wrapper = mount(ImageSelectionModal, { props });

      await wrapper.find("#checkbox-test-url-1").trigger("click");
      await wrapper.find(saveBtn).trigger("click");

      const events = wrapper.emitted<Event[]>()["update:modelValue"];
      expect(events).toBeTruthy();
      expect(events[0][0]).toStrictEqual([props.images[0]]);
    });
  });

  describe("if the user press the select all checkbox and save", () => {
    test("it should emit the event for all the items", async () => {
      const wrapper = mount(ImageSelectionModal, { props });

      await wrapper.find(selectAllCheckbox).trigger("click");
      await wrapper.find(saveBtn).trigger("click");

      const events = wrapper.emitted<Event[]>()["update:modelValue"];
      expect(events).toBeTruthy();
      expect(events[0][0]).toStrictEqual(props.images);
    });

    describe("if an item is already selected", () => {
      test("it should reset the modelValue", async () => {
        const wrapper = mount(ImageSelectionModal, { props: { ...props, modelValue: [props.images[0]] } });

        // check if the selected counter is working
        expect(wrapper.text().includes("1 common.selected")).toBeTruthy();

        await wrapper.find(selectAllCheckbox).trigger("click");
        await wrapper.find(saveBtn).trigger("click");

        const events = wrapper.emitted<Event[]>()["update:modelValue"];
        expect(events).toBeTruthy();
        expect(events[0][0]).toStrictEqual([]);
      });
    });

    describe("if all the items are selected", () => {
      test("it should reset the modelValue", async () => {
        const wrapper = mount(ImageSelectionModal, { props: { ...props, modelValue: props.images } });

        // check if the selected counter is working
        expect(wrapper.text().includes("2 common.selected")).toBeTruthy();

        await wrapper.find(selectAllCheckbox).trigger("click");
        await wrapper.find(saveBtn).trigger("click");

        const events = wrapper.emitted<Event[]>()["update:modelValue"];
        expect(events).toBeTruthy();
        expect(events[0][0]).toStrictEqual([]);
      });
    });
  });

  describe("if the user type something in the searchbar", () => {
    test("it should update the item list", async () => {
      const wrapper = mount(ImageSelectionModal, { props });

      await wrapper.find(searchbar).setValue("1");

      expect(wrapper.findAll(listItems)[0].attributes().style).toBe(undefined);
      expect(wrapper.findAll(listItems)[1].attributes().style).toBe("display: none;");

      await wrapper.find(searchbar).setValue("2");

      expect(wrapper.findAll(listItems)[0].attributes().style).toBe("display: none;");
      expect(wrapper.findAll(listItems)[1].attributes().style).toBe("");

      await wrapper.find(searchbar).setValue("3");

      expect(wrapper.findAll(listItems)[0].attributes().style).toBe("display: none;");
      expect(wrapper.findAll(listItems)[1].attributes().style).toBe("display: none;");
    });
  });

  describe("if the user click on the clear all selected button and save", () => {
    test("it should reset the modelValue", async () => {
      const wrapper = mount(ImageSelectionModal, { props: { ...props, modelValue: [props.images[0]] } });

      await wrapper.find(clearAllBtn).trigger("click");
      await wrapper.find(saveBtn).trigger("click");

      const events = wrapper.emitted<Event[]>()["update:modelValue"];
      expect(events).toBeTruthy();
      expect(events[0][0]).toStrictEqual([]);
    });
  });

  describe("if the user click on the close button", () => {
    test("it should emit the close event", async () => {
      const wrapper = mount(ImageSelectionModal, { props: { ...props, modelValue: [props.images[0]] } });

      await wrapper.find(closeBtn).trigger("click");

      const events = wrapper.emitted<Event[]>()["close:modal"];
      expect(events).toBeTruthy();
      expect(events[0]).toBeTruthy();
    });
  });

  describe("if there are no images", () => {
    test("it should show the right text", async () => {
      const wrapper = mount(ImageSelectionModal, { props: { ...props, images: [] } });

      expect(wrapper.text()).include("there are no images!");
    });
  });
});
