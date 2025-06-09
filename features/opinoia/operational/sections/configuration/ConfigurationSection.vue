<script setup lang="ts">
import FormSection from "@/components/Document/FormSection/FormSection.vue";
import FieldPax from "@/features/experience-raw/components/FieldPax/FieldPax.vue";
import FieldCancellationPolicies from "@/features/experience-shared/components/FieldCancellationPolicies.vue";
import FieldLanguages from "@/features/experience-shared/components/FieldLanguages.vue";
import NovaInputText from "@/ui-kit/NovaInputText/NovaInputText.vue";
import { useConfigurationSection } from "./useConfigurationSection";
import SaveAndGoNext from "@/features/experience-shared/components/SaveAndGoNext.vue";
import { useRouter } from "#app";
import { storeToRefs } from "pinia";

export type ConfigurationSectionProps = {
  experienceId: string;
};

const props = defineProps<ConfigurationSectionProps>();
const router = useRouter();

const configurationSection = useConfigurationSection();
const { workingCopyData } = storeToRefs(configurationSection);

async function saveAndNavigateToNextSection() {
  await configurationSection.save();
  await navigateToNextSection();
}

async function navigateToNextSection() {
  await router.push(`/opinoia/${props.experienceId}/operational/options`);
}
</script>

<template>
  <div class="my-6 flex flex-col gap-10">
    <FormSection id="experience_code" required :slot-max-width="325" :show-description="false">
      <NovaInputText
        id="opinoia.configuration-section.field.experience-code"
        v-model="workingCopyData.configuration.experienceCode.value"
        :readonly="!!configurationSection.lastSavedData.configuration.experienceCode.value"
      />
    </FormSection>

    <FormSection id="cancellation_policy" required :slot-max-width="525" :show-description="false">
      <FieldCancellationPolicies v-model="workingCopyData.configuration.refundPolicies.value" :experience-id />
    </FormSection>

    <FormSection id="languages" :slot-max-width="325" :show-description="false">
      <FieldLanguages
        id="opinoia.configuration-section.field.languages"
        v-model="workingCopyData.configuration.languages.value"
      />
    </FormSection>

    <FormSection id="pax_types" required :show-description="false">
      <FieldPax id="opinoia.configuration-section.field.pax" v-model="workingCopyData.configuration.paxes.value" />
    </FormSection>
    <div class="flex flex-row justify-end">
      <SaveAndGoNext
        :readonly="false"
        :disabled="!configurationSection.canSave"
        :loading="configurationSection.isSaving"
        @click:save-and-navigate="saveAndNavigateToNextSection"
        @click:navigate="navigateToNextSection"
      />
    </div>
  </div>
</template>
