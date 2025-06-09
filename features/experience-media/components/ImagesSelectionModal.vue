<template>
  <NovaModal :show="props.open" @click:on-overlay="$emit('close:modal')">
    <div class="ImagesSelectionModal" data-testid="images-selection-modal">
      <div class="ImagesSelectionModal__header">
        <h3>{{ $t("experience.media.selection-modal.title") }}</h3>
        <NovaButtonIcon
          name="close"
          shape="square"
          :size="14"
          theme="dark"
          data-testid="experience.media.selection-modal.close"
          @click="$emit('close:modal')"
        />
      </div>
      <div v-if="images.length" class="ImagesSelectionModal__content">
        <p class="ImagesSelectionModal__description">{{ $t("experience.media.selection-modal.description") }}</p>
        <div class="ImagesSelectionModal__searchbar mt-4">
          <NovaInputText id="experience.media.selection-modal.searchbar" v-model="searchQuery" left-icon="search" />
        </div>

        <div class="ImagesSelectionModal__select-all mt-4">
          <NovaCheckbox
            :status="status"
            value="select-all-images"
            :label="$t('experience.media.selection-modal.checkbox.select-all.label')"
            @update:status="() => handleMultipleSelection(status)"
          />
          &nbsp; ({{ selectedImages.length + " " + $t("common.selected") }})
        </div>

        <ul class="ImagesList mt-3">
          <li
            v-for="image in sortedImages"
            v-show="filteredImages.includes(image)"
            :key="image.preview_url"
            data-testid="image-selection-modal-list-item"
            class="ImagesList__item mb-3"
          >
            <NovaCheckbox
              :status="selectedImages.some((item) => item.preview_url === image.preview_url) ? 'checked' : 'unchecked'"
              class="mr-4"
              :value="image.preview_url"
              @update:status="() => handleSelection([image])"
            />
            <img :src="image.preview_url" alt="fotoware preview" class="mr-4" width="160" height="120" />
            <div class="ImagesList__item-description">{{ image.filename }}</div>
          </li>
        </ul>
      </div>
      <!-- temporary, missing design -->
      <div v-else class="noImages">there are no images!</div>
      <div v-if="images.length" class="ImagesSelectionModal__actions">
        <NovaButton
          size="sm"
          data-testid="experience.media.selection-modal.clear-all"
          variant="underlined"
          @click="selectedImages = []"
          >{{ $t("common.clear.all_selected") }}</NovaButton
        >
        <NovaButton
          size="sm"
          data-testid="experience.media.selection-modal.save"
          @click="modelValue = [...selectedImages]"
          >{{ $t("common.save") }}</NovaButton
        >
      </div>
    </div>
  </NovaModal>
</template>

<script setup lang="ts">
import NovaButtonIcon from "@/ui-kit/NovaButtonIcon/NovaButtonIcon.vue";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import NovaCheckbox, { NovaCheckBoxStatus } from "@/ui-kit/NovaCheckbox/NovaCheckbox.vue";
import NovaInputText from "@/ui-kit/NovaInputText/NovaInputText.vue";
import NovaModal from "@/ui-kit/NovaModal/NovaModal.vue";
import { useVModel } from "@vueuse/core";
import { Image } from "@/types/generated/DamServiceApi";
import { ExperienceImage } from "../stores/useExperienceMediaStore";
import { sortBy } from "lodash";

export interface Props {
  images: Array<Required<Image>>;
  modelValue: Array<Required<Image> | ExperienceImage>;
  open: boolean;
}

interface Events {
  (e: "update:modelValue", images: Array<Required<Image>>): void;
  (e: "close:modal"): void;
}

const props = defineProps<Props>();
const emits = defineEmits<Events>();

const modelValue = useVModel(props, "modelValue", emits);
const selectedImages = ref<Props["modelValue"]>([]);

watchEffect(() => {
  selectedImages.value = [...modelValue.value];
});

const searchQuery = ref("");

const filteredImages = computed(() =>
  props.images.filter((el) => {
    const filenameLowerCase = el.filename.toLowerCase();
    const searchQueryLowerCase = searchQuery.value.toLowerCase();

    return filenameLowerCase.includes(searchQueryLowerCase);
  })
);

const sortedImages = computed(() => sortBy(props.images, (img) => img.filename.toLowerCase()));

const handleSelection = (images: Array<Required<Image>>) => {
  images.forEach((image) => {
    const index = selectedImages.value.findIndex((img) => img.preview_url === image.preview_url);

    if (index !== -1) {
      selectedImages.value.splice(index, 1);
    } else {
      selectedImages.value.push(image);
    }
  });
};

const handleMultipleSelection = (checkboxStatus: NovaCheckBoxStatus) => {
  if (checkboxStatus === "unchecked") {
    handleSelection(filteredImages.value);
  } else {
    selectedImages.value = [];
  }
};

const status = computed<NovaCheckBoxStatus>(() => {
  switch (selectedImages.value.length) {
    case 0:
      return "unchecked";
    case props.images.length:
      return "checked";

    default:
      return "indeterminate";
  }
});
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.ImagesSelectionModal {
  width: rem(640);
  height: rem(650);
  color: var(--color-text-100);

  @include font-semibold(14);

  &__header {
    position: relative;
    padding: rem(20) rem(20) rem(15);
    text-align: center;
    @include font-semibold(12);

    & > h3 {
      @include font-bold(14);
    }

    & > button {
      position: absolute;
      right: rem(20);
      top: rem(20);
    }
  }

  &__description {
    @include font-semibold(14);
  }

  &__content {
    margin-top: rem(24);
    padding: 0 rem(20);
  }

  &__searchbar {
    background: var(--color-neutral-10);
    padding: rem(8);
    border-radius: var(--border-radius-default);
  }

  &__select-all {
    display: flex;
  }

  &__actions {
    display: flex;
    justify-content: space-between;
    padding: rem(16) rem(20);
    position: absolute;
    width: 100%;
    bottom: 0;
    background: var(--color-white);
    border-top: 1px solid var(--color-neutral-60);
    border-radius: 0 0 var(--border-radius-default) var(--border-radius-default);
  }
}

.ImagesList {
  padding-bottom: rem(8);
  height: rem(390);
  overflow-x: hidden;

  &__item {
    display: flex;
    align-items: center;

    &-description {
      @include font-regular(14);
    }
  }

  img {
    object-fit: cover;
    object-position: center;
    background: var(--color-neutral-10);
  }
}

.noImages {
  height: 30%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
