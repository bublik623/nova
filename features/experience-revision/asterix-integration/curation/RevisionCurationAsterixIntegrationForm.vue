<template>
  <FormSection id="curation.asterix-integration.service-and-modalities-codes" :required="true" :slot-max-width="700">
    <CurationAsterixServiceAndModalitiesTitleListField
      :readonly="true"
      :show-reference="true"
      :target-value="serviceAndModalitiesTitleTranslationList"
      @update:value="logUnexpectedUpdateError"
    ></CurationAsterixServiceAndModalitiesTitleListField>
  </FormSection>
</template>
<script setup lang="ts">
import FormSection from "@/components/Document/FormSection/FormSection.vue";
import CurationAsterixServiceAndModalitiesTitleListField from "@/features/experience-curation/asterix-integration/components/CurationAsterixServiceAndModalitiesTitleListField.vue";
import { RevisionFormProps } from "../../types/forms";
import { ServiceAndModalitiesTitleListValue } from "@/features/experience-shared/asterix-integration/asterix-service-and-modalities-titles/types/service-and-modalities-title-list-value";

const props = defineProps<RevisionFormProps>();

const serviceAndModalitiesTitleTranslationList = computed(() => {
  if (props.values?.productType !== "ASX") {
    return [];
  }

  return props.values?.serviceAndModalitiesTitleTranslationList ?? [];
});

function logUnexpectedUpdateError(newValue: ServiceAndModalitiesTitleListValue) {
  console.error("unexpected update in revision curation asterix integration form", { newValue });
}
</script>
