<template>
  <div class="ActionBarPercentage" data-testid="action-bar-percentage-completion">
    <p :style="{ color: textColor, marginBottom: '2px' }">{{ `${percentage}%` }} {{ $t("common.complete") }}</p>
    <NovaPercentage :percentage="percentage" :color="progressbarColor" />
  </div>
</template>

<script lang="ts" setup>
import NovaPercentage from "@/ui-kit/NovaPercentage/NovaPercentage.vue";

export interface Props {
  percentage: number;
}

const props = defineProps<Props>();

const progressbarColor = computed(() =>
  props.percentage === 100
    ? "linear-gradient(to right, #268039, #5FC261 100%)"
    : "linear-gradient(to right, #a95b00, #f5ae3b 100%)"
);
const textColor = computed(() => (props.percentage === 100 ? "#268039" : "#a95b00"));
</script>

<style lang="scss">
@import "@/assets/scss/utilities";

.ActionBarPercentage {
  @include font-semibold(12);
}
</style>
