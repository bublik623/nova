<script setup lang="ts">
import AllotmentSection from "@/features/opinoia/operational/sections/allotment/AllotmentSection.vue";

const route = useRoute();
const experienceId = computed(() => route.params.id as string);
</script>

<template>
  <AllotmentSection :experience-id />
</template>
