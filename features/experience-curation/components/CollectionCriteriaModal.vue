<template>
  <div class="w-screen max-w-screen-md">
    <div class="flex px-4 pt-5 pb-2 justify-between items-center">
      <div />
      <h2>{{ $t("experience.collection-criteria.title") }}</h2>
      <NovaButtonIcon
        name="close"
        shape="square"
        :size="14"
        theme="dark"
        data-testid="create-pickup-modal-close-btn"
        @click="() => $emit('confirm')"
      />
    </div>

    <div class="overflow-auto h-[512px] p-5 m-4 grid gap-4">
      <div v-for="field in fields" :key="field.label">
        <h3 class="font-medium">{{ field.label }}</h3>
        <div v-if="field.value?.length > 0" class="mt-2">
          <RenderHtml
            :data-testid="`collection-criteria-description-${field.key}`"
            class="font-normal text-text-90"
            :string="field.value"
          />
        </div>
        <template v-else>
          <NoContentUtil />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type BrandCollectionCriteriaModalProps } from "./CollectionCriteriaButton.vue";
import { type UseAsyncModalEvents } from "@/features/core-shared/composables/useAsyncModal";
import NovaButtonIcon from "@/ui-kit/NovaButtonIcon/NovaButtonIcon.vue";
import NoContentUtil from "@/features/experience-shared/components/NoContentUtil.vue";
import RenderHtml from "@/components/Utils/RenderHtml/RenderHtml.vue";

const { $t } = useNuxtApp();
const props = defineProps<BrandCollectionCriteriaModalProps>();
defineEmits<UseAsyncModalEvents>();

const fields = [
  {
    key: "exceptional-experiences",
    label: $t("experience.collection-criteria.exceptional-experiences"),
    value: props.exceptionalExperiences,
  },
  {
    key: "best-value-guaranteed",
    label: $t("experience.collection-criteria.best-value-guaranteed"),
    value: props.bestValueGuaranteed,
  },
  {
    key: "created-with-care",
    label: $t("experience.collection-criteria.created-with-care"),
    value: props.createdWithCare,
  },
];
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";
</style>
