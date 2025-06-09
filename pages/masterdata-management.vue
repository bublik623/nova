<template>
  <div class="wrapper">
    <MasterdataSidebar :categories="sidebarCategories" />
    <div :style="{ width: '100%' }">
      <NuxtPage />
    </div>
  </div>
</template>

<script setup lang="ts">
import MasterdataSidebar, {
  Categories,
} from "@/features/masterdata-management-shared/components/MasterdataSidebar.vue";
const route = useRoute();
const router = useRouter();

const baseUrl = "/masterdata-management";

const sidebarCategories: Categories = {
  commercial_content: [
    { id: "highlights", url: `${baseUrl}/commercial-content/highlights` },
    {
      id: "included",
      url: `${baseUrl}/commercial-content/included`,
    },
    {
      id: "important-information",
      url: `${baseUrl}/commercial-content/important-information`,
    },
  ],
};

// reroute to the first default sub-page if the user navigates to the index experience/masterdata-management
if (route.path.split("/").length === 2) {
  router.push(Object.values(sidebarCategories)[0][0].url);
}
</script>

<style scoped lang="scss">
.wrapper {
  display: grid;
  grid-template-columns: auto 1fr;
}
</style>
