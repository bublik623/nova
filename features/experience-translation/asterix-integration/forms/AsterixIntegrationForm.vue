<template>
  <main class="form">
    <FormSection
      id="translation.asterix-integration.service-and-modalities-codes"
      :required="true"
      :slot-max-width="700"
    >
      <TranslationAsterixServiceAndModalitiesTitleListField
        :experience-id="experienceId"
        :readonly="readonly"
        :language-code="languageCode"
        :target-value="store.values.serviceAndModalitiesTitleTranslationList"
        @update:value="(newValue) => store.updateValues({ serviceAndModalitiesTitleTranslationList: newValue })"
      ></TranslationAsterixServiceAndModalitiesTitleListField>
    </FormSection>
  </main>
</template>
<script setup lang="ts">
import FormSection from "@/components/Document/FormSection/FormSection.vue";

import TranslationAsterixServiceAndModalitiesTitleListField from "../components/TranslationAsterixServiceAndModalitiesTitleListField.vue";
import { useTranslationAsterixIntegrationStore } from "../stores/useTranslationAsterixIntegrationStore";
import { AvailableLanguage } from "@/types/Language";

export interface Props {
  experienceId: string;
  readonly: boolean;
  languageCode: AvailableLanguage;
}
export interface Events {
  (e: "hasUnsavedChanges", hasUnsavedChanges: boolean): void;
}

defineProps<Props>();
const emits = defineEmits<Events>();

const store = useTranslationAsterixIntegrationStore();

watch(
  () => store.hasChanges,
  (hasChanges) => emits("hasUnsavedChanges", hasChanges)
);
</script>
<style lang="scss" scoped>
@import "@/assets/scss/utilities";
</style>
