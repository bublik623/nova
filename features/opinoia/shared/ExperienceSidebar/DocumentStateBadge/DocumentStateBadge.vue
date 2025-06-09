<script setup lang="ts">
import NovaLabel, { LabelTheme } from "@/ui-kit/NovaLabel/NovaLabel.vue";
import NovaIcon, { Icon } from "@/ui-kit/NovaIcon/NovaIcon.vue";
import { DocumentType, DocumentState } from "../../types";

export type DocumentStateBadgeProps = {
  documentType: DocumentType;
  documentState: DocumentState;
};

const iconMap: Record<DocumentType, Icon> = {
  RAW_COMMERCIAL: "flow-base",
  OPERATIONAL: "pin",
};

const documentNameMap: Record<DocumentType, string> = {
  RAW_COMMERCIAL: "Raw commercial",
  OPERATIONAL: "Operational",
};

const themeMap: Record<DocumentState, LabelTheme> = {
  IN_CREATION: "dark-grey",
  BEING_CURATED: "primary",
  UP_TO_DATE: "green",
  IN_REVIEW: "yellow",
  SENT_TO_REVIEW: "secondary",
};

const stateNameMap: Record<DocumentState, string> = {
  IN_CREATION: "In creation",
  BEING_CURATED: "Being curated",
  UP_TO_DATE: "Up-to-date",
  IN_REVIEW: "In review",
  SENT_TO_REVIEW: "Sent to review",
};

defineProps<DocumentStateBadgeProps>();
</script>

<template>
  <NovaLabel :theme="themeMap[documentState]">
    <div class="flex flex-row">
      <NovaIcon class="mr-1" :name="iconMap[documentType]" :size="16" />
      <span class="font-semibold">{{ documentNameMap[documentType] }}</span>
      <span class="mx-1 font-italic">&dash;</span>
      <span class="font-italic">{{ stateNameMap[documentState] }}</span>
    </div>
  </NovaLabel>
</template>
