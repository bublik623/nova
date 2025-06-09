<template>
  <NoContentUtil v-if="readonly && isEmpty" />
  <span v-else>
    <div
      v-if="isEmpty"
      class="ExperienceCategory ExperienceCategory--empty"
      :disabled="disabled"
      data-testid="experience-category"
    >
      {{ $t("experience.category.empty.title") }}
      <NovaButton v-if="!disabled" size="sm" data-testid="experience-category-show-btn" @click="showModal = true">{{
        $t("experience.category.empty.cta")
      }}</NovaButton>
    </div>

    <div
      v-else
      class="ExperienceCategory ExperienceCategory--filled"
      :disabled="disabled"
      data-testid="experience-category"
    >
      <div>
        <h3>{{ $t("experience.category.title.category") }}:</h3>
        <p>{{ categories?.find((c) => c.code === selectedCategory?.[0])?.name }}</p>
      </div>
      <div>
        <h3>{{ $t("experience.category.title.interests") }}:</h3>
        <p>
          {{ selectedInterests?.map((s) => interests?.find((i) => i.code === s)?.name).join(", ") }}
        </p>
      </div>
      <NovaButton
        v-if="!disabled && !readonly"
        variant="text"
        size="sm"
        data-testid="experience-category-edit-btn"
        @click="showModal = true"
      >
        <NovaIcon name="edit" :size="18" class="mr-1" />
        {{ $t("common.edit") }}</NovaButton
      >
    </div>

    <ExperienceCategoryModal
      :show="showModal"
      :categories="categories || []"
      :interests="interests || []"
      :model-value="{
        categories: selectedCategory,
        interests: selectedInterests,
      }"
      @update:model-value="($event) => handleEvent($event)"
      @close:modal="showModal = false"
    />
  </span>
</template>

<script lang="ts" setup>
import ExperienceCategoryModal, {
  ExperienceCategoryModelValue,
} from "@/components/Document/ExperienceCategoryModal/ExperienceCategoryModal.vue";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";
import { Category, Interest } from "@/types/generated/ExperienceMasterDataApi";
import { Categories, Interests } from "@/types/generated/ExperienceRawServiceApi";
import NoContentUtil from "@/features/experience-shared/components/NoContentUtil.vue";

export interface Props {
  disabled?: boolean;
  categories?: Category[];
  interests?: Interest[];
  selectedCategory?: Categories; // API supports multiple categories, but the user can select only one
  selectedInterests?: Interests;
  readonly: boolean;
}

interface Events {
  (e: "update:selectedCategory", value: Categories): void;
  (e: "update:selectedInterests", value: Interests): void;
}

const props = defineProps<Props>();
const emits = defineEmits<Events>();

const showModal = ref(false);
const isEmpty = computed(() => [...(props.selectedCategory || []), ...(props.selectedInterests || [])].length === 0);

function handleEvent({ categories, interests }: ExperienceCategoryModelValue) {
  if (categories) {
    emits("update:selectedCategory", categories);
  }
  if (interests) {
    emits("update:selectedInterests", interests);
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.ExperienceCategory {
  position: relative;
  width: rem(430);
  padding: rem(20) rem(18) rem(15);
  border: var(--border-default);
  border-radius: var(--border-radius-default);
  @include font-bold(14);

  &--empty {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &--filled {
    & p {
      margin-top: rem(5);
      margin-bottom: rem(15);
      @include font-regular(14);
    }

    & > button {
      position: absolute;
      top: rem(10);
      right: rem(10);
      @include font-bold(14);
    }
  }

  &[disabled="true"] {
    color: var(--color-text-70);
  }
}
</style>
