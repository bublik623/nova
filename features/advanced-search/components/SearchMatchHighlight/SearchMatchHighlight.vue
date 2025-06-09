<template>
  <slot v-if="!hasHighlights" />
  <RenderHtml v-else :class="style.highlight" :string="highlight" />
</template>

<script setup lang="ts">
import { computed, useCssModule } from "vue";
import RenderHtml from "@/components/Utils/RenderHtml/RenderHtml.vue";

export type SearchMatchHighlightProps = {
  highlight?: string;
};
const style = useCssModule("style");
const props = defineProps<SearchMatchHighlightProps>();

const highlight = computed(() => props.highlight ?? "");
const hasHighlights = computed(() => !!highlight.value);
</script>

<style module="style" lang="scss">
.highlight {
  em {
    background-color: var(--color-highlight);
  }
}
</style>
