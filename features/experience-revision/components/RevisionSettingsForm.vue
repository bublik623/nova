<template>
  <DocumentFormSection id="title" :required="requiredFields?.includes('title')" :slot-max-width="500">
    <NovaInputText
      id="title"
      :model-value="values?.title"
      :placeholder="$t('experience.title.input.placeholder')"
      :readonly="true"
      :readonly-placeholder="$t('common.no-content')"
    />
  </DocumentFormSection>

  <DocumentFormSection id="supplier_name" :required="requiredFields?.includes('supplierName')" :slot-max-width="325">
    <NovaInputText
      id="supplier-name"
      :model-value="values?.supplierName"
      input-id="supplier-name"
      :placeholder="$t('experience.supplier_name.input.placeholder')"
      :readonly="true"
    />
  </DocumentFormSection>

  <DocumentFormSection
    id="external_reference_code"
    :required="requiredFields?.includes('externalReferenceCode')"
    :slot-max-width="325"
  >
    <NovaInputText
      id="external_reference_code"
      :model-value="values?.externalReferenceCode"
      :placeholder="$t('experience.external_reference_code.input.placeholder')"
      :readonly="true"
      :readonly-placeholder="$t('common.no-content')"
    />
  </DocumentFormSection>

  <DocumentFormSection
    v-if="isCuration"
    id="seo_title"
    :required="requiredFields?.includes('seoTitle')"
    :slot-max-width="500"
    data-testid="revision-settings-form-seo-title"
  >
    <NovaInputText
      id="seo-title"
      :model-value="values?.seoTitle"
      :placeholder="$t('experience.seo_title.title')"
      :readonly="true"
      :readonly-placeholder="$t('common.no-content')"
    />
  </DocumentFormSection>
  <DocumentFormSection id="categories" :required="requiredFields?.includes('experienceCategory')">
    <ExperienceCategory
      :selected-category="values?.experienceCategory || ['']"
      :selected-interests="values?.experienceInterest || ['']"
      :categories="masterdata.experienceCategories"
      :interests="masterdata.experienceInterests"
      :readonly="true"
    />
  </DocumentFormSection>

  <DocumentFormSection id="promotional_options" :required="requiredFields?.includes('promotionalOption')">
    <NovaInputRadioGroup
      :model-value="values?.promotionalOption"
      layout="vertical"
      name="promotional_options.options"
      :options="promotionalOptions"
      :readonly="true"
      :readonly-placeholder="$t('common.no-content')"
    />
  </DocumentFormSection>

  <DocumentFormSection id="product_brand" :required="requiredFields?.includes('productBrand')">
    <NovaInputRadioGroup
      v-if="isCuration"
      :model-value="values?.productBrand"
      layout="vertical"
      name="product_brand.options"
      :options="productBrandOptions"
      :readonly="true"
      :readonly-placeholder="$t('common.no-content')"
    />

    <ProductBrandField
      v-else
      :best-value-guaranteed="values?.collectionCriteria?.bestValueGuaranteed ?? ''"
      :created-with-care="values?.collectionCriteria?.createdWithCare ?? ''"
      :exceptional-experiences="values?.collectionCriteria?.exceptionalExperiences ?? ''"
      :product-brand="values?.productBrand ?? ''"
      :options="productBrandOptions"
      :placeholder="$t('common.no-content')"
      :is-readonly="true"
    />
  </DocumentFormSection>

  <DocumentFormSection
    v-if="options?.showNatGeoField"
    id="nat_geo_tour_level"
    :required="requiredFields?.includes('natGeoTourLevel')"
  >
    <NovaInputRadioGroup
      :model-value="values?.natGeoTourLevel"
      layout="vertical"
      name="nat_geo_tour_level.options"
      :options="natGeoOptions"
      :readonly="true"
      :readonly-placeholder="$t('common.no-content')"
    />
  </DocumentFormSection>

  <DocumentFormSection id="own_offer" :required="requiredFields?.includes('ownOffer')">
    <NovaInputRadioGroup
      :model-value="values?.ownOffer"
      layout="vertical"
      name="own_offer.options"
      :options="ownOfferOptions"
      :readonly="true"
      :readonly-placeholder="$t('common.no-content')"
    />
  </DocumentFormSection>
</template>

<script setup lang="ts">
import ExperienceCategory from "@/components/Document/ExperienceCategory/ExperienceCategory.vue";
import NovaInputRadioGroup from "@/ui-kit/NovaInputRadioGroup/NovaInputRadioGroup.vue";
import NovaInputText from "@/ui-kit/NovaInputText/NovaInputText.vue";
import { RevisionFormProps } from "../types/forms";
import { useMasterData } from "@/stores/master-data";
import { RadioOption } from "@/ui-kit/NovaInputRadio/NovaInputRadio.vue";
import { AdditionalService } from "@/types/generated/ExperienceMasterDataApi";
import ProductBrandField from "@/features/experience-raw/components/ProductBrandField.vue";

const props = defineProps<RevisionFormProps>();

const isCuration = computed(() => props.flow === "curation");

const masterdata = useMasterData();
// we need to manually fetch the categories and interests here
masterdata.getCategoriesAndInterests();

const productBrandOptions = computed<RadioOption[]>(() =>
  masterdata.getAdditionalServicesByFGCode("PRODUCT_BRAND").map(mapOption)
);

const promotionalOptions = computed<RadioOption[]>(() =>
  masterdata.getAdditionalServicesByFGCode("PROMOTIONAL_OPTIONS").map(mapOption)
);

const ownOfferOptions = computed<RadioOption[]>(() =>
  masterdata.getAdditionalServicesByFGCode("OWN_OFFER").map(mapOption)
);

const natGeoOptions = computed<RadioOption[]>(() =>
  masterdata.getAdditionalServicesByFGCode("NAT_GEO_TOUR_LEVELS").map(mapOption)
);

function mapOption(option: AdditionalService) {
  return {
    label: option.name,
    value: option.code,
  };
}
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";
</style>
