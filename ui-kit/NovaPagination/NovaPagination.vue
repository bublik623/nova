<template>
  <ul class="NovaPagination">
    <button
      :disabled="currentPage === 1"
      class="NovaPagination__chevron NovaPagination__chevron--left"
      data-testid="previous-page-button"
      @click="currentPage > 1 && currentPage--"
    >
      <NovaIcon name="chevron-left" :size="14" />
    </button>

    <li v-for="(page, idx) in pages" :key="idx">
      <div v-if="page === 'ellipsis'" class="NovaPagination__ellipsis" data-testid="ellipsis">&#8230;</div>
      <button
        v-else
        class="NovaPagination__item"
        :data-testid="`page-${page}`"
        :selected="currentPage === page || null"
        @click="currentPage = page"
      >
        {{ page }}
      </button>
    </li>

    <button
      :disabled="currentPage === totPages"
      class="NovaPagination__chevron NovaPagination__chevron--right"
      data-testid="next-page-button"
      @click="currentPage < totPages && currentPage++"
    >
      <NovaIcon name="chevron-right" :size="14" />
    </button>
  </ul>
</template>
<script setup lang="ts">
import { useVModel } from "@vueuse/core";
import NovaIcon from "../NovaIcon/NovaIcon.vue";

interface Props {
  modelValue: number;
  total: number;
  itemsPerPage?: number;
  siblings?: number;
  showEdges?: boolean;
}

const props = withDefaults(defineProps<Props>(), { itemsPerPage: 50, siblings: 1, showEdges: false });
const emits = defineEmits<(e: "update:modelValue", value: number) => void>();

const currentPage = useVModel(props, "modelValue", emits);

const totPages = computed(() => Math.ceil(props.total / props.itemsPerPage));
const pages = computed(() => getRange(currentPage.value, totPages.value, props.siblings, props.showEdges));

const ELLIPSIS = "ellipsis";

function range(start: number, end: number): Array<number | "ellipsis"> {
  const length = end - start + 1;
  return Array.from({ length }, (_, idx) => idx + start);
}

function getVisibleRange(start: number, end: number, itemCount: number): Array<number | "ellipsis"> {
  const rangeArray = range(start, end);
  if (rangeArray.length <= itemCount) {
    return [1, ELLIPSIS, ...rangeArray.slice(0, itemCount)];
  }
  return [...rangeArray.slice(0, itemCount), ELLIPSIS, end];
}

function getRangeWithEdges(
  pageCount: number,
  siblings: number,
  leftSiblingIndex: number,
  rightSiblingIndex: number
): Array<number | "ellipsis"> {
  const totalPageNumbers = Math.min(2 * siblings + 5, pageCount);
  const itemCount = totalPageNumbers - 2;

  if (leftSiblingIndex > 2 && rightSiblingIndex < pageCount - 1) {
    return [1, ELLIPSIS, ...range(leftSiblingIndex, rightSiblingIndex), ELLIPSIS, pageCount];
  } else if (leftSiblingIndex <= 2 && rightSiblingIndex < pageCount - 1) {
    return getVisibleRange(1, pageCount, itemCount);
  } else if (leftSiblingIndex > 2 && rightSiblingIndex >= pageCount - 1) {
    return getVisibleRange(pageCount - itemCount + 1, pageCount, itemCount);
  }

  return range(1, pageCount);
}

function getRangeWithoutEdges(
  activePage: number,
  pageCount: number,
  siblings: number,
  leftSiblingIndex: number,
  rightSiblingIndex: number
): Array<number | "ellipsis"> {
  const itemCount = siblings * 2 + 1;

  if (pageCount < itemCount) {
    return range(1, pageCount);
  } else if (activePage <= siblings + 1) {
    return range(1, itemCount);
  } else if (pageCount - activePage <= siblings) {
    return range(pageCount - itemCount + 1, pageCount);
  }

  return range(leftSiblingIndex, rightSiblingIndex);
}

function getRange(
  activePage: number,
  pageCount: number,
  siblings: number,
  showEdges: boolean
): Array<number | "ellipsis"> {
  const leftSiblingIndex = Math.max(activePage - siblings, 1);
  const rightSiblingIndex = Math.min(activePage + siblings, pageCount);

  if (showEdges) {
    return getRangeWithEdges(pageCount, siblings, leftSiblingIndex, rightSiblingIndex);
  }

  return getRangeWithoutEdges(activePage, pageCount, siblings, leftSiblingIndex, rightSiblingIndex);
}
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.NovaPagination {
  display: flex;

  &__item,
  &__chevron {
    border: none;
    background: none;
    color: var(--color-text-70);
    width: rem(28);
    height: rem(28);
    cursor: pointer;
    @include font-semibold(12);

    &[selected] {
      color: var(--color-text-100);
    }
  }

  &__ellipsis {
    width: rem(28);
    height: rem(28);
    color: var(--color-text-70);
    display: flex;
    justify-content: center;
    align-items: flex-end;
    padding-bottom: rem(6);
  }

  &__chevron {
    color: var(--color-text-100);
    display: flex;
    align-items: center;

    &:disabled {
      cursor: not-allowed;
    }

    &--left {
      justify-content: flex-end;
    }

    &--right {
      justify-content: flex-start;
    }
  }
}
</style>
