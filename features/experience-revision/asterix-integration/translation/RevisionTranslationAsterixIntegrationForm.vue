<template>
  <FormSection id="translation.asterix-integration.service-and-modalities-codes" :required="true" :slot-max-width="700">
    <RevisionTranslationAsterixServiceAndModalitiesTitleListField
      :language-code="props.language"
      :value="serviceAndModalitiesTitleTranslationList"
    ></RevisionTranslationAsterixServiceAndModalitiesTitleListField>
  </FormSection>
</template>
<script setup lang="ts">
import FormSection from "@/components/Document/FormSection/FormSection.vue";
import RevisionTranslationAsterixServiceAndModalitiesTitleListField from "./RevisionTranslationAsterixServiceAndModalitiesTitleListField.vue";
import { TranslationFormProps } from "@/features/experience-translation/types";
import { ExperienceRevision } from "../../types/revision";

const props = defineProps<TranslationFormProps<ExperienceRevision | null>>();

const serviceAndModalitiesTitleTranslationList = computed(() => {
  if (props.initialValues?.productType !== "ASX") {
    return [];
  }

  return props.initialValues?.serviceAndModalitiesTitleTranslationList ?? [];
});
</script>
