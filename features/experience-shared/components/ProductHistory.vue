<template>
  <div class="ProductHistory flex flex-col h-full w-full px-2 items-center">
    <NovaButtonToggle v-model="activeView" class="toggle items-center mt-5 mb-5" data-testid="product-history-toggle">
      <template #firstOption>{{ $t("product-history.toggle.activity-log") }}</template>
      <template #secondOption>{{ $t("product-history.toggle.version-history") }}</template>
    </NovaButtonToggle>

    <div class="ProductHistory__content">
      <slot v-if="isActivityLogViewActive" name="activity_log"></slot>
      <slot v-else name="version_history"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import NovaButtonToggle from "@/ui-kit/NovaButtonToggle/NovaButtonToggle.vue";

// activeView == true   => activity log
// activeView == false  => version history
const activeView = ref(true);
const isActivityLogViewActive = activeView;
</script>

<style lang="scss" scoped>
.ProductHistory {
  .toggle {
    align-self: stretch;
  }

  &__content {
    overflow-y: auto;
    width: 100%;
  }
}
</style>
