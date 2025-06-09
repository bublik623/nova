<template>
  <Transition name="Modal__overlay__transition">
    <div
      v-if="show"
      class="Modal__overlay"
      :style="{ zIndex: zIndex }"
      data-testid="modal-overlay"
      @click="closeModal"
    ></div>
  </Transition>

  <button @focus="resetFocus"></button>
  <Transition name="Modal__transition">
    <div
      v-if="show"
      ref="modal"
      aria-modal="true"
      class="Modal"
      :style="{ zIndex: zIndex + 1 }"
      data-testid="modal"
      tabindex="-1"
      @keyup.esc="closeModal"
    >
      <slot></slot>
    </div>
  </Transition>
  <button @focus="resetFocus"></button>
</template>

<script setup lang="ts">
import { ref, onUpdated } from "vue";
export interface Props {
  zIndex?: number;
  show: boolean;
}
interface Events {
  (e: "click:on-overlay"): void;
}
const props = withDefaults(defineProps<Props>(), {
  zIndex: 75,
});
const emits = defineEmits<Events>();
const closeModal = () => {
  emits("click:on-overlay");
};
const modal = ref<HTMLDivElement | null>(null);
onUpdated(() => {
  if (props.show) {
    resetFocus();
  }
});
const resetFocus = () => {
  modal.value?.focus();
};
</script>
<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.Modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: var(--border-radius-default);
  background: var(--color-white);
  transition: opacity 180ms ease-out, margin 180ms ease-in-out;
  box-shadow: var(--box-shadow-popover);

  &__transition-enter-from {
    opacity: 0;
    margin-top: rem(100px);
  }

  &__transition-enter-to {
    opacity: 1;
    margin-top: 0;
  }

  &__transition-leave-from {
    opacity: 1;
    margin-top: 0;
  }

  &__transition-leave-to {
    opacity: 0;
    margin-top: rem(100px);
  }

  &__overlay {
    background-color: var(--color-overlay);
    position: fixed;
    height: 100vh;
    width: 100vw;
    transition: opacity 180ms ease-out 180ms;
    top: 0;
    left: 0;

    &__transition-enter-from {
      opacity: 0;
    }

    &__transition-enter-to {
      opacity: 1;
    }

    &__transition-leave-from {
      opacity: 1;
    }

    &__transition-leave-to {
      opacity: 0;
    }
  }
}
</style>
