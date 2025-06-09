<template>
  <ApiConnectionForm :experience-id="experienceId" :readonly="isReadonly"></ApiConnectionForm>
</template>

<script setup lang="ts">
import ApiConnectionForm from "@/features/experience-raw/forms/ApiConnectionForm.vue";
import { RawPageProps } from "@/features/experience-raw/types/pages";

defineProps<RawPageProps>();

const { params } = useRoute();
const experienceId = params.id as string;
</script>
