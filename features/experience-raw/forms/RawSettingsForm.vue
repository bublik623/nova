<template>
  <FormSection id="title" :required="requiredFields.includes('title')" :slot-max-width="500">
    <NovaInputText
      id="title"
      v-model="model.title"
      :placeholder="$t('experience.title.input.placeholder')"
      :error="$t(errors?.title?.join(',') || '')"
      :disabled="options.isReadonly || isTitleDisabled"
      :readonly="options.isReadonly"
      :readonly-placeholder="$t('common.no-content')"
      data-testid="raw-settings-title"
    />
  </FormSection>

  <FormSection id="supplier_name" :required="requiredFields.includes('supplier_id')" :slot-max-width="430">
    <FieldSupplierCard
      v-model="model.supplier_id"
      input-id="supplier-name"
      :readonly="options.isReadonly || isSupplierIdDisabled"
      data-testid="raw-settings-supplier-name"
    />
  </FormSection>

  <FormSection
    id="external_reference_code"
    :required="requiredFields.includes('external_reference_code')"
    :slot-max-width="325"
  >
    <NovaInputText
      id="external_reference_code"
      v-model="model.external_reference_code"
      :placeholder="$t('experience.external_reference_code.input.placeholder')"
      :readonly="options.isReadonly"
      :readonly-placeholder="$t('common.no-content')"
      data-testid="raw-settings-external-reference-code"
    />
  </FormSection>

  <FormSection id="categories" :required="requiredFields.includes('categories_interests')">
    <ExperienceCategory
      v-if="model.categories_interests"
      v-model:selected-category="model.categories_interests.categories"
      v-model:selected-interests="model.categories_interests.interests"
      :categories="masterdata.experienceCategories"
      :interests="masterdata.experienceInterests"
      :readonly="options.isReadonly"
      data-testid="raw-settings-categories-interests"
    />
  </FormSection>

  <FormSection id="promotional_options" :required="requiredFields.includes('promotional_options')">
    <NovaInputRadioGroup
      v-model="model.promotional_options"
      layout="vertical"
      name="promotional_options.options"
      :options="promotionalOptions"
      :readonly="options.isReadonly"
      :readonly-placeholder="$t('common.no-content')"
      data-testid="raw-settings-promotional-options"
    />
  </FormSection>

  <FormSection id="product_brand" :required="requiredFields.includes('product_brand')">
    <ProductBrandField
      :product-brand="model.product_brand"
      :best-value-guaranteed="model.collection_criteria?.best_value_guaranteed"
      :created-with-care="model.collection_criteria?.created_with_care"
      :exceptional-experiences="model.collection_criteria?.exceptional_experiences"
      :options="productBrandOptions"
      :placeholder="$t('common.no-content')"
      :is-readonly="options.isReadonly"
      data-testid="raw-settings-product-brand"
      @update:best-value-guaranteed="($event) => updateCollectionCriteria({ best_value_guaranteed: $event })"
      @update:created-with-care="($event) => updateCollectionCriteria({ created_with_care: $event })"
      @update:exceptional-experiences="($event) => updateCollectionCriteria({ exceptional_experiences: $event })"
      @update:product-brand="updateProductBrand"
    />
  </FormSection>

  <FormSection
    v-if="options.showNatGeo"
    id="nat_geo_tour_level"
    :required="requiredFields.includes('nat_geo_tour_levels')"
  >
    <NovaInputRadioGroup
      v-model="model.nat_geo_tour_levels"
      layout="vertical"
      name="nat_geo_tour_level.options"
      :options="natGeoOptions"
      :readonly="options.isReadonly"
      :readonly-placeholder="$t('common.no-content')"
      data-testid="raw-settings-nat-geo-tour-levels"
    />
  </FormSection>

  <FormSection id="own_offer" :required="requiredFields.includes('own_offer')">
    <NovaInputRadioGroup
      v-model="model.own_offer"
      layout="vertical"
      name="own_offer.options"
      :options="ownOfferOptions"
      :readonly="options.isReadonly"
      :readonly-placeholder="$t('common.no-content')"
      data-testid="raw-settings-own-offer"
    />
  </FormSection>
</template>

<script setup lang="ts">
import NovaInputText from "@/ui-kit/NovaInputText/NovaInputText.vue";
import { Supplier } from "@/types/generated/ContractMasterDataApi";
import NovaInputRadioGroup from "@/ui-kit/NovaInputRadioGroup/NovaInputRadioGroup.vue";
import ProductBrandField from "@/features/experience-raw/components/ProductBrandField.vue";
import { isDisabledDuringCuration } from "@/features/experience-raw/utils/experience-raw-utils";
import { useVModel } from "@vueuse/core";
import ExperienceCategory from "@/components/Document/ExperienceCategory/ExperienceCategory.vue";
import { ExperienceRawOptions, RawSettingValues } from "../types/experience";
import { Category, Interest } from "@/types/generated/ExperienceMasterDataApi";
import FormSection from "@/components/Document/FormSection/FormSection.vue";
import { StoreError } from "@/features/experience-shared/composables/useStoreFields";
import FieldSupplierCard from "@/features/experience-shared/field-supplier/components/FieldSupplierCard.vue";

export interface RawSettingsMasterdata {
  experienceCategories: Category[];
  experienceInterests: Interest[];
  supplierList: Supplier[];
  isSupplierLoading: boolean;
  promotionalOptions: { code: string; name: string }[];
  productBrandOptions: { code: string; name: string }[];
  ownOfferOptions: { code: string; name: string }[];
  natGeoOptions: { code: string; name: string }[];
}

interface Props {
  requiredFields: string[];
  options: ExperienceRawOptions & { showNatGeo: boolean };
  modelValue: RawSettingValues;
  errors?: StoreError;
  masterdata: RawSettingsMasterdata;
}

interface Events {
  (e: "update:modelValue", value: RawSettingValues): void;
}

const props = defineProps<Props>();
const emits = defineEmits<Events>();

const model = useVModel(props, "modelValue", emits, {
  passive: true,
  deep: true,
});

const isTitleDisabled = computed(() => isDisabledDuringCuration("title", props.options.statusCode));
const isSupplierIdDisabled = computed(() => props.options.statusCode !== "IN_CREATION");

const promotionalOptions = props.masterdata.promotionalOptions.map(mapOption);
const productBrandOptions = props.masterdata.productBrandOptions.map(mapOption);
const ownOfferOptions = props.masterdata.ownOfferOptions.map(mapOption);
const natGeoOptions = props.masterdata.natGeoOptions.map(mapOption);

function updateProductBrand(value: string) {
  model.value.product_brand = value;
  // We need to reset the nat_geo_tour_levels when the product brand is changed
  // Otherwise the nat_geo_tour_levels will be sent to the backend
  model.value.nat_geo_tour_levels = "";
}

function updateCollectionCriteria(value: {
  best_value_guaranteed?: string;
  created_with_care?: string;
  exceptional_experiences?: string;
}) {
  model.value.collection_criteria = {
    ...model.value.collection_criteria,
    ...value,
  };
}

function mapOption(option: { code: string; name: string }) {
  return {
    label: option.name,
    value: option.code,
  };
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";
</style>
