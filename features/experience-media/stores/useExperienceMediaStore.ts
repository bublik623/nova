import { FormField } from "@/types/Form";
import { ExperienceMedia, ImageV2Ids } from "@/types/generated/ContentCommandApi";
import { ExperienceMedia as ExperienceMediaCQS } from "@/types/generated/ContentQueryApiV2";
import { ImageV2 as ImageV2CQS } from "@/types/generated/ContentQueryApi";
import { defineStore } from "pinia";
import { Image as DamImage } from "@/types/generated/DamServiceApi";
import { useNotifications } from "@/stores/notifications";
import { useLogger } from "@/features/core-shared/composables/useLogger";
import { useContentQueryApi } from "@/composables/useContentQueryApi";
import { useContentCommandApi } from "@/composables/useContentCommandApi";
import { waitForTimeout } from "@/features/core-shared/utils/promise/wait";
import { updateDelayMs } from "@/features/experience-shared/constants/experience-shared-constants";

export interface ExperienceImage {
  id: string;
  name: string;
  preview_url: string;
  visualization_order: number;
  image_type?: string;
  isPreSelected?: boolean;
  dam_data?: Required<DamImage>;
}

type Fields = {
  gallery: FormField<ExperienceImage[], true>;
};

function mapPayloadToForm(images?: ImageV2CQS[]): ExperienceImage[] {
  return (
    images?.map((image) => ({
      id: image.id,
      name: image.file_name as string,
      preview_url: image.preview_url,
      visualization_order: image.visualization_order,
    })) ?? []
  );
}

function mapFormToPayload(images: ExperienceImage[]): ImageV2Ids {
  return images.map((img) => ({
    id: img.id,
    visualization_order: img.visualization_order,

    // all the images are gallery for the moment
    image_type: "GALLERY",
  }));
}

export const useExperienceMediaStore = defineStore("useExperienceMediaStore", () => {
  const experienceMediaData = ref<ExperienceMediaCQS>();
  const experienceTitle = ref<string>();

  const fields = ref<Fields>({
    gallery: {
      value: [],
      required: true,
      category: "media",
    },
  });

  async function loadExperienceMedia(experienceId: string) {
    const { getDistributionContent } = useContentQueryApi();
    const { data } = await getDistributionContent(experienceId);

    const images = data.experience_media?.images_v2;

    if (images) {
      images.sort((a, b) => a.visualization_order - b.visualization_order);
    }
    fields.value.gallery.value = mapPayloadToForm(data.experience_media?.images_v2) || [];
    experienceMediaData.value = data.experience_media;

    const englishTranslation = data.experience_content?.find((translation) => translation.language_code === "en");
    experienceTitle.value = englishTranslation?.experience_translation?.title;
  }

  async function updateExperienceMedia(experienceId: string, options: { publish: boolean } = { publish: false }) {
    const { putExperienceMedia } = useContentCommandApi();
    const originalImages = experienceMediaData.value?.images_v2;
    const updatedImages = fields.value.gallery.value;

    const imagesToDelete = originalImages?.filter((i) => !updatedImages.map(({ id }) => id).includes(i.id));
    const imagesToUpload = updatedImages.filter(({ dam_data }) => dam_data);

    for (const image of imagesToUpload) {
      if (image.dam_data) {
        const url = await uploadImage({
          file_name: image.dam_data.filename,
          preview_url: image.dam_data.preview_url,
        });
        if (!url) {
          throw new Error("No image url provided!");
        }
        image.id = url.split("/images/")[1];
        image.dam_data = undefined;
      }
    }

    const newExperienceMedia = {
      ...experienceMediaData.value,
      experience_id: experienceId,
      status_code: "IN_REVIEW",
      images_v2: mapFormToPayload(updatedImages),
    };

    await putExperienceMedia(`experience-media/${experienceMediaData.value?.id}`, {
      ...newExperienceMedia,
      id: undefined,
      distribution_status: undefined,
    } as ExperienceMedia);

    if (options.publish) {
      // in order to trigger the event to send to distribution the new media entity
      // the status must change from "in review" to "ready"
      // todo refactor task: OFF-2547
      newExperienceMedia.status_code = "READY";
      await putExperienceMedia(`experience-media/${experienceMediaData.value?.id}`, {
        ...newExperienceMedia,
        id: undefined,
        distribution_status: undefined,
      } as ExperienceMedia);
    }

    if (imagesToDelete) {
      for (const image of imagesToDelete) {
        await deleteImage(image.id);
      }
    }

    // todo remove delay OFF-2547
    await waitForTimeout(updateDelayMs);
    await refreshNuxtData(`getDistributionContent-${experienceId}`);

    experienceMediaData.value = { ...newExperienceMedia, images_v2: updatedImages } as ExperienceMediaCQS;
  }

  async function uploadImage(image: { file_name: string; preview_url: string }): Promise<string> {
    const { addNotification } = useNotifications();
    const { postImage } = useContentCommandApi();
    const { logError } = useLogger();

    try {
      const { headers } = await postImage("v2/images", image);
      if (!headers.location) {
        throw new Error(`No location in headers for image: ${JSON.stringify(image)}`);
      }
      return headers.location;
    } catch (error) {
      logError("upload-media", error);
      addNotification({
        theme: "error",
        message: "notifications.error.uploading.image",
      });
      return "";
    }
  }

  async function deleteImage(imageId: string) {
    const { addNotification } = useNotifications();
    const { deleteImage: deleteImageContentCommand } = useContentCommandApi();
    const { logError } = useLogger();

    try {
      await deleteImageContentCommand(`v2/images/${imageId}`);
    } catch (error) {
      logError("delete-media", error);
      addNotification({
        theme: "error",
        message: "notifications.error.deleting.image",
      });
    }
  }

  return {
    loadExperienceMedia,
    updateExperienceMedia,
    fields,
    experienceTitle,
    experienceMediaData,
  };
});
