<template>
  <NoContentUtil v-if="readonly && !modelValue" />
  <div v-else class="Duration">
    <div class="SingleDuration">
      <span class="SingleDuration__label">{{ $t("common.time.days") }}</span>
      <NovaInputNumber
        id="duration-days"
        :error="error"
        data-testid="option-single-duration-days"
        class="SingleDuration__input"
        :model-value="duration?.days"
        :disabled="disabled"
        :readonly
        :min-value="0"
        :max-value="31"
        placeholder="0"
        @update:model-value="
          (days) =>
            handleUpdateDuration({
              days,
            })
        "
      />
    </div>
    <div class="SingleDuration">
      <span class="SingleDuration__label">{{ $t("common.time.hours") }}</span>
      <NovaInputNumber
        id="duration-hours"
        :error="error"
        data-testid="option-single-duration-hours"
        class="SingleDuration__input"
        :model-value="duration?.hours"
        :min-value="0"
        :disabled="disabled"
        :readonly
        :max-value="24"
        placeholder="0"
        @update:model-value="
          (hours) =>
            handleUpdateDuration({
              hours,
            })
        "
      />
    </div>
    <div class="SingleDuration">
      <span class="SingleDuration__label">{{ $t("common.time.minutes") }}</span>
      <NovaInputNumber
        id="duration-minutes"
        :error="error"
        data-testid="option-single-duration-minutes"
        class="SingleDuration__input"
        :model-value="duration?.minutes"
        :disabled="disabled"
        :readonly
        :min-value="0"
        :max-value="60"
        placeholder="0"
        @update:model-value="
          (minutes) =>
            handleUpdateDuration({
              minutes,
            })
        "
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { isoDuration } from "@musement/iso-duration";
import { DurationObj } from "@musement/iso-duration/dist/types/types";
import NovaInputNumber from "@/ui-kit/NovaInputNumber/NovaInputNumber.vue";
import { INSTANT_DURATION } from "@/constants/date.constants";
import NoContentUtil from "@/features/experience-shared/components/NoContentUtil.vue";

interface Props {
  modelValue?: string;
  error?: string;
  disabled?: boolean;
  readonly?: boolean;
}

interface Events {
  (event: "update:modelValue", value: string): void;
}

const props = defineProps<Props>();
const emits = defineEmits<Events>();

// Convert the stringified duration to a Duration Object
const duration = computed(() => (props.modelValue ? isoDuration(props.modelValue).parse() : null));

function handleUpdateDuration(value: Partial<DurationObj>) {
  const updatedCutoff = isoDuration({
    ...duration.value,
    ...value,
  })
    .toString()
    .normalize();

  // P0D is the same as INSTANT_DURATION in the backend
  // so we emit it instead for consistency
  if (updatedCutoff === "P0D") {
    emits("update:modelValue", INSTANT_DURATION);
  } else {
    emits("update:modelValue", updatedCutoff);
  }
}
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.Duration {
  display: inline-flex;
  gap: rem(8);

  .SingleDuration {
    display: flex;
    flex-direction: column;

    &__label {
      @include font-regular(12);
    }
  }
}
</style>
