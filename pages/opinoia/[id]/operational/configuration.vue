<script setup lang="ts">
import ConfigurationSection from "@/features/opinoia/operational/sections/configuration/ConfigurationSection.vue";

const route = useRoute();
const experienceId = computed(() => route.params.id as string);
</script>

<template>
  <ConfigurationSection :experience-id />
</template>
