<template>
  <FormSection id="raw.asterix-integration.service-and-modalities-codes" :required="true" :slot-max-width="700">
    <AsterixServiceAndModalitiesListField
      :readonly="readonly"
      :experience-reference-code="distributionContent?.reference_code"
      :value="experience.fields.asterix_service_and_modalities_codes?.value ?? []"
      @update:value="updateFieldValue"
    ></AsterixServiceAndModalitiesListField>
  </FormSection>
</template>

<script setup lang="ts">
import FormSection from "@/components/Document/FormSection/FormSection.vue";
import AsterixServiceAndModalitiesListField from "../components/AsterixServiceAndModalities/AsterixServiceAndModalitiesListField.vue";
import { RawAsterixAdapterInformation, DistributionContent } from "@/types/generated/ExperienceRawServiceApi";
import { useExperienceRaw } from "@/stores/experience-raw";
import { isEqual } from "lodash";

interface Props {
  experienceId: string;
  readonly: boolean;
}
export interface Events {
  (e: "hasUnsavedChanges", hasUnsavedChanges: boolean): void;
}

const props = defineProps<Props>();
const emits = defineEmits<Events>();

const experienceRawStore = useExperienceRaw();
const experience = experienceRawStore.rawContents[props.experienceId];
const { data: distributionContent } = useNuxtData<DistributionContent>(`getDistributionContent-${props.experienceId}`);

const hasUnsavedChanges = computed(() => {
  return !isEqual(
    experience.data.legacy_adapter_information?.asx_codes ?? [],
    experience.fields.asterix_service_and_modalities_codes?.value
  );
});
watch(hasUnsavedChanges, (newHasUnsavedChangesValue) => emits("hasUnsavedChanges", newHasUnsavedChangesValue));

function updateFieldValue(newValue: RawAsterixAdapterInformation[]) {
  experience.fields.asterix_service_and_modalities_codes!.value = newValue;
}
</script>
