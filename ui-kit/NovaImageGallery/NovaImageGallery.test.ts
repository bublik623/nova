import { config, flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, test, vi } from "vitest";
import NovaImageGallery, { Props } from "@/ui-kit/NovaImageGallery/NovaImageGallery.vue";
import { mockUseRuntimeConfig } from "@/__mocks__/useRuntimeConfig";
import NovaImagePreviewCard from "../NovaImagePreviewCard/NovaImagePreviewCard.vue";
import NovaSortableList from "../NovaSortableList/NovaSortableList.vue";

config.global.mocks = {
  $t: (text: string) => text,
};

const mediaStoreData = {
  gallery: {
    value: [
      {
        id: "290e087c-d28b-4f6e-ad87-3c02b7822e6e",
        name: "image-1-name",
        preview_url: "image-1-url",
        visualization_order: 1,
      },
      {
        id: "96cb90ce-d03d-43cc-afc9-7916c57631ef",
        name: "image-2-name",
        preview_url: "image-2-url",
        visualization_order: 2,
      },
    ],
    required: true,
    category: "media",
  },
};

const useExperienceMediaStoreMock = {
  fields: mediaStoreData,
};

const useDamServiceApiMock = {
  getImages: vi.fn(),
};

const routeMock = {
  params: vi.fn(() => ({
    id: "random-id",
  })),
};

const damImages = [
  {
    filename: "image-1-name",
    preview_url: "image-1-url",
  },
  {
    filename: "image-2-name",
    preview_url: "image-2-url",
  },
  {
    filename: "image-3-name",
    preview_url: "image-3-url",
  },
  {
    filename: "image-4-name",
    preview_url: "image-4-url",
  },
];
vi.stubGlobal("useRuntimeConfig", mockUseRuntimeConfig);
vi.stubGlobal("useRoute", () => routeMock);

vi.mock("@/features/experience-media/stores/useExperienceMediaStore", () => ({
  useExperienceMediaStore: () => useExperienceMediaStoreMock,
}));
vi.mock("@/features/core-shared/composables/useDamServiceApi", () => ({
  useDamServiceApi: () => useDamServiceApiMock,
}));

const props: Props = {
  modelValue: [1, 2].map((i) => ({
    id: `image-${i}-id`,
    name: `image-${i}-name`,
    preview_url: `image-${i}-url`,
    visualization_order: i,
    isPreSelected: i < 3,
  })),
  ctaText: "test cta",
};

const selectors = {
  imageCard: NovaImagePreviewCard,
  sortableList: NovaSortableList,
  addButton: "[data-testid='nova-image-gallery-button']",
  modal: "[data-testid='modal']",
  modalItem: "[data-testid='image-selection-modal-list-item']",
  saveBtn: "[data-testid='experience.media.selection-modal.save']",
  dragHandle: "[data-testid='nova-sortable-list-drag-handle']",
};

describe("NovaImageGallery", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("it should render correctly", async () => {
    const wrapper = mount(NovaImageGallery, { props });
    vi.spyOn(useDamServiceApiMock, "getImages").mockImplementation(() => Promise.resolve({ data: damImages }));

    expect(wrapper).toBeTruthy();
    expect(wrapper.findAllComponents(selectors.imageCard).length).toBe(2);
    expect(wrapper.find(selectors.addButton).text()).toBe(props.ctaText);

    await wrapper.find(selectors.addButton).trigger("click");
    await flushPromises();

    // check the preselected images
    expect(wrapper.find(selectors.modal).text()).include("2 common.selected");
    expect(wrapper.exists).toBeTruthy();
  });

  describe("when an image is added", () => {
    test("it should emit an event", async () => {
      const wrapper = mount(NovaImageGallery, { props });
      vi.spyOn(useDamServiceApiMock, "getImages").mockImplementation(() => Promise.resolve({ data: damImages }));

      await wrapper.find(selectors.addButton).trigger("click");
      await flushPromises();

      await wrapper.findAll(selectors.modalItem)[1].find("input").trigger("click");
      await wrapper.find(selectors.saveBtn).trigger("click");

      const events = wrapper.emitted<Event[]>()["update:modelValue"];

      expect(events[0][0]).toStrictEqual([
        {
          id: "290e087c-d28b-4f6e-ad87-3c02b7822e6e",
          isPreSelected: true,
          name: "image-1-name",
          preview_url: "image-1-url",
          visualization_order: 1,
        },
      ]);
    });
  });

  describe("when an image is removed", () => {
    test("it should emit an event", async () => {
      const wrapper = mount(NovaImageGallery, { props });
      vi.spyOn(useDamServiceApiMock, "getImages").mockImplementation(() => Promise.resolve({ data: damImages }));

      const filteredList = [...props.modelValue];
      filteredList.shift();

      const imageCards = wrapper.findAllComponents(selectors.imageCard);
      const deleteButton = imageCards[0].findAll("[data-testid='nova-button-icon']")[0];

      await deleteButton.trigger("click");

      const events = wrapper.emitted<Event[]>()["update:modelValue"];
      expect(events[0][0]).toStrictEqual(
        filteredList.map((i, idx) => ({
          ...i,
          visualization_order: idx + 1,
        }))
      );
    });
  });

  describe("when an image is preselected", () => {
    test("it should already be checked in the modal", async () => {
      const wrapper = mount(NovaImageGallery, { props });
      vi.spyOn(useDamServiceApiMock, "getImages").mockImplementation(() => Promise.resolve({ data: damImages }));

      await wrapper.find(selectors.addButton).trigger("click");
      await flushPromises();

      expect(wrapper.find(selectors.modal).text()).include("2 common.selected");

      expect(wrapper.findAll(selectors.modalItem)[0].find("input").attributes("aria-checked")).toBe("true");
      expect(wrapper.findAll(selectors.modalItem)[1].find("input").attributes("aria-checked")).toBe("true");

      expect(wrapper.exists()).toBeTruthy();
    });
  });

  describe("if is disabled", () => {
    test("it should not be editable", async () => {
      const wrapper = mount(NovaImageGallery, { props: { ...props, disabled: true } });

      await wrapper.find(selectors.addButton).trigger("click");
      expect(wrapper.find(selectors.addButton).attributes("disabled")).toBe("");
    });
  });

  describe("if is readonly", () => {
    test("it should not be editable", async () => {
      const wrapper = mount(NovaImageGallery, { props: { ...props, readonly: true } });

      expect(wrapper.find(selectors.addButton).exists()).toBe(false);
      expect(wrapper.find(selectors.dragHandle).exists()).toBe(false);
      expect(wrapper.findComponent(selectors.sortableList).props()).toMatchInlineSnapshot(`
        {
          "disabled": true,
          "gridColumns": 4,
          "layout": "grid",
          "locked": false,
          "modelValue": [
            {
              "id": "image-1-id",
              "isPreSelected": true,
              "name": "image-1-name",
              "preview_url": "image-1-url",
              "visualization_order": 1,
            },
            {
              "id": "image-2-id",
              "isPreSelected": true,
              "name": "image-2-name",
              "preview_url": "image-2-url",
              "visualization_order": 2,
            },
          ],
          "options": undefined,
        }
      `);
      expect(wrapper.findComponent(selectors.imageCard).props()).toMatchInlineSnapshot(`
        {
          "disabled": false,
          "image": {
            "id": "image-1-id",
            "isPreSelected": true,
            "name": "image-1-name",
            "preview_url": "image-1-url",
            "visualization_order": 1,
          },
          "readonly": true,
        }
      `);
    });
  });
});
