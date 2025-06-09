<template>
  <table v-if="show" class="ExpandedRow" data-testid="expanded-row" aria-label="expanded row content" @click.stop>
    <thead class="ExpandedRow__header">
      <th scope="col" class="header__toggle fixed-left">&nbsp;</th>
      <th scope="col" class="header__status shadow--left">
        <div class="u-center">{{ $t("dashboard.table.row.header.distribution_status") }}</div>
      </th>
      <th scope="col">
        {{ $t("dashboard.table.row.header.translation") }}
      </th>
      <th scope="col"></th>
      <th scope="col">
        {{ $t("dashboard.table.row.header.created") }}
      </th>
      <th scope="col">
        {{ $t("dashboard.table.row.header.last.modified") }}
      </th>
      <th scope="col">
        {{ $t("dashboard.table.row.header.status") }}
      </th>
      <th scope="col"></th>
      <th scope="col"></th>
      <th scope="col"></th>
      <th scope="col" class="header__actions fixed-right shadow--right"></th>
    </thead>

    <tbody class="ExpandedRow__body">
      <template v-if="translations.length > 0">
        <tr
          v-for="item in translations"
          :key="`expanded-${item.experience_id}-${item.language_code}`"
          class="ExpandedRowItem"
          data-testid="expanded-row-item"
        >
          <td class="cell__toggle fixed-left">
            <CurvedLineSvg class="ExpandedRowItem__curved-line" />
          </td>
          <td
            class="cell__status shadow--left"
            data-testid="cell-status"
            :data-status="item.experience_translation?.distribution_status"
            :data-status-date="item.experience_translation?.distribution_date"
          >
            <div class="status-icon__wrapper">
              <ExperienceStatusIcon
                :status="item.experience_translation?.distribution_status"
                :date="item.experience_translation?.distribution_date"
                :media-status="experienceMedia?.distribution_status"
              ></ExperienceStatusIcon>
            </div>
          </td>
          <td
            class="ExpandedRowItem__cell title"
            @click.stop="$emit('click:edit', item.experience_id, item.language_code)"
          >
            <NovaIconFlag :country-code="item.language_code" :size="15" /><span>{{
              $t(`dashboard.table.row.language.${item.language_code}`)
            }}</span>
          </td>
          <td class="ExpandedRowItem__cell"></td>
          <td class="ExpandedRowItem__cell">
            {{ formatDate(item.experience_translation?.creation_date) }}
          </td>
          <td class="ExpandedRowItem__cell">
            {{ formatDate(item.experience_translation?.updated_date) }}
          </td>
          <td class="ExpandedRowItem__cell">
            <ExperienceStatusBadge
              :flow-code="item.experience_translation?.flow_code"
              :status-code="item.experience_translation?.status_code"
            />
          </td>
          <td class="ExpandedRowItem__cell"></td>
          <td class="ExpandedRowItem__cell"></td>
          <td class="ExpandedRowItem__cell"></td>
          <td class="ExpandedRowItem__cell-reverse cell__actions fixed-right shadow--right">
            <ExperienceActionDropdown
              v-if="!isReadonly"
              :status="'draft'"
              @edit="$emit('click:edit', item.experience_id, item.language_code)"
            />
          </td>
        </tr>
      </template>

      <template v-else>
        <tr class="ExpandedRowItem ExpandedRowItem--no-items" data-testid="expanded-row-no-items">
          <td class="cell__toggle fixed-left"></td>
          <td class="cell__status shadow--left"></td>
          <td class="cell__no-items">{{ $t("dashboard.table.row.no.translations") }}</td>
          <td class="fixed-right shadow--right"></td>
        </tr>
      </template>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import CurvedLineSvg from "@/assets/svg/dashboard-table-row-curved-line.svg";
import NovaIconFlag from "@/ui-kit/NovaIconFlag/NovaIconFlag.vue";
import ExperienceStatusIcon from "@/features/experience-shared/components/ExperienceStatusIcon.vue";

// Ignoring these imports because they are used in the <style> section via v-bind,
// but SonarQube incorrectly detects them as unused.
// prettier-ignore
// eslint-disable-next-line no-unused-vars
import { firstCellWidth, statusCellWidth } from "@/features/experience-shared/constants/dashboard-table-constants";
import { ExperienceContentV2, ExperienceMedia } from "@/types/generated/ContentQueryApiV2";
import ExperienceStatusBadge from "@/features/experience-shared/components/ExperienceStatusBadge.vue";
import ExperienceActionDropdown from "@/features/experience-shared/components/ExperienceActionDropdown.vue";

export interface Props {
  translations: ExperienceContentV2[];
  columnTemplate: string;
  show?: boolean;
  scrollShadowOpacity?: number;
  experienceMedia?: ExperienceMedia;
  isReadonly: boolean;
}

interface Events {
  (e: "click:edit", id: string, lang: string): void;
}

defineProps<Props>();
defineEmits<Events>();

function formatDate(date?: string) {
  if (date) {
    return new Intl.DateTimeFormat("en-gb").format(new Date(date));
  } else return "";
}
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.u-center {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.ExpandedRow {
  cursor: default;
  grid-column: 1 / -1;
  background-color: var(--color-white);

  &__header {
    display: grid;
    grid-template-columns: v-bind(columnTemplate);
    background-color: var(--color-neutral-10);

    & > th {
      padding: rem(8) rem(12);
      color: var(--color-text-100);
      text-align: left;
      @include font-bold(12);

      &:first-child {
        padding-left: rem(50);
      }
    }
  }
}

.ExpandedRowItem {
  position: relative;
  display: grid;
  grid-template-columns: v-bind(columnTemplate);

  .title {
    color: var(--color-text-100);

    & > span {
      cursor: pointer;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  &:hover {
    background: var(--color-neutral-10);
  }

  &__curved-line {
    position: absolute;
    left: rem(10);
    top: rem(-33);
  }

  &__cell,
  &__cell-reverse {
    padding: rem(5) rem(12);
    color: var(--color-text-90);
    display: flex;
    align-items: center;
    gap: 5px;

    .svg-flag {
      margin-bottom: -1px;
      margin-right: 6px;
    }
  }

  &__cell:first-child {
    padding-left: rem(50);
  }

  &__cell-reverse {
    justify-content: flex-end;
    padding-right: rem(12);
  }

  &--no-items {
    & > td {
      background-color: var(--color-white);
    }

    .cell__no-items {
      padding: rem(7);
      text-align: center;
      color: var(--color-text-70);
      @include font-regular(12);

      /* start at 3rd column (basically we push it from left) left, 11 items in the column. see TABLE_COLUMN_TEMPLATE
      if you change the number of columns you should also change this.
      */
      grid-column: 2 / 11;
    }

    &:hover {
      td {
        background-color: var(--color-white);
      }
    }
  }
}

.header__status {
  background: var(--color-neutral-10);
  position: sticky;
  left: v-bind(firstCellWidth);
  width: v-bind(statusCellWidth);
}

.header__toggle {
  background: var(--color-neutral-10);
  height: 100%;
}

.header__actions {
  background: var(--color-neutral-10);
}

.cell__toggle {
  background-color: var(--color-neutral-0);
  padding-left: rem(12);
  height: 100%;
  width: 100%;
}

.cell__status {
  background-color: var(--color-neutral-0);
  position: sticky;
  left: v-bind(firstCellWidth) !important;
  justify-self: center;
  width: v-bind(statusCellWidth);
  height: 100%;
}

.status-icon__wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  margin-left: rem(16);
}

.fixed-left {
  position: sticky;
  left: 0;
}

.fixed-right {
  position: sticky;
  right: 0;
}

.shadow--left {
  &::before {
    opacity: v-bind(scrollShadowOpacity);
    content: "";
    position: absolute;
    height: 100%;
    width: 4px;
    top: 0;
    right: 0;
    background: linear-gradient(90deg, rgb(0 0 0 / 10%) 0%, rgb(255 255 255 / 0%) 100%);
  }
}

.shadow--right {
  &::before {
    opacity: v-bind(scrollShadowOpacity);
    content: "";
    position: absolute;
    height: 100%;
    width: 4px;
    left: 0;
    top: 0;
    background: linear-gradient(90deg, rgb(255 255 255 / 0%) 0%, rgb(0 0 0 / 10%) 100%);
  }
}
</style>
