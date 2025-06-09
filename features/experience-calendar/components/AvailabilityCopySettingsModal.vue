<template>
  <div v-if="show" ref="modal" aria-modal="true" class="CopySettingsModal" data-testid="modal">
    <p class="CopySettingsModal__title">
      {{ $t("experience.availability.copy.settings") }}
    </p>
    <p class="CopySettingsModal__description">
      {{ $t("experience.availability.copy.settings.description") }}
    </p>

    <ul class="CopySettingsModal__days">
      <li v-for="day in scheduleDays" :key="day.dayNumber">
        <NovaCheckbox
          :status="day.checked ? 'checked' : 'unchecked'"
          :disabled="disabledDays.includes(day.dayNumber)"
          :value="$t(day.label)"
          :label="$t(day.label)"
          @update:status="day.checked = !day.checked"
        />
      </li>
    </ul>

    <div class="CopySettingsModal__buttons">
      <NovaButton
        size="sm"
        variant="underlined"
        data-testid="copy-settings-select-all-btn"
        @click="Object.values(scheduleDays).forEach((d) => (d.checked = !d.disabled && true))"
      >
        {{ $t("experience.availability.copy.settings.select") }}
      </NovaButton>
      <NovaButton size="sm" data-testid="copy-settings-copy-btn" @click="handleCopyClick">
        {{ $t("experience.availability.copy.settings.copy") }}
      </NovaButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import NovaCheckbox from "@/ui-kit/NovaCheckbox/NovaCheckbox.vue";
import { useDetectClickOutside } from "@/composables/useDetectClickOutside";

export interface Props {
  show: boolean;
  disabledDays: number[];
}

interface Events {
  (e: "close"): void;
  (e: "click:copy", days: number[]): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Events>();

const modal = ref<HTMLElement | null>(null);

useDetectClickOutside(modal, () => emit("close"));

const scheduleDays = reactive([
  {
    dayNumber: 1,
    label: "common.monday",
    checked: false,
    disabled: props.disabledDays.includes(1),
  },
  {
    dayNumber: 2,
    label: "common.tuesday",
    checked: false,
    disabled: props.disabledDays.includes(2),
  },
  {
    dayNumber: 3,
    label: "common.wednesday",
    checked: false,
    disabled: props.disabledDays.includes(3),
  },
  {
    dayNumber: 4,
    label: "common.thursday",
    checked: false,
    disabled: props.disabledDays.includes(4),
  },
  {
    dayNumber: 5,
    label: "common.friday",
    checked: false,
    disabled: props.disabledDays.includes(5),
  },
  {
    dayNumber: 6,
    label: "common.saturday",
    checked: false,
    disabled: props.disabledDays.includes(6),
  },
  {
    dayNumber: 7,
    label: "common.sunday",
    checked: false,
    disabled: props.disabledDays.includes(7),
  },
]);

function handleCopyClick() {
  const selectedDays = scheduleDays.filter((d) => d.checked).map((d) => d.dayNumber);
  emit("click:copy", selectedDays);
  emit("close");
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.CopySettingsModal {
  width: rem(310);
  padding: rem(24);
  position: absolute;
  top: rem(38);
  z-index: var(--z-index-dropdown);
  border-radius: var(--border-radius-default);
  background: var(--color-white);
  box-shadow: var(--box-shadow-popover);

  &__title {
    margin-bottom: rem(5);
    @include font-bold(16);
  }

  &__description {
    color: var(--color-text-90);
    @include font-regular(14);
  }

  &__days {
    margin: rem(24) 0 rem(20);
    max-height: rem(100);
    display: flex;
    gap: 8px;
    flex-flow: column wrap;
  }

  &__buttons {
    display: flex;
    justify-content: space-between;
  }
}
</style>
