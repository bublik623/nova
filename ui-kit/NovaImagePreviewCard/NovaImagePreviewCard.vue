<template>
  <div class="NovaImagePreviewCard">
    <div class="NovaImagePreviewCard__header">
      <span>{{ image.visualization_order }}.</span>
      <NovaButtonIcon
        v-if="!readonly"
        :disabled="disabled"
        name="trash"
        theme="dark"
        :size="18"
        @click="$emit('click:delete', image.id)"
      />
    </div>
    <div class="NovaImagePreviewCard__img-container">
      <img :src="image.preview_url" alt="Uploaded preview" data-testid="nova-image-preview-card-image" />
    </div>
    <div class="NovaImagePreviewCard__footer">
      <span data-testid="nova-image-preview-card-name">
        <NovaTooltip theme="dark">
          <template #content> {{ props.image.name }}</template>
          {{ clippedFileName }}
        </NovaTooltip>
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import NovaButtonIcon from "@/ui-kit/NovaButtonIcon/NovaButtonIcon.vue";
import { ExperienceImage } from "@/features/experience-media/stores/useExperienceMediaStore";
import NovaTooltip from "../NovaTooltip/NovaTooltip.vue";

export interface Props {
  image: ExperienceImage;
  disabled?: boolean;
  readonly?: boolean;
}
interface Events {
  (e: "click:delete", ImageId: ExperienceImage["id"]): void;
}

const props = defineProps<Props>();
defineEmits<Events>();

const clippedFileName = computed(() => {
  if (props.image.name.length > 20) {
    const fileExtension = props.image.name.split(".").pop();
    return `${props.image.name.substring(0, 19)}... ${fileExtension}`;
  }
  return props.image.name;
});
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.NovaImagePreviewCard {
  cursor: default;
  border: var(--border-default);
  border-radius: var(--border-radius-sm);
  background-color: var(--color-white);
  display: grid;
  grid-template-rows: auto 150px 42px;

  &:hover {
    outline: 4px solid var(--color-primary-10);
  }

  &__header {
    padding: 0 5px;
    min-height: rem(30);
    display: grid;
    align-items: center;
    grid-template-columns: 1fr auto auto;
    gap: rem(5);
    border-bottom: var(--border-default);

    @include font-semibold(14);

    & > span {
      width: 20px;
      height: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      color: var(--color-primary);
      background-color: var(--color-primary-10);
      border-radius: 50%;
      @include font-semibold(12);
    }
  }

  .svg-icon {
    margin-right: rem(5);
  }

  &__img-container > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }

  &__footer {
    padding: 3px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    white-space: nowrap;
    color: var(--color-text-80);
    border-top: var(--border-default);
    @include font-semibold(12);
  }

  &__grip {
    text-align: center;
    color: var(--color-text-100);
  }
}
</style>
