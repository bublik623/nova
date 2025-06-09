<template>
  <FormSection id="description" :required="requiredFields.includes('description')">
    <NovaTextEditor
      :model-value="values?.description"
      :placeholder="$t('experience.description.editor.placeholder')"
      :data-testid="`editorial-description`"
      :readonly="true"
    />
  </FormSection>

  <FormSection
    v-if="isCuration"
    id="seo_description"
    data-testid="revision-content-segmentation-form-seo-description"
    :required="requiredFields.includes('seoDescription')"
  >
    <NovaTextEditor
      :model-value="values?.seoDescription"
      :data-testid="`editorial-seo-description`"
      :placeholder="$t('experience.seo_description.title')"
      :readonly="true"
    />
  </FormSection>

  <FormSection
    v-if="options?.showAdditionalDescription"
    id="additional_description"
    :required="requiredFields.includes('additionalDescription')"
  >
    <NovaTextEditor
      :model-value="values?.additionalDescription"
      :placeholder="$t('experience.additional_description.editor.placeholder')"
      :readonly="true"
      data-testid="editorial-additional-description"
    />
  </FormSection>
  <FormSection id="features" :required="requiredFields.includes('features')">
    <NovaCheckboxGroup
      :model-value="values?.features"
      class="experience__features"
      :options="featuresOptions"
      :readonly="true"
    />
  </FormSection>

  <template v-for="keys in highlightsKeys" :key="keys.app">
    <FormSection :id="keys.app" :required="requiredFields.includes(keys.app)">
      <RawHighlights
        class="max-w-md"
        :model-value="
          values?.[keys.revision] || {
            custom: [],
            premade: [],
          }
        "
        :hierarchical-groups="masterdata.hierarchicalGroups"
        :data-testid="`curation-${keys.app}`"
        :masterdata-options="masterdata[keys.store]"
        :options="{
          title: `experience.${keys.app}.title`,
          placeholder: $t(`experience.${keys.app}.creation.placeholder`),
        }"
        :readonly="true"
      />
    </FormSection>
  </template>

  <FormSection id="duration" :required="requiredFields.includes('duration')">
    <AdditionalServices
      id="duration-curation"
      :model-value="values?.duration || []"
      class="max-w-md"
      :additional-services="durationOptions"
      :open="!!values?.duration"
      :readonly="true"
    />
  </FormSection>
</template>

<script setup lang="ts">
import NovaTextEditor from "@/ui-kit/NovaTextEditor/NovaTextEditor.vue";
import { RevisionFormProps } from "../types/forms";
import NovaCheckboxGroup from "@/ui-kit/NovaCheckboxGroup/NovaCheckboxGroup.vue";
import { premadeApiKeys } from "@/features/experience-highlights/lib/get-all-premade-highlights";
import RawHighlights from "@/features/experience-raw/components/RawHighlights.vue";
import AdditionalServices from "@/components/Document/AdditionalServices/AdditionalServices.vue";

import { useMasterData } from "@/stores/master-data";
import FormSection from "@/components/Document/FormSection/FormSection.vue";

const props = defineProps<RevisionFormProps>();

const masterdata = useMasterData();

const isCuration = computed(() => props.flow === "curation");

const featuresOptions = computed(() =>
  masterdata.getAdditionalServicesByFGCode("FEATURES").map((i) => ({
    label: i.name,
    value: i.code,
  }))
);

const highlightsKeys = premadeApiKeys;
const durationOptions = masterdata.getAdditionalServicesByFGCode("DURATION");
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";
</style>
