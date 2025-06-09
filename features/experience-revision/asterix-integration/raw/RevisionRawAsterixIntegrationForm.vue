<template>
  <FormSection id="raw.asterix-integration.service-and-modalities-codes" :required="true" :slot-max-width="700">
    <AsterixServiceAndModalitiesListField
      :readonly="true"
      :experience-reference-code="experienceReferenceCode"
      :value="asxServicesAndModalitiesCodes"
    ></AsterixServiceAndModalitiesListField>
  </FormSection>
</template>
<script setup lang="ts">
import FormSection from "@/components/Document/FormSection/FormSection.vue";
import AsterixServiceAndModalitiesListField from "@/features/experience-raw/components/AsterixServiceAndModalities/AsterixServiceAndModalitiesListField.vue";
import { RevisionFormProps } from "../../types/forms";

const props = defineProps<RevisionFormProps>();

const experienceReferenceCode = computed(() => {
  return props.values?.refCode;
});

const asxServicesAndModalitiesCodes = computed(() => {
  if (props.values?.productType !== "ASX") {
    return [];
  }

  return props.values.asx_codes ?? [];
});
</script>
