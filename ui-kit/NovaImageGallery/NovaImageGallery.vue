<template>
  <NovaSortableList
    v-if="modelValue.length > 0"
    v-slot="{ item }"
    :model-value="modelValue"
    layout="grid"
    :disabled="disabled || readonly"
    @update:model-value="(event) => handleGalleryImageReorder(event as ManageableGenericItem<ExperienceImage>[])"
  >
    <NovaImagePreviewCard
      :image="(item as ManageableGenericItem<ExperienceImage>)"
      :disabled="disabled"
      :readonly="readonly"
      @click:delete="handleGalleryImageDelete"
    />
  </NovaSortableList>
  <ImagesSelectionModal
    v-model="selectedImages"
    :open="openModal"
    :images="fotowareImages"
    @close:modal="openModal = false"
    @update:model-value="handleGalleryImageAdd"
  />
  <div>
    <NovaButton
      v-if="!readonly"
      :disabled="disabled"
      size="sm"
      data-testid="nova-image-gallery-button"
      @click="handleOpenModal()"
      >{{ ctaText }}</NovaButton
    >
  </div>
</template>

<script lang="ts" setup>
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import NovaImagePreviewCard from "@/ui-kit/NovaImagePreviewCard/NovaImagePreviewCard.vue";
import NovaSortableList from "@/ui-kit/NovaSortableList/NovaSortableList.vue";
import { ManageableGenericItem } from "@/types/ManageableItems";
import ImagesSelectionModal from "@/features/experience-media/components/ImagesSelectionModal.vue";
import { useDamServiceApi } from "@/features/core-shared/composables/useDamServiceApi";
import { Image as DamImage } from "@/types/generated/DamServiceApi";
import { ExperienceImage, useExperienceMediaStore } from "@/features/experience-media/stores/useExperienceMediaStore";

export interface Props {
  modelValue: ExperienceImage[];
  ctaText?: string;
  disabled?: boolean;
  readonly?: boolean;
}

interface Events {
  (e: "update:modelValue", images: ExperienceImage[]): void;
}

type DamImages = Array<Required<DamImage>>;

const damService = useDamServiceApi();
const route = useRoute();
const id = route.params.id as string;
const props = defineProps<Props>();
const emit = defineEmits<Events>();
const fotowareImages = ref<DamImages>([]);
const selectedImages = ref<DamImages | ExperienceImage[]>([]);
const openModal = ref(false);

const mediaStore = useExperienceMediaStore();

const preSelectedImages = computed<ExperienceImage[]>(() => {
  return mediaStore.fields.gallery.value.filter((galleryItem) => {
    return fotowareImages.value.some((image) => image.preview_url === galleryItem.preview_url);
  });
});

watchEffect(() => (selectedImages.value = preSelectedImages.value.map((el) => ({ ...el, isPreSelected: true }))));

function createExperienceImage(damImage: Required<DamImage> | ExperienceImage, order: number): ExperienceImage {
  if ("isPreSelected" in damImage && damImage.isPreSelected) {
    return { ...damImage, visualization_order: order };
  } else {
    const image = damImage as Required<DamImage>;

    return {
      id: image.filename,
      preview_url: image.preview_url,
      name: image.filename,
      image_type: "GALLERY",
      visualization_order: order,
      dam_data: image,
    };
  }
}

async function handleGalleryImageAdd() {
  const images: ExperienceImage[] = [];

  selectedImages.value.forEach((image) => images.push(createExperienceImage(image, images.length + 1)));

  emit("update:modelValue", images);
  openModal.value = false;
}

function handleGalleryImageDelete(imageId: string) {
  emit(
    "update:modelValue",
    props.modelValue.filter((i) => i.id !== imageId).map((i, idx) => ({ ...i, visualization_order: idx + 1 }))
  );
}

function handleGalleryImageReorder(images: ManageableGenericItem<ExperienceImage>[]) {
  emit("update:modelValue", images);
}

async function handleOpenModal() {
  openModal.value = true;

  if (!fotowareImages.value.length) {
    const { data } = await damService.getImages(id);
    fotowareImages.value = data as Array<Required<DamImage>>;
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";
</style>
