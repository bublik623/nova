<template>
  <div class="ActionBarActivity">
    <template v-if="!store.loading && !store.error">
      <template v-if="Object.entries(store.groupedLogs).length > 0">
        <div v-for="(logs, timestamp, index) in store.groupedLogs" :key="timestamp" class="ActionBarActivity__group">
          <p data-testid="activity-log-group-date">
            {{ formatDate(+timestamp) }}
          </p>
          <ActionBarActivityLog :logs="logs" :is-current-version="index === 0" />
        </div>
      </template>
      <p v-else>
        {{ $t("activity.no.entries") }}
      </p>
    </template>

    <div v-else-if="!store.error" class="w-full">
      <div class="skeleton_item" :style="{ height: '20px', width: '50%' }" />
      <div class="skeleton_item mt-2 mb-4" :style="{ height: '70px' }" />
      <div class="skeleton_item" :style="{ height: '20px', width: '50%' }" />
      <div class="skeleton_item mt-2" :style="{ height: '70px' }" />
    </div>

    <p v-else>
      {{ $t("activity.error.loading") }}
    </p>
  </div>
</template>

<script lang="ts" setup>
import { useActivityLogStore } from "../stores/useActivityLogStore";
import ActionBarActivityLog from "@/features/experience-activity-log/components/ActionBarActivityLog.vue";

const store = useActivityLogStore();

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.ActionBarActivity {
  padding: rem(16) rem(12);

  &__group {
    margin-bottom: rem(20);
    @include font-bold(12);

    & > p {
      margin-bottom: rem(10);
    }
  }
}
</style>
