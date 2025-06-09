<template>
  <NovaAlert
    v-if="statusCode === RawStatusCode.BEING_CURATED"
    data-testid="raw-experience-status-banner"
    :data-status="RawStatusCode.BEING_CURATED"
    status="error"
  >
    <strong>{{ $t("experience.base_status_banner.operational_functional_changes_only") }}</strong>
    {{ $t("experience.status_banner.in_review") }}
  </NovaAlert>
</template>

<script setup lang="ts">
import { useCurrentRawExperienceQuery } from "@/features/experience-raw/composables/useCurrentRawExperienceQuery";
import { RawStatusCode } from "@/types/DocumentStatuses";
import NovaAlert from "@/ui-kit/NovaAlert/NovaAlert.vue";

const rawQuery = useCurrentRawExperienceQuery();
const statusCode = computed(() => rawQuery.data.value?.status_code);
</script>
