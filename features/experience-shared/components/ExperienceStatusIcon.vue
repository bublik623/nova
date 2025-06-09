<template>
  <NovaIcon
    data-testid="experience-status-icon"
    :data-distribution-status="experienceState"
    :name="iconKey"
    :size="size ?? 16"
  />
</template>

<script setup lang="ts">
import NovaIcon, { Icon } from "@/ui-kit/NovaIcon/NovaIcon.vue";
import { DistributionDate, DistributionStatus } from "@/types/generated/ContentQueryApiV2";
import { ExperienceState, getExperienceState } from "../utils/get-experience-state";

export interface ExperienceStatusIconProps {
  status?: DistributionStatus;
  date?: DistributionDate;
  mediaStatus?: DistributionStatus;
  size?: number;
}

const props = defineProps<ExperienceStatusIconProps>();

const iconMap: Record<ExperienceState, Icon> = {
  draft: "draft",
  in_review: "live-warning",
  ready: "success-solid",
  unpublished: "error-solid",
};

const experienceState = getExperienceState({
  experienceStatus: props.status,
  experienceDate: props.date,
  mediaStatus: props.mediaStatus,
});

const iconKey = computed<Icon>(() => iconMap[experienceState]);
</script>
