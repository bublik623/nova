<template>
  <div
    ref="reference"
    class="NovaTooltip"
    data-testid="nova-tooltip"
    @mouseenter="open = true"
    @mouseleave="open = false"
  >
    <slot />
  </div>

  <Teleport to="body">
    <div v-if="open" ref="floating" role="tooltip" :style="floatingStyles">
      <div class="NovaTooltip__bubble" data-testid="nova-tooltip-tip" :theme="theme || null">
        <slot name="content" />
        <div
          id="arrow"
          ref="floatingArrow"
          class="NovaTooltip__arrow"
          data-testid="nova-tooltip-arrow"
          :style="arrowPosition"
        ></div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { Placement, useFloating, autoUpdate, offset, arrow, Side } from "@floating-ui/vue";
import { ref } from "vue";

export interface NovaTooltipProps {
  position?: Placement;
  theme?: "light" | "dark";
}

const props = withDefaults(defineProps<NovaTooltipProps>(), {
  position: "top",
  theme: "light",
});

const open = ref(false);
const reference = ref();
const floating = ref();
const floatingArrow = ref();

const middleware = ref([offset(10), arrow({ element: floatingArrow })]);

const arrowPosition = computed(() => {
  if (!middlewareData.value.arrow) {
    return {};
  }

  const { x, y } = middlewareData.value.arrow;
  const side = props.position.split("-")[0] as Side;

  const positionMap = {
    top: { left: `${x}px`, bottom: `-${floatingArrow.value?.offsetHeight / 2}px` },
    bottom: { left: `${x}px`, top: `-${floatingArrow.value?.offsetHeight / 2}px` },
    left: { top: `${y}px`, right: `-${floatingArrow.value?.offsetWidth / 2}px` },
    right: { top: `${y}px`, left: `-${floatingArrow.value?.offsetWidth / 2}px` },
  };

  return positionMap[side];
});

const { floatingStyles, middlewareData } = useFloating(reference, floating, {
  placement: props.position,
  open: open.value,
  middleware,
  whileElementsMounted: autoUpdate,
});
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.NovaTooltip {
  &__bubble {
    filter: drop-shadow(var(--box-shadow-popover));

    --background-color: white;
    --text-color: var(--color-text-100);
    --shadow: var(--box-shadow-popover);

    width: max-content;
    max-width: 300px;
    padding: rem(8) rem(16);
    border: 2px solid transparent;
    border-radius: var(--border-radius-default);
    color: var(--text-color);
    background-color: var(--background-color);

    @include font-semibold(12);

    &[theme="dark"] {
      --background-color: var(--color-text-100);
      --text-color: white;
      --shadow: none;
    }
  }

  &__arrow {
    position: absolute;
    height: 15px;
    width: 15px;
    transform: rotate(45deg);
    background-color: var(--background-color);
  }
}
</style>
