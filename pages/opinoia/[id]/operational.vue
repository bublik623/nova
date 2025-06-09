<script setup lang="ts">
import OpinoiaOperationalDocument from "@/features/opinoia/operational/document/OpinoiaOperationalDocument.vue";

const route = useRoute();
const experienceId = computed(() => route.params.id as string);
</script>

<template>
  <OpinoiaOperationalDocument :experience-id />
</template>
