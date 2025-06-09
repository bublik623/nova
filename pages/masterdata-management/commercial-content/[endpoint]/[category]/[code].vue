<template>
  <div v-if="pending">
    <ul>
      <li class="skeleton_item" :style="{ width: '70%', height: '30px', marginTop: '23px' }" />
      <li class="skeleton_item" :style="{ width: '70%', height: '30px', marginTop: '23px' }" />
    </ul>
  </div>
  <div v-else-if="items?.data">
    <DetailCard
      :title="$t('masterdata.detail-card.item')"
      :description="findTranslation('en')?.name"
      :information="[]"
      :translations="translations"
      :can-edit
      @click:add-translation="
        handleTranslation({ action: 'add', translation: findTranslation($event.language)!, mainTranslation })
      "
      @click:edit-main-language="handleUpdateItemNameAndCategory(mainTranslation)"
      @click:edit-translation="
        handleTranslation({ action: 'update', translation: findTranslation($event.language)!, mainTranslation })
      "
    />
  </div>
</template>

<script setup lang="ts">
import { ExperienceMasterDataEndpoint } from "@/composables/useExperienceMasterDataApi";
import { useCommercialContentItem } from "@/features/masterdata-management-commercial-content/composables/useCommercialContentItem";
import DetailCard from "@/features/masterdata-management-shared/components/DetailCard.vue";
import { hasPermission } from "@/features/roles/lib/has-permission";
import { useRoute } from "vue-router";

const route = useRoute();

const masterdata = useExperienceMasterDataApi();
const { handleTranslation, handleUpdateItemNameAndCategory } = useCommercialContentItem();
const canEdit = hasPermission("masterdata-management.canWrite");

const { data: items, pending } = useLazyAsyncData(`get-${route.params.code}`, () => {
  return masterdata.getPremades(route.params.endpoint as ExperienceMasterDataEndpoint, {
    code: String(route.params.code),
  });
});

const translations = computed(() =>
  (items.value?.data || []).flatMap((el) =>
    el.language_code === "en"
      ? []
      : [
          {
            language: el.language_code,
            label: `common.language.${el.language_code}`,
            value: el.name,
          },
        ]
  )
);

const findTranslation = (languageCode?: string) => {
  const data = (items.value?.data || []).find((el) => el.language_code === languageCode);

  if (!data) {
    console.error(`no translation found with the code ${languageCode}`);
  }

  return data;
};

const mainTranslation = computed(() => findTranslation("en"));
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";
</style>
