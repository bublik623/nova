<script setup lang="ts">
import PriceSection from "@/features/opinoia/operational/sections/price/PriceSection.vue";

const route = useRoute();
const experienceId = computed(() => route.params.id as string);
</script>

<template>
  <PriceSection :experience-id></PriceSection>
</template>
