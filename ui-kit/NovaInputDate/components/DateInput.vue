<template>
  <div class="DateInput" :readonly="readonly || null">
    <label v-if="label" class="DateInput__label" :for="id">{{ label }}</label>

    <div class="DateInput__input" :invalid="isInvalid || null">
      <NovaIcon name="calendar" :size="18" />
      <span v-if="!value" class="DateInput__placeholder">{{ placeholder }}</span>

      <span v-else>{{ new Intl.DateTimeFormat("en-gb").format(value) }}</span>

      <input class="DateInput__disabled_input" :id="id" type="date" :value="value?.toISOString()" disabled />

      <button
        v-if="value && !readonly"
        class="DateInput__clear-btn"
        data-testid="input-date-clear-button"
        @click.stop="$emit('click:clear')"
      >
        <NovaIcon name="close" :size="8" />
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";

interface Props {
  id: string;
  value?: Date;
  label?: string;
  placeholder?: string;
  isInvalid?: boolean;
  readonly?: boolean;
}

interface Events {
  (e: "click:clear"): void;
}

defineProps<Props>();
defineEmits<Events>();
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.DateInput {
  position: relative;

  &__input {
    cursor: pointer;
    height: rem(32);
    padding: 0 rem(5);
    display: grid;
    grid-template-columns: auto auto 1fr auto;
    align-items: center;
    gap: rem(5);
    border: var(--border-default);
    border-radius: var(--border-radius-default);
    @include font-regular(14);

    & > input {
      visibility: hidden;
    }

    &:hover,
    &:focus-visible {
      border-color: var(--color-primary-100);
    }

    &[disabled] {
      background: #f9f9fb;

      &:hover {
        border-color: var(--color-grey-100);
      }
    }

    &[invalid] {
      border-color: var(--color-error-100);
    }
  }

  &__placeholder {
    color: var(--color-text-70);
  }

  &__disabled_input {
    display: none;
  }

  &__clear-btn {
    border: none;
    cursor: pointer;
    padding: 0;
    height: rem(16);
    width: rem(16);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background-color: var(--color-grey-90);
  }

  &__label {
    position: absolute;
    top: -20px;

    @include font-regular(12);
  }

  &[selecting-date] {
    .DateInput__input {
      border-color: var(--color-primary-100);
    }
  }
}

.DateInput[readonly] {
  .DateInput__input {
    border-color: transparent;
    cursor: initial;
  }
}
</style>
