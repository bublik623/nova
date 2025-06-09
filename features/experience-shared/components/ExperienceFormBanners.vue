<template>
  <ExperienceStatusBanner
    v-if="shouldShowDistributionBanner"
    :experience-id="experienceId"
    :status="distributionState || 'draft'"
    :is-translation-flow="isTranslationFlow"
  />

  <ExperienceLockBanner v-if="lockFlow" :flow="lockFlow" />
  <RawExperienceOperationalBanner v-if="isRawFlow" />
</template>

<script setup lang="ts">
import ExperienceLockBanner from "@/features/experience-lock/components/ExperienceLockBanner.vue";
import { useCurrentDistributionContentQuery } from "../composables/useCurrentDistributionContentQuery";
import { useCurrentExperienceFlow } from "../composables/useCurrentExperienceFlow";
import { getDistributionState } from "../utils/get-experience-state";
import ExperienceStatusBanner from "./ExperienceStatusBanner.vue";
import RawExperienceOperationalBanner from "@/features/experience-raw/components/RawExperienceOperationalBanner.vue";

const currentFlow = useCurrentExperienceFlow();
const isRawFlow = computed(() => currentFlow.value === "raw");
const isTranslationFlow = computed(() => currentFlow.value === "translation");

const distributionContentQuery = useCurrentDistributionContentQuery();
const experienceId = computed(() => distributionContentQuery.data.value?.id || "");

const shouldShowDistributionBanner = computed(() => distributionState.value && !isRawFlow.value);

const distributionState = computed(
  () => distributionContentQuery.data.value && getDistributionState(distributionContentQuery.data.value)
);

const lockFlow = computed(() => (isRawFlow.value ? "raw" : "editorial"));
</script>
