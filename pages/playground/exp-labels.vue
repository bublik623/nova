<template>
  <div class="flex row">
    <div v-for="flow in FLOWS" :key="flow" class="p-2">
      <div v-for="status in STATUSES" :key="status" class="mt-2">
        <ExperienceStatusBadge :flow-code="flow" :status-code="status" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ExperienceStatusBadge from "@/features/experience-shared/components/ExperienceStatusBadge.vue";
import { ExperienceStatusCode } from "@/types/DocumentStatuses";

const STATUSES: ExperienceStatusCode[] = [
  "IN_CREATION",
  "BEING_CURATED",
  "UP_TO_DATE",
  "IN_REVIEW",
  "SENT_TO_REVIEW",
  "READY",
  "TO_BE_EDIT",
  "ARCHIVED",
];

const FLOWS = ["BASE", "CURATION", "MANUAL_TRANSLATION", "AUTOTRANSLATION", "MEDIA"];
</script>
