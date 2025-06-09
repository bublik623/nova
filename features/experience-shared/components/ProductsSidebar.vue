<template>
  <AppSidebar :show="sidebarIsOpen" :nav-elements="data" @click:collapsing="handleCollapse" />
</template>

<script setup lang="ts">
import AppSidebar, { NavElement } from "@/features/core-shared/components/AppSidebar.vue";
import { getDashboardUrl } from "../../experience-dashboard/lib/get-dashboard-url";

const sidebarIsOpen = ref(false);
const { $t } = useNuxtApp();

function handleCollapse() {
  sidebarIsOpen.value = !sidebarIsOpen.value;
}

const data = ref<NavElement[]>([
  {
    icon: "ticket",
    title: $t("product-sidebar.experiences"),
    path: getDashboardUrl(),
  },
  { icon: "search", title: $t("product-sidebar.search"), path: "/advanced-search/editorial" },
]);
</script>
