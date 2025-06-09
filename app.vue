<template>
  <AppLoadingScreen v-if="unref($loadingInitialData)" />

  <div v-else :class="isAnimationsDisabled ? 'no-transitions' : ''">
    <MaintenancePage v-if="isMaintenanceEnabled" />

    <template v-else>
      <AppNotifications />
      <AppHeader />
      <div class="AppWrapper">
        <NuxtPage />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import AppLoadingScreen from "./features/core-shared/components/AppLoadingScreen.vue";
import AppNotifications from "./features/core-shared/components/AppNotifications.vue";
import AppHeader from "./features/core-shared/components/AppHeader.vue";
import { useAuthCleanRoute } from "./features/auth/auth-utils";
import MaintenancePage from "@/components/MaintenancePage.vue";
import { datadogRum } from "@datadog/browser-rum";
import { useFeatureFlag } from "./features/experience-shared/composables/useFeatureFlag";
import { unref } from "vue";

useAuthCleanRoute();

const config = useRuntimeConfig();
const { DISABLE_ANIMATIONS: isAnimationsDisabled } = config.public;
const isMaintenanceEnabled = useFeatureFlag("MAINTENANCE");

onMounted(() => {
  datadogRum.addAction("page.mounted");
});
</script>

<style scoped lang="scss">
.AppWrapper {
  padding-top: var(--header-height);

  .page {
    height: 100%;
  }
}
</style>

<style lang="scss">
.no-transitions {
  * {
    transition: none !important;
  }
}
</style>
