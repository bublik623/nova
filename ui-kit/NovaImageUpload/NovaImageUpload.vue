<template>
  <NovaImagePreview
    v-if="modelValue"
    :image="modelValue"
    data-testid="nova-image-preview"
    @click:edit="handleImageEdit"
    @click:delete="$emit('update:modelValue', null)"
  />
  <NovaDropZone
    v-show="!modelValue"
    ref="dropzone"
    class="NovaDropZone"
    :options="{ acceptedFiles: 'image/*', maxSize: 1000000 }"
    @file:added="$emit('update:modelValue', createExperienceImage($event))"
    @file:rejected="handleErrors"
    @error="handleErrors"
  >
    <div class="NovaDropZone__cta">
      <NovaIcon name="image" :size="25" />
      {{ ctaText }}
    </div>
  </NovaDropZone>
</template>

<script lang="ts" setup>
import NovaDropZone from "@/ui-kit/NovaDropZone/NovaDropZone.vue";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";
import NovaImagePreview from "@/ui-kit/NovaImagePreview/NovaImagePreview.vue";
import { useFileDialog } from "@/composables/useFileDialog";

export interface Image {
  id: string;
  name: string;
  media_type: string;
  url?: string;
  visualization_order: number;
  is_cover?: boolean;
  original_file?: File;
}

export interface Props {
  modelValue: Image | null;
  isCover: boolean;
  ctaText?: string;
}

interface Events {
  (e: "update:modelValue", image: Image | null): void;
  (e: "error", msg: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Events>();

const { openDialog, files } = useFileDialog();

function createExperienceImage(file: File): Image {
  return {
    id: file.name,
    url: URL.createObjectURL(file),
    is_cover: props.isCover,
    name: file.name,
    media_type: file.type,
    visualization_order: 0,
    original_file: file,
  };
}

async function handleImageEdit() {
  await openDialog({ accept: "image/*", multiple: false });
  emit("update:modelValue", createExperienceImage(files.value[0]));
}

function handleErrors(errors: string | string[]) {
  if (Array.isArray(errors)) {
    errors.forEach((error) => {
      emit("error", error);
    });
  } else {
    emit("error", errors);
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.NovaDropZone {
  border: 1px dashed var(--color-grey-100);
  border-radius: var(--border-radius-sm);
  min-height: 300px;

  &__cta {
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: rem(5);
    color: var(--color-primary-100);
    text-decoration: underline;

    @include font-semibold(14);

    &:hover {
      color: var(--color-primary-110);
    }
  }
}
</style>
