<script setup lang="ts">
import NovaIcon, { Icon } from "@/ui-kit/NovaIcon/NovaIcon.vue";
import { ExperienceState } from "@/features/experience-shared/utils/get-experience-state";

export type ExperienceStateIconProps = { state: ExperienceState };

defineProps<ExperienceStateIconProps>();

const stateIcons: Record<ExperienceState, Icon> = {
  draft: "draft",
  in_review: "live-warning",
  ready: "success-solid",
  unpublished: "error-solid",
};
</script>
<template>
  <NovaIcon :name="stateIcons[state]"></NovaIcon>
</template>
