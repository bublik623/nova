<template>
  <RawSettingsForm
    :model-value="values"
    :options="{
      isReadonly: !hasPermission('experience.raw.canWrite'),
      showNatGeo: rawSettingsStore.isNatGeo,
      productType: rawExperienceStore.productType,
      statusCode: rawExperienceStore.statusCode,
    }"
    :required-fields="rawSettingsStore.requiredFields"
    :errors="rawSettingsStore.formErrors"
    :masterdata="{
      experienceCategories,
      experienceInterests,
      isSupplierLoading: suppliersMasterdataQuery.isLoading.value,
      supplierList: suppliersMasterdataQuery.data.value || [],
      productBrandOptions: masterData.getAdditionalServicesByFGCode('PRODUCT_BRAND'),
      natGeoOptions: masterData.getAdditionalServicesByFGCode('NAT_GEO_TOUR_LEVELS'),
      promotionalOptions: masterData.getAdditionalServicesByFGCode('PROMOTIONAL_OPTIONS'),
      ownOfferOptions: masterData.getAdditionalServicesByFGCode('OWN_OFFER'),
    }"
    @update:model-value="handleUpdateValues"
  />
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useMasterData } from "@/stores/master-data";
import { RawPageProps } from "@/features/experience-raw/types/pages";
import RawSettingsForm from "@/features/experience-raw/forms/RawSettingsForm.vue";
import { useSuppliersMasterdataQuery } from "@/features/experience-masterdata/queries/suppliers-masterdata-query";
import { useRawSettingsStore } from "@/features/experience-raw/stores/useRawSettingsStore";
import { useRawExperienceStore } from "@/features/experience-raw/stores/useRawExperienceStore";
import { useDistributionContentStore } from "@/features/experience-shared/stores/useDistributionContentStore";
import { RawSettingValues } from "@/features/experience-raw/types/experience";
import { hasPermission } from "@/features/roles/lib/has-permission";

defineProps<RawPageProps>();

const masterData = useMasterData();

const rawSettingsStore = useRawSettingsStore();

const rawExperienceStore = useRawExperienceStore();
const distributionContentStore = useDistributionContentStore();

const values = computed<RawSettingValues>(() => ({
  ...rawSettingsStore.values,
  supplier_id: distributionContentStore.values.supplier_id,
}));

function handleUpdateValues(e: RawSettingValues) {
  rawSettingsStore.updateValues(e);
  distributionContentStore.updateValues({ supplier_id: e.supplier_id });
}

const { experienceCategories, experienceInterests } = storeToRefs(masterData);
if (experienceCategories.value.length === 0 || experienceInterests.value.length === 0) {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  masterData.getCategoriesAndInterests();
}

const suppliersMasterdataQuery = useSuppliersMasterdataQuery();
</script>
