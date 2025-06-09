<script setup lang="ts">
import ExperienceSidebar from "@/features/opinoia/shared/ExperienceSidebar/ExperienceSidebar.vue";
import { useOperationalSidebar } from "./useOperationalSidebar";

export type ExperienceSidebarProps = {
  experienceId: string;
};

const props = defineProps<ExperienceSidebarProps>();
const experienceId = readonly(toRef(props, "experienceId"));
const { experience, documentSections } = useOperationalSidebar(experienceId);
</script>

<template>
  <ExperienceSidebar :experience :active-document-sections="documentSections" :active-document-type="'OPERATIONAL'" />
</template>
