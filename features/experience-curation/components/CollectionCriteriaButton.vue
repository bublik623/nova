<template>
  <div class="border-2 rounded-lg flex justify-between items-center py-1">
    <div>
      <h3 class="font-normal text-xs no-wrap pl-2">{{ $t("experience.collection-criteria.title") }}</h3>
    </div>
    <NovaButton
      size="sm"
      variant="text"
      theme="primary"
      class="mt-4 w-16"
      data-testid="experience-curation-brand-collection-criteria"
      @click="handleOpenModal"
    >
      <NovaIcon name="preview" class="mr-1" :size="14" />

      <span class="text-xs">
        {{ $t("common.view") }}
      </span>
    </NovaButton>
  </div>
</template>

<script setup lang="ts">
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import { useAsyncModal } from "@/features/core-shared/composables/useAsyncModal";
import CollectionCriteriaModal from "./CollectionCriteriaModal.vue";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";

export interface BrandCollectionCriteriaModalProps {
  bestValueGuaranteed: string;
  createdWithCare: string;
  exceptionalExperiences: string;
}

const props = defineProps<BrandCollectionCriteriaModalProps>();
const modal = useAsyncModal(CollectionCriteriaModal, {
  closeOnOverlayClick: true,
});

async function handleOpenModal() {
  await modal.openModal(props);
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";
</style>
