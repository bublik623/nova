<script setup lang="ts">
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";
import { useMasterData } from "@/stores/master-data";
import ExperienceStatusBadge from "@/features/experience-shared/components/ExperienceStatusBadge.vue";
import { getExperienceLinkByPermissions } from "@/features/experience-dashboard/lib/get-experience-link-by-permissions";
import { Raw } from "@/types/generated/ContentQueryApiV2";
import { RAW_TABLE_COLUMN_TEMPLATE } from "@/features/experience-dashboard/constants";

interface Props {
  item: Raw;
  isReadonly: boolean;
  scrollShadowOpacity: number;
}

interface Events {
  (e: "delete-item", value: { experienceId: string; title: string }): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Events>();
const { getCityByCode } = useMasterData();

// Need to reassign it or it's not picked up by the css binding
const scrollShadowOpacity = computed(() => {
  return props.scrollShadowOpacity;
});

function formatDate(date?: string) {
  if (date) {
    return new Intl.DateTimeFormat("en-gb").format(new Date(date));
  } else return "";
}

const getCityName = (code?: string) => {
  return code ? getCityByCode(code)?.name : code;
};

function getLink() {
  const experienceId = props.item.experience_id;
  const experienceSource = props.item.experience_source;

  if (!experienceId) {
    throw new Error("Experience ID is required to generate the link.");
  }
  if (!experienceSource) {
    throw new Error("Experience Source is required to generate the link.");
  }

  return getExperienceLinkByPermissions({
    experienceId,
    experienceSource,
  });
}

function handleDelete() {
  emit("delete-item", {
    experienceId: props.item.experience_id ?? "",
    title: props.item.commercial.title,
  });
}
</script>

<template>
  <tr class="TableItem" data-testid="dashboard-table-item-raw">
    <td class="TableItem__cell fixed-left">
      <p class="TableItem__title" @click.stop="$router.push(getLink())">
        {{ item.commercial?.title }}
      </p>
    </td>
    <td class="TableItem__cell">
      {{ item.reference_code }}
    </td>
    <td class="TableItem__cell">
      {{ formatDate(item.creation_date) }}
    </td>
    <td class="TableItem__cell">
      {{ formatDate(item.updated_date) }}
    </td>
    <td class="TableItem__cell">
      <ExperienceStatusBadge flow-code="BASE" :status-code="item.status_code" />
    </td>
    <td class="TableItem__cell">
      <span v-if="item.operational?.available" class="text-text-100">
        {{ $t("common.available") }}
      </span>
      <span v-else class="inline-block px-1 py-px text-xs text-white bg-error-110 rounded">
        {{ $t("common.unavailable") }}
      </span>
    </td>

    <td class="TableItem__cell">{{ getCityName(item.functional?.location?.address.city) }}</td>
    <td class="TableItem__cell"></td>
    <td class="TableItem__cell-reverse fixed-right">
      <div v-if="!isReadonly">
        <NovaButton
          data-testid="table-action-edit-raw"
          variant="action"
          size="xxs"
          @click.stop="$router.push(getLink())"
        >
          <NovaIcon name="edit" :size="18"></NovaIcon>
        </NovaButton>
        <NovaButton
          v-show="item.status_code === 'IN_CREATION'"
          data-testid="table-action-delete-raw"
          variant="action"
          size="xxs"
          :style="{ marginLeft: '2px' }"
          @click.stop="handleDelete"
        >
          <NovaIcon name="trash" :size="18"></NovaIcon>
        </NovaButton>
      </div>
    </td>
  </tr>
</template>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.TableItem {
  cursor: pointer;
  display: grid;
  grid-template-columns: v-bind(RAW_TABLE_COLUMN_TEMPLATE);
  align-items: center;

  &__cell,
  &__cell-reverse {
    height: rem(35);
    border-bottom: 1px solid var(--color-grey-100);
    background-color: var(--color-white);
    display: flex;
    align-items: center;
    white-space: nowrap;
  }

  &__cell {
    padding: rem(7) rem(12);
  }

  &__cell-reverse {
    justify-content: flex-end;
    width: 100%;
    height: 100%;
    padding-right: rem(12);
  }

  &:hover {
    .TableItem__cell,
    .TableItem__cell-reverse {
      background-color: var(--color-grey-80);
    }
  }

  &__title {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--color-text-100);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

.fixed-left {
  position: sticky;
  left: 0;

  &::before {
    opacity: v-bind(scrollShadowOpacity);
    content: "";
    position: absolute;
    height: 100%;
    width: 4px;
    right: 0;
    background: linear-gradient(90deg, rgb(0 0 0 / 10%) 0%, rgb(255 255 255 / 0%) 100%);
  }
}

th.fixed-left {
  z-index: var(--table-headers-z-index);
}

.fixed-right {
  position: sticky;
  right: 0;

  &::before {
    opacity: v-bind(scrollShadowOpacity);
    content: "";
    position: absolute;
    height: 100%;
    width: 4px;
    left: 0;
    background: linear-gradient(90deg, rgb(255 255 255 / 0%) 0%, rgb(0 0 0 / 10%) 100%);
  }
}
</style>
