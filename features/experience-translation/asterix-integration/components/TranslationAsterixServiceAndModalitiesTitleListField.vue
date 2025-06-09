<template>
  <AsterixServiceAndModalitiesTitleListField
    :reference-value="referenceValue ?? []"
    :target-value="targetValue"
    :readonly="readonly"
    :show-reference="true"
    @update:value="(newValue) => $emit('update:value', newValue)"
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
import AsterixServiceAndModalitiesTitleListField, {
  AsterixServiceAndModalitiesTitleListFieldProps,
  AsterixServiceAndModalitiesTitleListFieldEvents,
} from "@/features/experience-shared/asterix-integration/asterix-service-and-modalities-titles/components/AsterixServiceAndModalitiesTitleListField.vue";
import { AvailableLanguage } from "@/types/Language";
import FlagLanguageDisplay from "@/features/experience-translation/components/FlagLanguageDisplay.vue";
import { useAsterixServiceAndModalitiesTitleTranslationsListField } from "@/features/experience-shared/asterix-integration/asterix-service-and-modalities-titles/composables/useAsterixServiceAndModalitiesTitleTranslationsListField";

export type TranslationAsterixServiceAndModalitiesTitleListFieldProps = Omit<
  AsterixServiceAndModalitiesTitleListFieldProps,
  "referenceValue" | "showReference"
> & { experienceId: string; languageCode: AvailableLanguage };

const props = defineProps<TranslationAsterixServiceAndModalitiesTitleListFieldProps>();
defineEmits<AsterixServiceAndModalitiesTitleListFieldEvents>();

const experienceId = computed(() => props.experienceId);
const masterLanguageCode = computed(() => "en" as AvailableLanguage);

const { lastSavedValue: referenceValue } = useAsterixServiceAndModalitiesTitleTranslationsListField(
  experienceId,
  masterLanguageCode
);
</script>
