<template>
  <NoContentUtil v-if="readonly && !selectedServicesMapped.length" />
  <div
    v-else
    :id="id"
    class="AdditionalServices"
    :loading="loading || null"
    :error="error || null"
    :disabled="disabled || null"
    :readonly="readonly || null"
  >
    <button
      class="AdditionalServices__header"
      :data-testid="`${id}-button`"
      :open="open || null"
      @click="$emit('toggle:open')"
    >
      <div class="AdditionalServices__title" :data-testid="`${id}-title`" :disabled="disabled || null">
        {{ $t(`additional.services.${id}.title`) }}
        <span v-if="modelValue.length && !readonly" class="AdditionalServices__title-filled">{{
          $t(`common.filled`)
        }}</span>
      </div>
      <NovaIcon name="chevron-down" class="AdditionalServices__right-icon" :open="open || null" :size="15" />
    </button>
    <div v-if="open" class="AdditionalServices__content" :aria-expanded="open">
      <p class="AdditionalServices__description" :data-testid="`${id}-description`">
        {{ $t(`additional.services.${id}.description`) }}
      </p>
      <div class="AdditionalServices__checklist">
        <NovaOptionsList
          :options="additionalServicesMapped"
          multi
          :selected="selectedServicesMapped"
          :disabled
          :readonly
          @select:option="(opt) => !disabled && handleServiceSelect(opt)"
          @click:clear="$emit('update:modelValue', [])"
          @keydown:esc="$emit('toggle:open')"
        />
      </div>
    </div>
    <span v-if="loading" :data-testid="`${id}-skeleton`" class="skeleton skeleton_item"></span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import NovaOptionsList from "@/ui-kit/NovaOptionsList/NovaOptionsList.vue";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";
import { AdditionalService } from "@/types/generated/ExperienceMasterDataApi";
import { Option } from "@/types/Option";
import NoContentUtil from "@/features/experience-shared/components/NoContentUtil.vue";

export interface Props {
  id: string;
  loading?: boolean;
  additionalServices: AdditionalService[];
  modelValue: string[];
  disabled?: boolean;
  error?: boolean;
  open?: boolean;
  readonly: boolean;
}
interface Events {
  (e: "update:modelValue", value: string[]): void;
  (e: "toggle:open"): void;
}

const additionalServicesMapped = computed(() => {
  return props.additionalServices.map((service) => ({
    label: service.name,
    value: service.code,
  }));
});

const emits = defineEmits<Events>();
const props = defineProps<Props>();

const handleServiceSelect = (opt: Option) => {
  if (props.modelValue.includes(opt.value)) {
    const newServices = props.modelValue.filter((element) => element !== opt.value);
    emits("update:modelValue", newServices);
  } else {
    emits("update:modelValue", [...props.modelValue, opt.value]);
  }
};

const selectedServicesMapped = computed(() => {
  return props.modelValue.map((serviceId) => ({
    label: "",
    value: serviceId,
  }));
});
</script>

<style lang="scss">
@import "@/assets/scss/utilities";

.skeleton {
  width: 200%;
  height: 200%;
  position: absolute;
  top: 0;
  left: 0;
}

.AdditionalServices {
  position: relative;
  width: 100%;
  border: 1px solid var(--color-grey-100);
  border-radius: 8px;
  background: var(--color-white);
  overflow: hidden;
  user-select: unset;

  &[disabled]:hover {
    border-color: var(--color-grey-100);
  }

  &[loading] {
    border-color: transparent;

    &:hover {
      border-color: transparent;
    }
  }

  &__title {
    &[disabled] {
      color: var(--color-text-70);
    }

    &-filled {
      color: var(--color-text-80);
      margin-left: rem(6);
      @include font-regular(12);
    }
  }

  &__header {
    background: var(--color-white);
    border: none;
    width: 100%;
    color: var(--color-text-100);
    padding: rem(10px) rem(16px);
    cursor: pointer;
    @include font-semibold(14);

    display: flex;
    justify-content: space-between;
    align-items: center;

    &[open] {
      background: var(--color-grey-70);
    }
  }

  &__description {
    color: var(--color-text-90);
    padding: rem(8px) rem(16px);

    @include font-regular(12);
  }

  &__right-icon {
    transition: transform 0.2s;

    &[open] {
      transform: rotate(180deg);
    }
  }

  &__spinner {
    color: var(--color-primary-100);
    height: rem(150);
    display: flex;
    justify-content: center;
    align-items: center;
    border-top: 1px solid var(--color-grey-90);
    margin-top: rem(33px);
  }

  &:hover:not([readonly]) {
    border-color: var(--color-primary-100);
  }

  &[error] {
    border-color: var(--color-error-100);
  }
}
</style>
