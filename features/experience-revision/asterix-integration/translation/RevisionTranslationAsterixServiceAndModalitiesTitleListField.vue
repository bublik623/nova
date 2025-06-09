<template>
  <AsterixServiceAndModalitiesTitleListField
    :reference-value="referenceValue ?? []"
    :target-value="value"
    :readonly="true"
    :show-reference="true"
    @update:value="logUnexpectedUpdateError"
  >
    <template #reference-label>
      <FlagLanguageDisplay :country-code="masterLanguageCode"></FlagLanguageDisplay>
    </template>
    <template #target-label>
      <FlagLanguageDisplay :country-code="languageCode"></FlagLanguageDisplay>
    </template>
  </AsterixServiceAndModalitiesTitleListField>
</template>
<script setup lang="ts">
import AsterixServiceAndModalitiesTitleListField from "@/features/experience-shared/asterix-integration/asterix-service-and-modalities-titles/components/AsterixServiceAndModalitiesTitleListField.vue";
import { AvailableLanguage } from "@/types/Language";
import FlagLanguageDisplay from "@/features/experience-translation/components/FlagLanguageDisplay.vue";
import { ServiceAndModalitiesTitleListValue } from "@/features/experience-shared/asterix-integration/asterix-service-and-modalities-titles/types/service-and-modalities-title-list-value";
import { useRevisionStore } from "../../store/useRevisionStore";

export type TranslationAsterixServiceAndModalitiesTitleListFieldProps = {
  value: ServiceAndModalitiesTitleListValue;
  languageCode: AvailableLanguage;
};

defineProps<TranslationAsterixServiceAndModalitiesTitleListFieldProps>();

const masterLanguageCode = computed(() => "en" as AvailableLanguage);

const revisionStore = useRevisionStore();

const referenceValue = computed(() => {
  if (revisionStore.curationValues?.productType !== "ASX") {
    return [];
  }

  return revisionStore.curationValues?.serviceAndModalitiesTitleTranslationList;
});

function logUnexpectedUpdateError(newValue: ServiceAndModalitiesTitleListValue) {
  console.error("unexpected update in revision curation asterix integration form", { newValue });
}
</script>
