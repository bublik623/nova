<template>
  <tr v-for="(matchItem, index) in mappedMatches" :key="index" class="AdvancedSearchMatches">
    <td
      class="AdvancedSearchMatches__attribute-name shadow--right"
      :class="{ 'show-line': showVerticalLine }"
      :style="{ paddingLeft: paddingLeft }"
    >
      {{ matchItem.field_name }}
    </td>
    <td class="AdvancedSearchMatches__match">
      <RenderHtml :string="matchItem.match" />
    </td>
  </tr>
</template>

<script setup lang="ts">
import RenderHtml from "@/components/Utils/RenderHtml/RenderHtml.vue";
import { NOT_FOUND_DEFAULT } from "@/constants/i18n.constants";
import { useLogger } from "@/features/core-shared/composables/useLogger";

interface Props {
  matches: { [key: string]: string[] };
  fieldsToSkip: RegExp[];
  stringToRemove: RegExp;
  paddingLeft: string;
  scrollShadowOpacity: 1 | 0;
  gridTemplateColumns: string;
  showVerticalLine?: boolean;
}
const { $t } = useNuxtApp();
const props = defineProps<Props>();
const { logError } = useLogger();

const mappedMatches = Object.entries(props.matches)
  .filter(([key]) => !props.fieldsToSkip.some((fieldToSkip) => RegExp(fieldToSkip).exec(key)))
  .flatMap(([key, matchArray]) => {
    return matchArray.map((match) => {
      const newKey = `advanced-search-match-${key}`;
      const message = $t(newKey, { default: NOT_FOUND_DEFAULT } as any);

      // if we don't have the key in weblate we are logging an error in datadog
      if (message === NOT_FOUND_DEFAULT) {
        logError("advanced-search-result-translation-missing", newKey);
      }

      return { field_name: $t(`${newKey}`), match: match.replaceAll(props.stringToRemove, "") };
    });
  });
</script>
<style scoped lang="scss">
@import "@/assets/scss/utilities";

:deep(em) {
  background: var(--color-highlight);
}

.AdvancedSearchMatches {
  width: 100%;
  display: grid;
  grid-template-columns: v-bind(gridTemplateColumns);
  background: var(--color-neutral-10);
  border-top: 1px solid var(--color-neutral-30);
  position: relative;
  height: rem(40);
  @include font-regular(14);

  & > td {
    display: flex;
    align-items: center;
    padding: 0 rem(8);
  }

  &__attribute-name {
    position: sticky;
    left: 0;
    background: var(--color-neutral-10);
    @include font-semibold(14);
  }

  &__match {
    margin-left: rem(15);
  }
}

.shadow--right {
  &::after {
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

.show-line {
  &::before {
    transition: opacity 0.2s ease-in-out;
    position: absolute;
    content: "";
    width: rem(1px);
    height: calc(100% + 5px);
    bottom: rem(5);
    left: rem(46.5);
    border-right: 1px solid var(--color-grey-100);
    z-index: 1;
  }
}
</style>
