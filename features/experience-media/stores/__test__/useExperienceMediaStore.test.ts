import { createPinia } from "pinia";
import { describe, expect, test, vi } from "vitest";
import { useExperienceMediaStore } from "../useExperienceMediaStore";

vi.stubGlobal("refreshNuxtData", () => {});

const contentQueryMock = {
  getDistributionContent: vi.fn(),
};

const contentCommandApiMock = {
  postImage: vi.fn(() => ({ headers: { location: "/images/new-img" } })),
  putImage: vi.fn(),
  deleteImage: vi.fn(),
  putExperienceMedia: vi.fn(),
  _axiosInstance: {
    get: vi.fn(() => ({
      data: [{ experience_id: "en-experience-id", id: "media-id" }],
    })),
  },
};

const notificationStoreMock = {
  addNotification: vi.fn(),
};

const masterdataStoreMock = {
  getStatusByCode: (code: string) => ({
    id: `test-status-${code}`,
  }),
  getFlowByCode: () => ({
    id: "test-flow-id",
  }),
};

vi.mock("@/composables/useContentQueryApi", () => ({
  useContentQueryApi: () => contentQueryMock,
}));
vi.mock("@/composables/useContentCommandApi", () => ({
  useContentCommandApi: () => contentCommandApiMock,
}));

vi.mock("@/stores/master-data", () => ({
  useMasterData: () => masterdataStoreMock,
}));

vi.mock("@/features/auth/useAuthStore", () => ({
  useAuthStore: () => ({ userUuid: "test-user-uuid" }),
}));

const loggerMock = { logError: vi.fn() };

vi.mock("@/features/core-shared/composables/useLogger", () => ({
  useLogger: () => loggerMock,
}));

vi.mock("@/stores/notifications", () => ({
  useNotifications: () => notificationStoreMock,
}));

const mockDistributionContent = {
  id: "ac684f01-84ec-4bc9-a847-285c4a3eb275",
  supplier_id: "082d65c7-3d18-484b-9dc5-6e33ef73be49",
  global_status: "PUBLISHED",
  experience_media: {
    id: "random-media-id",
    images_v2: [
      {
        id: "image-id-1",
        file_name: "test_image_morocco.jpeg.jpeg",
        preview_url: "https://tuigroup.fotoware.cloud/fotoweb/embed/2023/08/ed6e033073ac4a8fb571178cb7f0a5f0.jpg",
        visualization_order: 1,
        image_type: "GALLERY",
      },
      {
        id: "image-id-2",
        file_name: "holiday4.jpg",
        preview_url: "https://tuigroup.fotoware.cloud/fotoweb/embed/2023/08/ded8509a36414599932078790f2db9f3.jpg",
        visualization_order: 2,
        image_type: "GALLERY",
      },
    ],
    distribution_us: "SENT",
    distribution_date: "2023-10-17T12:17:56",
    creation_date: "2023-10-17T11:55:59",
    updated_date: "2023-10-17T12:18:18",
  },
  experience_content: [
    {
      experience_id: "ac684f01-84ec-4bc9-a847-285c4a3eb275",
      language_code: "de",
      experience_translation: {
        id: "1e9ab696-ba33-42e8-8f59-f264d45dcf34",
        automatic_translation: false,
        to_be_translated: false,
        curation_quality: false,
        distribution_status: "NOT_READY",
        creation_date: "2023-10-17T11:56:40",
        updated_date: "2023-10-17T11:56:40",
      },
      custom_highlights: [
        {
          id: "04aff81d-770d-4237-9bbd-f53147f603c0",
          code: "local-6iyw0vmkrje",
          visualization_order: 1,
          automatic_translation: false,
          to_be_translated: false,
          creation_date: "2023-10-17T11:56:40",
          updated_date: "2023-10-17T11:56:40",
        },
      ],
      custom_included: [
        {
          id: "af53cf34-fe80-4394-9101-ea2ecf796af3",
          code: "local-t87di3tfkt",
          visualization_order: 1,
          automatic_translation: false,
          to_be_translated: false,
          creation_date: "2023-10-17T11:56:40",
          updated_date: "2023-10-17T11:56:40",
        },
      ],
      custom_non_included: [
        {
          id: "1774960d-1f1d-4086-a491-fe5ec92c8eb8",
          code: "local-okgttcw7hm",
          visualization_order: 1,
          automatic_translation: false,
          to_be_translated: false,
          creation_date: "2023-10-17T11:56:40",
          updated_date: "2023-10-17T11:56:40",
        },
      ],
      custom_important_information: [
        {
          id: "254bc3eb-5807-4f13-a329-75229bb0b1e0",
          code: "local-xpt5kwb7ql",
          visualization_order: 1,
          automatic_translation: false,
          to_be_translated: false,
          creation_date: "2023-10-17T11:56:40",
          updated_date: "2023-10-17T11:56:40",
        },
      ],
      published: false,
    },
    {
      experience_id: "ac684f01-84ec-4bc9-a847-285c4a3eb275",
      language_code: "en",
      experience_translation: {
        id: "2e7b1377-57dc-47a2-af72-b31c82dc50db",
        title: "English translation name",
        text1: "<p>Any description</p>",
        text2: "<p>Any Additional description</p>",
        info_voucher: "<p>Any Voucher instructions</p>",
        seo_title: "Seo meta title test",
        seo_description: "<p>Any description seo</p>",
        automatic_translation: false,
        to_be_translated: false,
        curation_quality: false,
        distribution_status: "NOT_READY",
        distribution_date: "2023-10-17T12:17:56",
        creation_date: "2023-10-17T11:55:59",
        updated_date: "2023-10-17T12:19:25",
      },
      custom_highlights: [
        {
          id: "0cc056c8-9e7c-4fe8-bce0-33568e0e61d4",
          code: "local-6iyw0vmkrje",
          name: "Any custom highlights",
          visualization_order: 1,
          automatic_translation: false,
          to_be_translated: false,
          creation_date: "2023-10-17T11:55:59",
          updated_date: "2023-10-17T11:56:40",
        },
      ],
      custom_included: [
        {
          id: "97e26ad7-4215-4be6-bcad-183babebadea",
          code: "local-t87di3tfkt",
          name: "Any custom included",
          visualization_order: 1,
          automatic_translation: false,
          to_be_translated: false,
          creation_date: "2023-10-17T11:55:59",
          updated_date: "2023-10-17T11:56:40",
        },
      ],
      custom_non_included: [
        {
          id: "b45717a4-e859-4dcf-aa9f-bfea31041ce5",
          code: "local-okgttcw7hm",
          name: "Any custom non-included",
          visualization_order: 1,
          automatic_translation: false,
          to_be_translated: false,
          creation_date: "2023-10-17T11:55:59",
          updated_date: "2023-10-17T11:56:40",
        },
      ],
      custom_important_information: [
        {
          id: "72822844-137d-4896-80d0-b09d6354d1ed",
          code: "local-xpt5kwb7ql",
          name: "Any custom important information",
          visualization_order: 1,
          automatic_translation: false,
          to_be_translated: false,
          creation_date: "2023-10-17T11:55:59",
          updated_date: "2023-10-17T11:56:40",
        },
      ],
      published: false,
    },
  ],
  functional_content: {
    experience_location: {
      id: "a3f1cb48-009d-4d03-ae08-e08ebcd4fe2e",
      address: {
        direction: "Croatia, Brsečinska ulica, Dubrovnik, Croatia",
        city: "DBV",
        postal_code: "20000",
        country: "Croatia",
      },
      latitude: "42.651711",
      longitude: "18.0858801",
    },
  },
};

describe("useExperienceMediaStore", () => {
  test("loadExperienceMedia", async () => {
    contentQueryMock.getDistributionContent = vi.fn().mockResolvedValueOnce({
      data: { ...mockDistributionContent },
    });

    const pinia = createPinia();
    const store = useExperienceMediaStore(pinia);

    await store.loadExperienceMedia("random-id");
    const images = mockDistributionContent.experience_media.images_v2;

    expect(store.fields.gallery.value.length).toBe(2);
    expect(store.fields.gallery.value[0].preview_url).toBe(images[0].preview_url);
    expect(store.fields.gallery.value[1].preview_url).toBe(images[1].preview_url);
  });

  describe("updateExperienceMedia", () => {
    const pinia = createPinia();
    const store = useExperienceMediaStore(pinia);

    test("it should update the fields", async () => {
      contentQueryMock.getDistributionContent = vi.fn().mockResolvedValueOnce({
        data: { ...mockDistributionContent },
      });

      await store.loadExperienceMedia("random-id");
      store.fields.gallery.value.push({
        id: "new-image",
        name: "new-name",
        preview_url: "new-url",
        visualization_order: 3,
      });

      await store.updateExperienceMedia("random-id");
      expect(contentCommandApiMock.putExperienceMedia).toHaveBeenCalledWith("experience-media/random-media-id", {
        ...store.experienceMediaData,
        id: undefined,
        images_v2: [
          { id: "image-id-1", image_type: "GALLERY", visualization_order: 1 },
          { id: "image-id-2", image_type: "GALLERY", visualization_order: 2 },
          { id: "new-image", image_type: "GALLERY", visualization_order: 3 },
        ],
      });
    });

    test("it should upload the new images", async () => {
      contentQueryMock.getDistributionContent = vi.fn().mockResolvedValueOnce({
        data: { ...mockDistributionContent },
      });
      await store.loadExperienceMedia("random-id");

      const newImage = {
        id: "new-image",
        name: "new-name",
        preview_url: "new-url",
        visualization_order: 3,
        dam_data: { filename: "new-name", preview_url: "new-url" },
      };

      store.fields.gallery.value.push(newImage);
      await store.updateExperienceMedia("random-id");
      expect(contentCommandApiMock.postImage).toHaveBeenCalledWith("v2/images", {
        file_name: "new-name",
        preview_url: "new-url",
      });
    });

    test("it should delete the images that have been removed", async () => {
      contentQueryMock.getDistributionContent = vi.fn().mockResolvedValueOnce({
        data: { ...mockDistributionContent },
      });
      await store.loadExperienceMedia("random-id");

      store.fields.gallery.value.splice(0, 1);

      await store.updateExperienceMedia("random-id");

      expect(contentCommandApiMock.deleteImage).toHaveBeenCalledWith("v2/images/image-id-1");
    });
  });

  describe("if the status id passed is 'ready'", () => {
    const pinia = createPinia();
    const store = useExperienceMediaStore(pinia);

    test("it should set the 'ready' status", async () => {
      contentQueryMock.getDistributionContent = vi.fn().mockResolvedValueOnce({
        data: { ...mockDistributionContent },
      });
      vi.clearAllMocks();
      await store.loadExperienceMedia("random-id");
      await store.updateExperienceMedia("random-id", { publish: true });

      expect(contentCommandApiMock.putExperienceMedia).toHaveBeenCalledWith("experience-media/random-media-id", {
        ...store.experienceMediaData,
        id: undefined,
        experience_id: "random-id",
        status_code: "READY",
        images_v2: [
          { id: "image-id-1", image_type: "GALLERY", visualization_order: 1 },
          { id: "image-id-2", image_type: "GALLERY", visualization_order: 2 },
        ],
      });
    });
  });

  describe("if the image POST is not returning any id", () => {
    const pinia = createPinia();
    const store = useExperienceMediaStore(pinia);

    test("it should throw an error", async () => {
      contentQueryMock.getDistributionContent = vi.fn().mockResolvedValueOnce({
        data: { ...mockDistributionContent },
      });
      contentCommandApiMock.postImage = vi.fn().mockResolvedValueOnce({});
      await store.loadExperienceMedia("random-id");

      const newImage = {
        id: "new-image",
        name: "new-name",
        preview_url: "new-url",
        visualization_order: 3,
        dam_data: { filename: "new-name", preview_url: "new-url" },
      };

      store.fields.gallery.value.push(newImage);

      await store.updateExperienceMedia("random-id").catch((error) => {
        expect(error.message).toBe("No image url provided!");
      });

      // check if the notification appears
      expect(notificationStoreMock.addNotification).toHaveBeenCalledWith({
        message: "notifications.error.uploading.image",
        theme: "error",
      });
    });
  });

  describe("if the image DELETE fail", () => {
    const pinia = createPinia();
    const store = useExperienceMediaStore(pinia);

    test("it should show a notification", async () => {
      vi.clearAllMocks();

      contentQueryMock.getDistributionContent = vi.fn().mockResolvedValueOnce({
        data: { ...mockDistributionContent },
      });
      contentCommandApiMock.deleteImage = vi.fn().mockResolvedValueOnce(Promise.reject());
      await store.loadExperienceMedia("random-id");

      store.fields.gallery.value.shift();
      await store.updateExperienceMedia("random-id");

      expect(notificationStoreMock.addNotification).toHaveBeenCalledWith({
        message: "notifications.error.deleting.image",
        theme: "error",
      });
      //
    });
  });
});
