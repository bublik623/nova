<script setup lang="ts">
import { useAllotmentSection } from "./useAllotmentSection";
import FormSection from "@/components/Document/FormSection/FormSection.vue";
import AllotmentTable from "./table/AllotmentTable.vue";
import SaveAndGoNext from "@/features/experience-shared/components/SaveAndGoNext.vue";

export type AllotmentSectionProps = {
  experienceId: string;
};

defineProps<AllotmentSectionProps>();

const allotmentSection = useAllotmentSection();
const { workingCopyData, canSave, isSaving, save } = allotmentSection;

async function saveAndNavigateToNextSection() {
  await save();
  navigateToNextSection();
}

function navigateToNextSection() {
  console.log("navigateToNextSection");
}
</script>

<template>
  <div class="flex flex-col justify-between py-4">
    <FormSection id="opinoia.allotment-section.fields.allotments" required :show-description="false">
      <AllotmentTable v-model:allotments="workingCopyData.allotments" :experience-id />
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
