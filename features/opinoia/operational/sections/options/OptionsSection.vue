<script setup lang="ts">
import FormSection from "@/components/Document/FormSection/FormSection.vue";
import SaveAndGoNext from "@/features/experience-shared/components/SaveAndGoNext.vue";
import OptionsTable from "./table/OptionsTable.vue";
import { useOptionsSection } from "./useOptionsSection";

export type OptionsSectionProps = {
  experienceId: string;
};

defineProps<OptionsSectionProps>();

const { lastSavedData, workingCopyData, canSave, isSaving, save } = useOptionsSection();

async function saveAndNavigateToNextSection() {
  await save();
  navigateToNextSection();
}

function navigateToNextSection() {
  // TODO: add implementation
}
</script>

<template>
  <div class="flex flex-col justify-between py-4">
    <FormSection id="opinoia.operational.options-section.fields.options" required :show-description="false">
      <OptionsTable
        :experience-id
        :options="workingCopyData.options"
        :last-saved-options="lastSavedData?.options ?? []"
        :invalid-options-id="[]"
      />
    </FormSection>
    <div class="flex flex-row justify-end">
      <SaveAndGoNext
        :readonly="false"
        :disabled="!canSave"
        :loading="isSaving"
        @click:save-and-navigate="saveAndNavigateToNextSection"
        @click:navigate="navigateToNextSection"
      />
    </div>
  </div>
</template>
