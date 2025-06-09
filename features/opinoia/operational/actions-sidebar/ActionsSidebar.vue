<script setup lang="ts">
import ActionBar from "@/features/experience-shared/components/ActionBar.vue";
import ExperienceStateSection from "@/features/opinoia/shared/actions-sidebar/ExperienceStateSection.vue";
import ContentStorageSection from "../../shared/actions-sidebar/ContentStorageSection.vue";
import CompletionSection from "../../shared/actions-sidebar/CompletionSection.vue";
import { useActionsSidebar } from "./useActionsSidebar";
import { useOpinoiaOperationalDocument } from "../document/useOpinoiaOperationalDocument";

export type ActionsSidebarProps = {
  experienceId: string;
};

const props = defineProps<ActionsSidebarProps>();
const experienceId = readonly(toRef(props, "experienceId"));
const { experienceState, lastEditDate, completionPercentage, isBusy } = useActionsSidebar(experienceId);
const { saveDraft, canSaveDraft, canPublish, publish, isSaving } = useOpinoiaOperationalDocument(
  readonly(toRef(props.experienceId))
);
</script>

<template>
  <ActionBar>
    <template #actions>
      <div class="flex flex-col justify-between">
        <div class="flex flex-col">
          <ExperienceStateSection :state="experienceState" />
          <ContentStorageSection
            :last-edit-date="lastEditDate"
            :can-save-draft="canSaveDraft"
            :is-busy="isSaving"
            @save-draft="saveDraft"
          />
          <CompletionSection
            :completion-percentage="completionPercentage"
            :can-publish="canPublish"
            :is-busy="isBusy"
            @publish="publish"
          />
        </div>
      </div>
    </template>
  </ActionBar>
</template>
