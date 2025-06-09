<script setup lang="ts">
import { ExperienceState } from "@/features/experience-shared/utils/get-experience-state";
import ExperienceStateIcon from "../experience-state/experience-state-icon/ExperienceStateIcon.vue";

export type ExperienceStateSectionProps = {
  state: ExperienceState;
};

defineProps<ExperienceStateSectionProps>();
</script>
<template>
  <div class="flex flex-row items-center justify-between py-3 mb-3 border-b border-grey-90">
    <h3 class="text-xs font-black">{{ $t("action.bar.draft.title") }}</h3>
    <div class="flex flex-row">
      <ExperienceStateIcon class="mr-2" :state="state" />
      <span class="text-xs font-bold">{{ $t(`status.code.${state}`) }}</span>
    </div>
  </div>
</template>
