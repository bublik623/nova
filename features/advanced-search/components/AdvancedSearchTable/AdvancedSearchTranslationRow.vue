<template>
  <tr class="TranslationRow" :is-last="isLastItem || null" data-testid="adv-search-table-translation-item">
    <td class="fixed-left fixed-left-check"></td>
    <td class="fixed-left fixed-left-langs" :class="{ 'TranslationRow__vertical-line': !isLastItem }">
      <CurvedLineSvg class="TranslationRow__curved-line" />
    </td>
    <td class="fixed-left fixed-left-title shadow--left">
      <NovaIconFlag :country-code="translation.language_code" :size="20" class="TranslationRow__flag" />
      <p class="TranslationRow__language-code">
        {{ translation.language_code.toUpperCase() }}
      </p>
      <p
        :title="translation.experience_translation?.title"
        class="TranslationRow__title ml-2"
        data-testid="adv-search-translation-row-title"
        @click="
          $router.push(`/experience/${translation.experience_id}/translation/${translation.language_code}/settings`)
        "
      >
        <SearchMatchHighlight :highlight="highlightFields?.['experience_content.experience_translation.title']?.[0]">
          {{ translation.experience_translation?.title ?? $t("advanced-search.missing.translation") }}
        </SearchMatchHighlight>
      </p>
    </td>
    <td></td>
    <td>
      <ExperienceStatusIcon
        :status="translation.experience_translation?.distribution_status"
        :date="translation.experience_translation?.distribution_date"
        :media-status="experienceMedia.distribution_status"
      ></ExperienceStatusIcon>
    </td>
    <td></td>
    <td></td>
    <td></td>
    <td></td>
    <td></td>
    <td></td>
  </tr>
</template>

<script setup lang="ts">
import NovaIconFlag from "@/ui-kit/NovaIconFlag/NovaIconFlag.vue";
import CurvedLineSvg from "@/assets/svg/advanced-search-curved-line.svg";
import ExperienceStatusIcon from "@/features/experience-shared/components/ExperienceStatusIcon.vue";
import { ExperienceContentV2, ExperienceMedia } from "@/types/generated/ContentQueryApiV2";
import {
  TRANSLATION_ROW_TABLE_COLUMN_TEMPLATE,
  checkboxCellWidth,
  openLangCellWidth,
} from "@/features/advanced-search/constants/table-constants";
import { MatchHighlight } from "../../types/seach-hit-overrides";
import SearchMatchHighlight from "@/features/advanced-search/components/SearchMatchHighlight/SearchMatchHighlight.vue";

export interface Props {
  translation: ExperienceContentV2;
  isLastItem?: boolean;
  show?: boolean;
  scrollShadowOpacity: 1 | 0;
  experienceMedia: ExperienceMedia;
  highlightFields?: MatchHighlight;
}
defineProps<Props>();

const TITLE_POSITION_LEFT = parseInt(checkboxCellWidth) + parseInt(openLangCellWidth) + "px";
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.TranslationRow {
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: v-bind(TRANSLATION_ROW_TABLE_COLUMN_TEMPLATE);
  height: rem(35);
  border-top: 1px solid var(--color-neutral-40);
  @include font-regular(14);

  &__language-code {
    color: var(--color-text-90);
    width: rem(10);
    position: relative;
    left: rem(-15);
    @include font-semibold(14);
  }

  &__title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-decoration: none;
    position: relative;
    max-width: rem(450);
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }

  td {
    display: flex;
    align-items: center;
    padding: rem(5) rem(8);
  }

  &__vertical-line {
    position: relative;

    &::before {
      position: absolute;
      content: "";
      width: rem(1px);
      height: calc(100% + 5px);
      bottom: 0;
      left: rem(21.5);
      border-right: 1px solid var(--color-grey-100);
      z-index: 1;
    }
  }

  &__curved-line {
    color: var(--color-neutral-60);
    position: absolute;
    right: rem(20);
    top: rem(-10);
  }

  &__flag {
    position: relative;
    left: rem(-25);
    min-width: rem(20);
  }
}

.fixed-left {
  position: sticky;
  background-color: var(--color-white);
  left: 10px;

  &-check {
    left: 0;
  }

  &-langs {
    left: v-bind(checkboxCellWidth);
  }

  &-title {
    left: v-bind(TITLE_POSITION_LEFT);
  }
}

.fixed-right {
  position: sticky;
  background-color: var(--color-white);
  right: 0;
}

.shadow--left {
  &::before {
    transition: opacity 0.2s ease-in-out;
    opacity: v-bind(scrollShadowOpacity);
    content: "";
    position: absolute;
    height: 100%;
    width: 4px;
    right: 0;
    background: linear-gradient(90deg, rgb(0 0 0 / 10%) 0%, rgb(255 255 255 / 0%) 100%);
  }
}
</style>
