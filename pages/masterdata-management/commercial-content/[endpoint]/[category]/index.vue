<template>
  <div v-if="pending">
    <ul>
      <li class="skeleton_item" :style="{ width: '70%', height: '30px', marginTop: '23px' }" />
      <li class="skeleton_item" :style="{ width: '70%', height: '30px', marginTop: '23px' }" />
    </ul>
  </div>
  <div v-else-if="items?.data">
    <DetailCard
      :title="$t('masterdata.detail-card.category')"
      :description="mainTranslation?.name"
      :information="[]"
      :can-edit
      @click:add-translation="
        handleCategoryTranslation({ action: 'add', translation: findTranslation($event.language)!, mainTranslation })
      "
      @click:edit-main-language="handleEditCategoryName(mainTranslation)"
      @click:edit-translation="
        handleCategoryTranslation({
          action: 'update',
          translation: findTranslation($event.language)!,
          mainTranslation,
        })
      "
    />
  </div>
</template>

<script setup lang="ts">
import { useCommercialContentCategory } from "@/features/masterdata-management-commercial-content/composables/useCommercialContentCategory";
import DetailCard from "@/features/masterdata-management-shared/components/DetailCard.vue";
import { hasPermission } from "@/features/roles/lib/has-permission";
import { useRoute } from "vue-router";

const route = useRoute();
const { handleEditCategoryName, handleCategoryTranslation } = useCommercialContentCategory();

const masterdata = useExperienceMasterDataApi();
const canEdit = computed(() => hasPermission("masterdata-management.canWrite") && !!mainTranslation.value);

const { data: items, pending } = useLazyAsyncData(`get-${route.params.category}`, () => {
  return masterdata.getHierarchicalGroups({ code: String(route.params.category) });
});

const mainTranslation = computed(() => findTranslation("en"));

const findTranslation = (languageCode?: string) => {
  const data = (items.value?.data || []).find((el) => el.language_code === languageCode);

  if (!data) {
    console.error(`no translation found with the code ${languageCode}`);
  }

  return data;
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";
</style>
