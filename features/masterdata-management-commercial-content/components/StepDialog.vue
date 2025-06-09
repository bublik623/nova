<template>
  <div class="StepDialog">
    <div class="header px-5 py-4">
      <div>
        <!-- empty div to align the layout -->
      </div>
      <div class="text-center mt-1" data-testid="dialog-header-title">
        <slot name="title" />
        <div class="info mt-2">{{ $t("common.step") }} {{ currentStep }}/{{ steps }}</div>
      </div>
      <div>
        <NovaButtonIcon data-testid="dialog-header-close" name="close" :size="14" @click="$emit('close')" />
      </div>
    </div>
    <template v-for="(step, index) in steps" :key="step">
      <div v-if="step === currentStep">
        <div class="body px-5 py-4 my-4">
          <div :data-testid="`dialog-body-step-${step}`">
            <slot :name="`step-${step}`" :handler="stepHandlers[index]" />
          </div>
        </div>
        <NovaDivider />
        <div class="footer px-5 py-4">
          <div>
            <NovaButton
              v-if="!isFirstStep"
              variant="underlined"
              data-testid="dialog-footer-back"
              @click="handleStep(-1)"
            >
              {{ $t("common.back") }}
            </NovaButton>
          </div>
          <div>
            <NovaButton
              v-if="!isLastStep"
              :disabled="!stepHandlers[index].canNavigate.value"
              data-testid="dialog-footer-next"
              @click="handleStep(1)"
            >
              {{ $t("common.next") }}
            </NovaButton>
            <template v-if="isLastStep"> <slot name="complete" /> </template>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import NovaButtonIcon from "@/ui-kit/NovaButtonIcon/NovaButtonIcon.vue";
import NovaDivider from "@/ui-kit/NovaDivider/NovaDivider.vue";

type Events = {
  (e: "close"): void;
};

defineEmits<Events>();

const slots = useSlots();

// returns the total amount of slots starting with "step-",
// which we will use to create the steps in the component
const steps = computed(() => Object.keys(slots).filter((key) => key.startsWith("step-")).length);

const currentStep = ref(1);
const isFirstStep = computed(() => currentStep.value === 1);
const isLastStep = computed(() => currentStep.value === steps.value);

// instantiate the handlers for the given steps
const stepHandlers = computed(() => Object.keys(slots).map(() => useStepHandler()));

// the step handler is a local composable that will be exposed to the slot consumer
// via slot props, to manage the various states of the current step
function useStepHandler() {
  const canNavigate = ref(true);

  function setNavigation(value: boolean) {
    canNavigate.value = value;
  }
  return {
    canNavigate,
    setNavigation,
  };
}

function handleStep(value: number) {
  currentStep.value += value;
}
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.header {
  display: flex;
  justify-content: space-between;
}

.info {
  font-size: rem(14px);
}

.footer {
  display: flex;
  justify-content: space-between;
}
</style>
