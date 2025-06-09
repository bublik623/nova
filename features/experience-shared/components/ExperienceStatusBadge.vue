<template>
  <NovaLabel
    :theme="badgeTheme"
    size="md"
    data-testid="experience-status-badge"
    :data-status-code="statusCode"
    :data-flow-code="flowCode"
  >
    <NovaIcon class="ExperienceStatusBadge__icon text-text-100" :name="iconName" :size="16" />
    <span class="ExperienceStatusBadge__flow-text">{{ flowText }}</span>
    <span class="ExperienceStatusBadge__separator">&dash;</span>
    <span class="ExperienceStatusBadge__status-text">{{ statusText }}</span>
  </NovaLabel>
</template>

<script setup lang="ts">
import NovaIcon, { Icon } from "@/ui-kit/NovaIcon/NovaIcon.vue";
import { ExperienceFlowCode, ExperienceStatusCode } from "@/types/DocumentStatuses";
import NovaLabel, { LabelTheme } from "@/ui-kit/NovaLabel/NovaLabel.vue";
import type { UnionOrString } from "@/features/core-shared/utils/types";

export interface ExperienceStatusBadgeProps {
  flowCode?: UnionOrString<ExperienceFlowCode>;
  statusCode?: ExperienceStatusCode;
}

const props = withDefaults(defineProps<ExperienceStatusBadgeProps>(), {
  flowCode: "BASE",
  statusCode: "IN_CREATION",
});
const { $t } = useNuxtApp();

const flowIconMap: Record<UnionOrString<ExperienceFlowCode>, Icon> = {
  BASE: "flow-base",
  CURATION: "flow-curation",
  MANUAL_TRANSLATION: "flow-translation",
  AUTOTRANSLATION: "flow-translation",
  MEDIA: "flow-media",
};

const badgeThemeMap: Record<ExperienceStatusCode, LabelTheme> = {
  IN_CREATION: "dark-grey",
  BEING_CURATED: "primary",
  UP_TO_DATE: "green",
  IN_REVIEW: "yellow",
  SENT_TO_REVIEW: "secondary",
  READY: "green",
  TO_BE_EDIT: "secondary",
  ARCHIVED: "red",
};

const flowI18nKeyMap: Record<UnionOrString<ExperienceFlowCode>, string> = {
  BASE: "experience.flow_code.BASE",
  CURATION: "experience.flow_code.CURATION",
  MANUAL_TRANSLATION: "experience.flow_code.MANUAL_TRANSLATION",
  AUTOTRANSLATION: "experience.flow_code.AUTOTRANSLATION",
  MEDIA: "experience.flow_code.MEDIA",
};

// todo: We will remove this mapping and get it from master data (content-statuses)
// BE is in progress so we will use hardcoded values for now
const statusTextMap: Record<ExperienceStatusCode, string> = {
  IN_CREATION: "In creation",
  BEING_CURATED: "Being curated",
  UP_TO_DATE: "Up-to-date",
  IN_REVIEW: "In review",
  SENT_TO_REVIEW: "Sent to review",
  TO_BE_EDIT: "Pending",
  READY: "Ready",
  ARCHIVED: "Archived",
};

const iconName = computed(() => flowIconMap[props.flowCode]);
const badgeTheme = computed(() => badgeThemeMap[props.statusCode]);
const flowText = computed(() => $t(flowI18nKeyMap[props.flowCode]));
const statusText = computed(() => statusTextMap[props.statusCode]);
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.ExperienceStatusBadge {
  &__icon {
    margin-left: rem(-2);
    margin-right: rem(4);
  }

  &__flow-text {
    font-weight: 500;
  }

  &__status-text {
    font-style: italic;
  }

  &__separator {
    padding: rem(4);
  }
}
</style>
