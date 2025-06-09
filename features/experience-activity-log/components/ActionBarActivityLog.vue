<template>
  <div class="ActionBarActivityLog">
    <div class="ActionBarActivityLogItem" data-testid="activity-log-item" @click="expanded = !expanded">
      <div class="ActionBarActivityLogItem__user-avatar"></div>
      <div>
        <p class="ActionBarActivityLogItem__title" data-testid="activity-log-text">
          <template v-if="logsUsers.size > 1">
            {{ $t("common.placeholder.multiple-users") }}
            <span>{{ $t("action.bar.activity.changes") }}</span>
          </template>

          <template v-else>
            {{ formatUser(logsUsers.values().next().value) || $t("common.placeholder.single-user") }}
            <span>{{ $t("action.bar.activity.changes") }}</span>
          </template>
        </p>
        <p class="ActionBarActivityLogItem__last-edit" data-testid="activity-log-date">
          {{ $t("action.bar.activity.last-edit") }}: {{ formatDate(logs[0].action_date) }}
        </p>
        <p v-if="isCurrentVersion" class="ActionBarActivityLogItem__current-version">
          {{ $t("action.bar.activity.current") }}
        </p>
      </div>
      <NovaIcon :size="12" :expanded="expanded || null" name="chevron-down" class="ActionBarActivityLogItem__toggle" />
    </div>

    <template v-if="expanded">
      <div v-for="log in logs" :key="log.id" class="ActionBarActivityLogItem" data-testid="activity-log-item">
        <div class="ActionBarActivityLogItem__user-avatar"></div>
        <div>
          <p class="ActionBarActivityLogItem__title" data-testid="activity-log-text">
            {{ formatUser(log.user) || $t("common.placeholder.single-user") }}
            <span>{{ log.field.includes("go_commercial") ? "" : log.action }} {{ log.message }}</span>
          </p>
          <p class="ActionBarActivityLogItem__last-edit" data-testid="activity-log-date">
            {{ formatDate(log.action_date) }}
          </p>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { format, parseISO } from "date-fns";
import { TIME_FORMAT_SHORT } from "@/constants/date.constants";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";
import { LogWithMessage } from "../utils/change-logs";
import { z } from "zod";

export interface Props {
  logs: LogWithMessage[];
  isCurrentVersion?: boolean;
}

const props = defineProps<Props>();
const expanded = ref(false);

// Extracts the users from the logs
const logsUsers = computed(() => new Set(props.logs.map((log) => log.user)));

function formatDate(dateISOString: string) {
  return format(parseISO(dateISOString), TIME_FORMAT_SHORT);
}

function formatUser(userName?: string): string | undefined {
  const { success: isUuid } = z.string().uuid().safeParse(userName);

  return isUuid ? undefined : userName;
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.ActionBarActivityLog {
  max-width: rem(205);
  border: var(--border-default);
  border-radius: var(--border-radius-default);
  transition: all 0.2s;

  &:hover {
    border: 1px solid var(--color-secondary-100);
  }
}

.ActionBarActivityLogItem {
  display: grid;
  gap: rem(4);
  grid-template-columns: 18px auto 12px;
  transition: all 0.2s;

  &:not(:first-child) {
    padding: rem(11) 0;
    margin: 0 rem(8);
    border-top: var(--border-default);
  }

  &:first-child {
    padding: rem(11) rem(8);
  }

  &:first-child:hover {
    cursor: pointer;
    background-color: var(--color-secondary-10);
  }

  &__user-avatar {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background-color: var(--color-primary-10);
  }

  &__title {
    color: var(--color-text-90);
    @include font-regular(12);

    & > span {
      color: var(--color-text-100);
      @include font-bold(12);
    }
  }

  &__last-edit {
    color: var(--color-text-80);
    @include font-regular(12);
  }

  &__current-version {
    color: var(--color-success-110);
    font-style: italic;
    @include font-regular(12);
  }

  &__toggle {
    transition: transform 0.1s;

    &[expanded] {
      transform: rotate(180deg);
    }
  }
}
</style>
