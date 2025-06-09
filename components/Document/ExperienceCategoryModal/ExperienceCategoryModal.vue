<template>
  <NovaModal :show="show" @click:on-overlay="$emit('close:modal')">
    <div class="ExperienceCategoryModal">
      <div class="ExperienceCategoryModal__header">
        <h3>{{ $t("experience.category.modal.title") }}</h3>
        <p class="mt-2">
          {{ $t("experience.category.modal.subtitle") }}
          {{ isSelectingInterests ? 2 : 1 }}/2
        </p>
        <NovaButtonIcon
          name="close"
          shape="square"
          :size="14"
          theme="dark"
          data-testid="category-modal-close-btn"
          @click="$emit('close:modal')"
        />
      </div>

      <div v-if="!isSelectingInterests" class="ExperienceCategoryModal__categories">
        <p>{{ $t("experience.category.modal.categories.title") }}</p>
        <button
          v-for="category in categories"
          :key="category.id"
          :selected="category.code === currentCategory[0]"
          class="ExperienceCategoryCard"
          data-testid="category-modal-category"
          @click="currentCategory = [category.code]"
        >
          <input
            :id="category.id"
            type="checkbox"
            :name="category.name"
            :checked="category.code === currentCategory[0]"
          />
          <NovaIcon :name="categoryIconMap[category.code]" :size="24" />
          {{ category.name }}
        </button>
      </div>

      <div v-else class="ExperienceCategoryModal__interests">
        <p>{{ $t("experience.category.modal.interests.title") }}</p>
        <div>
          <NovaInputText
            id="experience-interests-search-bar"
            v-model="interestsFilter"
            left-icon="search"
            :placeholder="$t('experience.category.modal.interests.placeholder')"
          />
        </div>
        <ul>
          <li v-for="interest in filteredInterests" :key="interest.id">
            <NovaCheckbox
              :label="interest.name"
              :value="interest.code"
              :status="currentInterests.includes(interest.code) ? 'checked' : 'unchecked'"
              data-testid="category-modal-interest"
              @update:status="handleSelectInterest"
            />
          </li>
        </ul>
      </div>

      <div class="ExperienceCategoryModal__footer">
        <NovaButton
          v-if="!isSelectingInterests"
          size="sm"
          :disabled="currentCategory.length === 0"
          data-testid="category-modal-next-btn"
          @click="isSelectingInterests = true"
        >
          {{ $t("common.next") }}
          <NovaIcon name="chevron-right" />
        </NovaButton>

        <template v-else>
          <NovaButton
            size="sm"
            :disabled="currentInterests.length === 0"
            data-testid="category-modal-save-btn"
            @click="handleSave"
          >
            {{ $t("common.save") }}
          </NovaButton>
          <NovaButton
            size="sm"
            variant="underlined"
            data-testid="category-modal-back-btn"
            @click="isSelectingInterests = false"
          >
            {{ $t("common.back") }}
          </NovaButton>
        </template>
      </div>
    </div>
  </NovaModal>
</template>

<script lang="ts" setup>
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import NovaButtonIcon from "@/ui-kit/NovaButtonIcon/NovaButtonIcon.vue";
import NovaCheckbox from "@/ui-kit/NovaCheckbox/NovaCheckbox.vue";
import NovaIcon, { Icon } from "@/ui-kit/NovaIcon/NovaIcon.vue";
import NovaInputText from "@/ui-kit/NovaInputText/NovaInputText.vue";
import NovaModal from "@/ui-kit/NovaModal/NovaModal.vue";
import { Category, Interest } from "@/types/generated/ExperienceMasterDataApi";
import { Categories, FunctionalRaw, Interests } from "@/types/generated/ExperienceRawServiceApi";

export type ExperienceCategoryModelValue = Pick<FunctionalRaw, "categories" | "interests">;

export interface Props {
  show: boolean;
  categories: Category[];
  interests: Interest[];
  modelValue: ExperienceCategoryModelValue;
}

interface Events {
  (e: "close:modal"): void;
  (e: "update:modelValue", value: ExperienceCategoryModelValue): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Events>();

const categoryIconMap: Record<string, Icon> = {
  ACTIVITIES: "thumbtack",
  BOAT_TRIPS: "sailboat",
  DAY_TRIPS: "map",
  SIGHTSEEING_PASSES: "binoculars",
  TICKETS_AND_EVENTS: "ticket-event",
  GUIDED_TOURS: "person-flag",
  HOP_ON_HOP_OFF: "bus",
  PRIVATE_TOURS: "lock",
  TRANSFERS: "van-shuttle",
  SHOREX: "ship",
  SERVICES_AND_EXTRAS: "handshake",
  THEME_PARKS: "castle",
  MULTI_DAY_TOURS: "calendar-check",
};

const currentCategory = ref<Categories>([]);
const currentInterests = ref<Interests>([]);
const isSelectingInterests = ref(false);

// Reset modal when closing it and opening it again
watch(
  () => props.show,
  () => {
    currentCategory.value = [...(props.modelValue.categories ?? [])];
    currentInterests.value = [...(props.modelValue.interests ?? [])];
    isSelectingInterests.value = false;
  }
);

const interestsFilter = ref("");
const filteredInterests = computed(() =>
  props.interests.filter((i) => i.name.toLowerCase().includes(interestsFilter.value.toLowerCase()))
);

function handleSelectInterest(code: string) {
  if (currentInterests.value.includes(code)) {
    currentInterests.value = currentInterests.value.filter((i) => i !== code);
  } else {
    currentInterests.value.push(code);
  }
}

function handleSave() {
  emit("update:modelValue", {
    categories: [...currentCategory.value],
    interests: [...currentInterests.value],
  });
  emit("close:modal");
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.ExperienceCategoryModal {
  width: rem(640);
  height: rem(650);
  display: grid;
  grid-template-rows: 1fr rem(500) 1fr;
  @include font-semibold(14);

  &__header {
    position: relative;
    padding: rem(20) rem(20) rem(15);
    text-align: center;
    border-bottom: var(--border-default);
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

  &__categories {
    padding: rem(20);
    display: grid;
    overflow-y: scroll;
    gap: 13px;
    grid-template-columns: repeat(3, 1fr);

    & > p {
      grid-column: 1 / -1;
    }

    & > button {
      display: flex;
      flex-direction: column;
      text-align: start;
    }
  }

  &__interests {
    padding: rem(20);
    padding-bottom: 0;
    display: flex;
    flex-direction: column;

    & > div {
      margin: rem(15) 0;
      padding: rem(10);
      background-color: var(--color-grey-70);
      border-radius: var(--border-radius-default);
    }

    & > ul {
      padding-bottom: rem(10);
      display: grid;
      gap: 13px;
      grid-template-columns: repeat(2, 1fr);
      overflow-y: scroll;
    }
  }

  &__footer {
    padding: rem(20) rem(20) rem(15);
    border-top: var(--border-default);
    display: flex;
    flex-direction: row-reverse;
    justify-content: space-between;
    align-items: center;
  }
}

.ExperienceCategoryCard {
  cursor: pointer;
  padding: rem(10) rem(15);
  border: var(--border-default);
  border-radius: var(--border-radius-default);

  & > input {
    display: none;
  }

  .svg-icon {
    display: block;
    margin-bottom: rem(8);
  }

  &:hover {
    border-color: var(--color-text-80);
  }

  &[selected="true"] {
    color: var(--color-primary-100);
    border-color: var(--color-primary-100);
    background-color: var(--color-primary-05);
  }
}
</style>
