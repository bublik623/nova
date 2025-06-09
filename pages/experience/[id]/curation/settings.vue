<template>
  <DocumentFormSection id="title" :required="curationDocument.fields.title.required" :slot-max-width="500">
    <div v-show="showRawFields" class="mb-4">
      <div class="mb-2">
        <NovaLabel theme="middle-grey">{{ $t("experience.curation.view-type.raw") }}</NovaLabel>
      </div>
      <NovaInputText id="raw-title" :model-value="experienceRawData.title" :readonly="true">
        <DiffText
          v-if="curationStore.hasDiff"
          :value="experienceRawData.title"
          :old-value="rawSnapshot?.raw?.commercial?.title ?? ''"
        />
      </NovaInputText>
    </div>
    <div class="mb-2">
      <NovaLabel theme="teal-green">{{ $t("experience.curation.view-type.commercial") }}</NovaLabel>
    </div>
    <NovaInputText
      id="editorial-title"
      v-model="curationDocument.fields.title.value"
      :placeholder="$t('experience.title.input.placeholder')"
      :error="!curationDocument.fields.title.value ? $t('experience.title.input.error') : ''"
      :readonly="isReadonly"
      :readonly-placeholder="$t('common.no-content')"
    />
  </DocumentFormSection>

  <DocumentFormSection v-show="isAllView" id="supplier_name" :required="true" :slot-max-width="325">
    <FieldSupplierCard
      :model-value="rawDocument.fields.supplier_id.value"
      :readonly="true"
      input-id="curation-supplier-name"
    />
  </DocumentFormSection>

  <DocumentFormSection v-show="isAllView" id="external_reference_code" :required="false" :slot-max-width="325">
    <!-- readonly -->
    <NovaInputText
      id="external_reference_code"
      :model-value="experienceRawData.external_reference_code"
      :placeholder="$t('experience.external_reference_code.input.placeholder')"
      :readonly="true"
      :readonly-placeholder="$t('common.no-content')"
    />
  </DocumentFormSection>

  <DocumentFormSection id="seo_title" :required="curationDocument.fields.seo_title.required" :slot-max-width="500">
    <div class="mb-2">
      <NovaLabel theme="teal-green">{{ $t("experience.curation.view-type.commercial") }}</NovaLabel>
    </div>
    <NovaInputText
      id="seo-title"
      v-model="curationDocument.fields.seo_title.value"
      :placeholder="$t('experience.seo_title.title')"
      :readonly="isReadonly"
      :readonly-placeholder="$t('common.no-content')"
    />
  </DocumentFormSection>

  <DocumentFormSection v-show="isAllView" id="categories">
    <DocumentExperienceCategory
      v-model:selected-category="curationDocument.fields.categories_interests.value.categories"
      v-model:selected-interests="curationDocument.fields.categories_interests.value.interests"
      :categories="experienceCategories"
      :interests="experienceInterests"
      :readonly="isReadonly || areNonCommercialFieldsReadonly"
    />
  </DocumentFormSection>

  <DocumentFormSection
    v-show="isAllView"
    id="promotional_options"
    :required="curationDocument.fields.promotional_options.required"
  >
    <NovaInputRadioGroup
      v-model="curationDocument.fields.promotional_options.value"
      data-testid="promotional-options-options"
      layout="vertical"
      name="promotional_options.options"
      :options="promotionalOptions"
      :readonly="isReadonly || areNonCommercialFieldsReadonly"
      :readonly-placeholder="$t('common.no-content')"
    />
  </DocumentFormSection>

  <DocumentFormSection v-show="isAllView" id="product_brand" :required="curationDocument.fields.product_brand.required">
    <NovaInputRadioGroup
      v-model="curationDocument.fields.product_brand.value"
      data-testid="product-brand-options"
      layout="vertical"
      name="product_brand.options"
      :options="productBrandOptions"
      :readonly="isReadonly || areNonCommercialFieldsReadonly"
      :readonly-placeholder="$t('common.no-content')"
    />
  </DocumentFormSection>

  <DocumentFormSection
    v-show="showNatGeoField && isAllView"
    id="nat_geo_tour_level"
    data-testid="nat-geo-options"
    :required="curationDocument.fields.nat_geo_tour_levels.required"
  >
    <NovaInputRadioGroup
      v-model="curationDocument.fields.nat_geo_tour_levels.value"
      layout="vertical"
      name="nat_geo_tour_level.options"
      :options="natGeoOptions"
      :readonly="isReadonly || areNonCommercialFieldsReadonly"
      :readonly-placeholder="$t('common.no-content')"
    />
  </DocumentFormSection>

  <DocumentFormSection v-show="isAllView" id="own_offer" :required="curationDocument.fields.own_offer.required">
    <NovaInputRadioGroup
      v-model="curationDocument.fields.own_offer.value"
      data-testid="own-offer-options"
      layout="vertical"
      name="own_offer.options"
      :options="ownOfferOptions"
      :readonly="isReadonly || areNonCommercialFieldsReadonly"
      :readonly-placeholder="$t('common.no-content')"
    />
  </DocumentFormSection>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useExperienceCuration } from "@/stores/experience-curation";
import { useExperienceRaw } from "@/stores/experience-raw";
import { useMasterData } from "@/stores/master-data";
import NovaInputText from "@/ui-kit/NovaInputText/NovaInputText.vue";
import { AdditionalService } from "@/types/generated/ExperienceMasterDataApi";
import { RadioOption } from "@/ui-kit/NovaInputRadio/NovaInputRadio.vue";
import NovaInputRadioGroup from "@/ui-kit/NovaInputRadioGroup/NovaInputRadioGroup.vue";
import { eventBusCuration } from "@/features/experience-shared/composables/useEventBus";
import { saveCurationContent } from "@/features/experience-curation/lib/saveCurationContent";
import { CurationPageEvents, CurationPageProps } from "@/features/experience-curation/types";
import DiffText from "@/features/experience-shared/components/DiffText.vue";
import NovaLabel from "@/ui-kit/NovaLabel/NovaLabel.vue";
import { useExperienceRawQuery } from "@/features/experience-raw/queries/experience-raw-query";
import { mapRawElementToRawSettingsValue } from "@/features/experience-raw/lib/map-raw-element";
import FieldSupplierCard from "@/features/experience-shared/field-supplier/components/FieldSupplierCard.vue";
import { areNonCommercialFieldsEditableForUser, viewIsTypeAll } from "@/features/experience-curation/lib/viewTypeUtils";

const route = useRoute();
const id = route.params.id as string;
const idRef = computed(() => route.params.id as string); // duplicated to not change too many lines, will be removed soon™

const props = defineProps<CurationPageProps>();
const emit = defineEmits<CurationPageEvents>();

const isAllView = computed(() => viewIsTypeAll(props.selectedView));
const areNonCommercialFieldsReadonly = computed(() => !areNonCommercialFieldsEditableForUser());

const masterData = useMasterData();
const experienceRawQuery = useExperienceRawQuery(idRef);
const experienceRawData = computed(() => mapRawElementToRawSettingsValue(experienceRawQuery.data.value));

const rawStore = useExperienceRaw();
const rawDocument = computed(() => rawStore.rawContents[id]);
const curationStore = useExperienceCuration();
const curationDocument = computed(() => curationStore.curationDocuments[id]);
const rawSnapshot = computed(() => curationStore.rawSnapshot);

const mapOption = (option: AdditionalService) => {
  return {
    label: option.name,
    value: option.code,
  };
};

const productBrandOptions = computed<RadioOption[]>(() =>
  masterData.getAdditionalServicesByFGCode("PRODUCT_BRAND").map(mapOption)
);

const promotionalOptions = computed<RadioOption[]>(() =>
  masterData.getAdditionalServicesByFGCode("PROMOTIONAL_OPTIONS").map(mapOption)
);

const ownOfferOptions = computed<RadioOption[]>(() =>
  masterData.getAdditionalServicesByFGCode("OWN_OFFER").map(mapOption)
);

const natGeoOptions = computed<RadioOption[]>(() =>
  masterData.getAdditionalServicesByFGCode("NAT_GEO_TOUR_LEVELS").map(mapOption)
);

const showNatGeoField: ComputedRef<boolean> = computed(
  () => curationDocument.value.fields.product_brand.value === "BRAND_NATIONAL_GEOGRAPHIC"
);

// Experience categories
const { experienceCategories, experienceInterests } = storeToRefs(masterData);
if (experienceCategories.value.length === 0 || experienceInterests.value.length === 0) {
  masterData.getCategoriesAndInterests();
}

// if the NatGeo tours levels filed exist it should be required
watch(showNatGeoField, (curr) => {
  curationDocument.value.fields.nat_geo_tour_levels.required = showNatGeoField.value;

  if (curr === false) {
    curationDocument.value.fields.nat_geo_tour_levels.value = "";
  }
});

watch(
  // watch all the stores used in the page
  () => curationDocument.value.fields,
  (curr, prev) => {
    // needed to not trigger the watcher when curation document load
    if (curr === prev && !curationStore.isSaving) {
      emit("hasUnsavedChanges", true);
    }
  },
  {
    deep: true,
  }
);

// Saving

const stopBus = eventBusCuration.on(
  async (
    event,
    opt: { nextSection: string; publish: boolean; redirect: boolean; translate: boolean; force: boolean }
  ) => {
    if (event === "SAVE") {
      saveCurationContent({
        afterSaving: () => {
          eventBusCuration.emit("SAVED", opt);
        },
        id,
        nextSection: opt?.nextSection,
        redirect: opt?.redirect,
        translate: opt?.translate,
        publish: opt?.publish,
        force: opt?.force,
      });
    }
  }
);

onBeforeUnmount(() => stopBus());
</script>
