<template>
  <ExperiencesDashboard />
</template>

<script setup lang="ts">
import ExperiencesDashboard from "@/features/experience-dashboard/components/ExperiencesDashboard.vue";
const { $emitFullLoad } = useNuxtApp();

onMounted(() => $emitFullLoad());
</script>
