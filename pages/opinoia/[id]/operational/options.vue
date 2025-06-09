<script setup lang="ts">
import OptionsSection from "@/features/opinoia/operational/sections/options/OptionsSection.vue";

const route = useRoute();
const experienceId = computed(() => route.params.id as string);
</script>

<template>
  <OptionsSection :experience-id></OptionsSection>
</template>
