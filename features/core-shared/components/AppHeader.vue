<template>
  <div class="AppHeader">
    <span class="AppHeader__nav">
      <NuxtLink :to="dashboardUrl">
        <AppLogo data-testid="header-tui-logo" />
      </NuxtLink>
      <NovaTabs
        class="AppHeader__tabs ml-6"
        :options="options"
        :selected="selectedTab"
        :accent-width="30"
        @select:option="(ev) => $router.push(ev.value)"
      />
    </span>
    <div>
      <AppUserDropdown />
    </div>
  </div>
</template>

<script setup lang="ts">
import NovaTabs from "@/ui-kit/NovaTabs/NovaTabs.vue";
import AppLogo from "./AppLogo.vue";
import AppUserDropdown from "@/features/core-shared/components/AppUserDropdown.vue";
import { getDashboardUrl } from "@/features/experience-dashboard/lib/get-dashboard-url";

const { $t } = useNuxtApp();
const route = useRoute();

const options = [
  { title: $t("app-sidebar.tab.administration"), value: "/masterdata-management" },
  { title: $t("app-sidebar.tab.product"), value: "/" },
  { title: $t("app-sidebar.tab.suppliers"), value: "/suppliers" },
  { title: $t("app-sidebar.tab.stop-sales"), value: "/stop-sales" },
];

const dashboardUrl = getDashboardUrl();

const selectedTab = computed(() => {
  switch (route.path) {
    case "/masterdata-management/commercial-content/highlights":
      return options[0];
    case "/":
      return options[1];
    case "/suppliers":
      return options[2];
    case "/stop-sales":
      return options[3];
  }
});
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.AppHeader {
  position: fixed;
  z-index: var(--z-index-header);
  padding: 0 rem(16);
  width: 100%;
  height: var(--header-height);
  background: var(--color-white);
  border-bottom: var(--border-default);
  display: flex;
  align-items: center;
  justify-content: space-between;

  &__nav {
    display: flex;
    align-items: center;
    height: calc(var(--header-height) - 3px);
  }

  &__tabs {
    height: 100%;
    display: flex;
    gap: 20px;
  }
}
</style>
