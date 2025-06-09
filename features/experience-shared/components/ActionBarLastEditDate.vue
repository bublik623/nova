<template>
  <div v-if="store.lastEditDate" class="ActionBarlastEditDate" data-testid="document-action-bar-autosave-saved">
    <NovaIcon name="check" :size="14" :style="{ color: 'var(--color-success-90)' }"></NovaIcon>

    <span>{{ $t("common.last_edit") }}: {{ format(store.lastEditDate, DATE_FORMAT) }}</span>
  </div>
</template>

<script lang="ts" setup>
import { format } from "date-fns";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";
import { useActivityLogStore } from "@/features/experience-activity-log/stores/useActivityLogStore";

const store = useActivityLogStore();

const DATE_FORMAT = "dd MMM yyyy, p";
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.ActionBarlastEditDate {
  display: flex;
  align-items: center;
  margin-top: rem(8);
  @include font-regular(12);

  & > span {
    margin-left: rem(5);
    color: var(--color-text-90);
  }
}
</style>
