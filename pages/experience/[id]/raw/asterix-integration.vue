<template>
  <AsterixIntegrationForm
    :experience-id="experienceId"
    :readonly="isReadonly"
    @has-unsaved-changes="(v) => (legacyStore.hasChanges = v)"
  ></AsterixIntegrationForm>
</template>

<script setup lang="ts">
import AsterixIntegrationForm from "@/features/experience-raw/forms/AsterixIntegrationForm.vue";
import { RawPageProps } from "@/features/experience-raw/types/pages";
import { useLegacyStores } from "@/features/experience-raw/stores/useLegacyStores";

defineProps<RawPageProps>();

const legacyStore = useLegacyStores();

const { params } = useRoute();
const experienceId = params.id as string;
</script>
