<template>
  <div ref="component" class="PricingDropdown">
    <button
      class="PricingDropdownToggle"
      aria-haspopup="listbox"
      :disabled="disabled"
      aria-labelledby="dropdown-label"
      data-testid="pricing-dropdown-toggle"
      :open="dropdownOpen || null"
      :invalid="hasDropdownError || hasInnerElementError || null"
      @click="toggleDropdown(!dropdownOpen)"
      @keydown.esc="toggleDropdown(false)"
    >
      <span v-if="modelValue && modelValue[0]" id="dropdown-label">{{
        pricingList.find((p) => modelValue && p.id === modelValue[0].pricing)?.name
      }}</span>
      <span v-else id="dropdown-label" class="PricingDropdownToggle__placeholder">{{
        $t("pricing.dropdown.placeholder")
      }}</span>

      <nova-icon name="chevron-down" :open="dropdownOpen || null" :size="14" />

      <span v-show="hasInnerElementError" class="PricingDropdownToggle__error">{{ $t("common.missing.info") }}</span>
    </button>

    <div v-if="dropdownOpen" class="PricingDropdownMenu">
      <div class="PricingDropdownMenu__header">
        <span>{{ modelValue?.length }} {{ $t("common.dropdown.header.selected") }}</span>
        <NovaButton
          variant="underlined"
          size="xs"
          style="margin-right: -10px"
          data-testid="pricing-clear-all-btn"
          @click="$emit('update:modelValue', [])"
          >{{ $t("common.dropdown.clear.button") }}</NovaButton
        >
      </div>
      <div class="PricingDropdownMenu__header">
        <span>{{ $t("pricing.dropdown.header.pricing") }}</span>
        <span v-if="limitedCapacity">{{ $t(`pricing.dropdown.header.capacity.${type}`) }}</span>
      </div>
      <ul
        v-for="[name, pricings] in Object.entries(pricingsGroupedByName)"
        :key="name"
        class="PricingDropdownMenu__group"
        data-testid="pricing-group"
      >
        <NovaInputRadio
          :option="{ label: name, value: name }"
          :checked="isPricingGroupChecked(name)"
          @input="handleSelectPricingGroup(name)"
        />
        <li v-for="pricing in pricings" :key="pricing.id" class="PricingDropdownMenu__item" data-testid="pricing-item">
          <NovaCheckbox
            :value="pricing.id ?? pricing.holder"
            :label="pricing.holder"
            :status="modelValue?.some((p) => p.pricing === pricing.id) ? 'checked' : 'unchecked'"
            @update:status="handleSelectPricing(pricing)"
          />
          <NovaInputNumber
            v-if="limitedCapacity"
            :id="`${name}-${pricing.holder}-input-number`"
            data-testid="pricing-capacity-input"
            :disabled="!modelValue?.some((p) => p.pricing === pricing.id)"
            :min-value="0"
            :is-invalid="modelValue?.find((p) => p.pricing === pricing.id)?.capacity === 0"
            :model-value="modelValue?.find((p) => p.pricing === pricing.id)?.capacity ?? 0"
            @update:model-value="(value) => handleSelectCapacity(value, pricing.id)"
          />
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";
import NovaCheckbox from "@/ui-kit/NovaCheckbox/NovaCheckbox.vue";
import NovaInputNumber from "@/ui-kit/NovaInputNumber/NovaInputNumber.vue";
import NovaInputRadio from "@/ui-kit/NovaInputRadio/NovaInputRadio.vue";
import { useDetectClickOutside } from "@/composables/useDetectClickOutside";
import { Pricing, Ticket } from "@/types/generated/OfferServiceApiOld";

export interface Props {
  pricingList: Pricing[];
  modelValue: Ticket["pricings"];
  limitedCapacity?: boolean;
  disabled?: boolean;
  validationErrors?: Record<string, any>;
  type?: "group" | "person";
}
const component = ref<Element | null>(null);

interface Events {
  (e: "update:modelValue", val: Ticket["pricings"]): void;
}
useDetectClickOutside(component, () => {
  toggleDropdown(false);
});

const props = defineProps<Props>();
const emits = defineEmits<Events>();

const dropdownOpen = ref(false);
const toggleDropdown = (show: boolean) => {
  dropdownOpen.value = show;
};

const hasDropdownError = computed(() => !!props.validationErrors?._errors.length);
const hasInnerElementError = computed(() => Object.entries(props.validationErrors ?? {}).length > 1);

const pricingsGroupedByName = computed<Record<string, Pricing[]>>(() =>
  props.pricingList.reduce((res, pricing) => {
    if (res[pricing.name]) {
      res[pricing.name].push(pricing);
    } else {
      res[pricing.name] = [pricing];
    }

    return res;
  }, {} as Record<string, Pricing[]>)
);

const isPricingGroupChecked = computed(() => (name: string) => {
  if (props.modelValue && props.modelValue.length > 0) {
    return props.modelValue
      .map(({ pricing }) => props.pricingList.find((p) => p.id === pricing))
      .every((p) => p?.name === name);
  }
  return false;
});

function handleSelectPricing(pricing: Pricing) {
  let currentPricings = [...(props.modelValue ?? [])];

  // if pricing is already selected, delete it
  if (currentPricings.some((p) => p.pricing === pricing.id)) {
    const idx = currentPricings.findIndex((p) => p.pricing === pricing.id);
    currentPricings.splice(idx, 1);
    // if the selected pricing has a different name, select only that pricing
  } else if (
    currentPricings[0] &&
    pricing.name !== props.pricingList.find((p) => p.id === currentPricings[0].pricing)?.name
  ) {
    currentPricings = [
      {
        pricing: pricing.id as string,
        capacity: props.limitedCapacity ? 0 : undefined,
      },
    ];
    // else add it to the current selected pricings
  } else {
    currentPricings.push({
      pricing: pricing.id as string,
      capacity: props.limitedCapacity ? 0 : undefined,
    });
  }

  emits("update:modelValue", currentPricings);
}

function handleSelectPricingGroup(name: string) {
  // Copy the currently selected values
  const currentPricings = [...(props.modelValue ?? [])];

  // if the selected group is different, reset the values and update
  if (currentPricings[0] && name !== props.pricingList.find((p) => p.id === currentPricings[0].pricing)?.name) {
    const newPricings = props.pricingList
      .filter((p) => p.name === name)
      .map((p) => ({
        pricing: p.id as string,
        capacity: props.limitedCapacity ? 0 : undefined,
      }));

    emits("update:modelValue", newPricings);
  }
  // else add the missing pricing to the list of selected pricings and update
  else {
    const newPricings = props.pricingList.filter(
      (p) => p.name === name && !currentPricings.map((c) => c.pricing).includes(p.id as string)
    );

    emits("update:modelValue", [
      ...currentPricings,
      ...newPricings.map((p) => ({
        pricing: p.id as string,
        capacity: props.limitedCapacity ? 0 : undefined,
      })),
    ]);
  }
}

function handleSelectCapacity(value: number, pricingId?: string) {
  if (!pricingId) {
    return;
  }
  const currentPricings = [...(props.modelValue ?? [])];
  const selectedPricing = currentPricings.find((p) => p.pricing === pricingId);

  if (selectedPricing) {
    selectedPricing.capacity = value;
    emits("update:modelValue", currentPricings);
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.PricingDropdown {
  position: relative;
}

.PricingDropdownToggle {
  position: relative;
  width: 100%;
  cursor: pointer;
  background-color: transparent;
  outline: none;
  border: var(--border-default);
  border-radius: var(--border-radius-default);
  padding: rem(5) rem(10);
  @include font-regular(14);

  display: flex;
  align-items: center;
  justify-content: space-between;

  &:disabled {
    background: var(--color-neutral-10);
    cursor: not-allowed;
  }

  &:focus-visible,
  &:hover:not([disabled]),
  &[open] {
    border: var(--border-primary);
  }

  &[invalid] {
    border-color: var(--color-error-100);
  }

  &__placeholder {
    font-style: italic;
    color: var(--color-text-70);
  }

  .svg-icon {
    margin-left: rem(10);
    transition: transform 0.2s;

    &[open] {
      transform: rotate(180deg);
    }
  }

  &__error {
    position: absolute;
    left: 0;
    bottom: -14px;
    color: var(--color-error-110);
    @include font-regular(12);
  }
}

.PricingDropdownMenu {
  width: 100%;
  padding-bottom: rem(10);
  min-width: rem(265);
  max-height: rem(400);
  overflow-x: hidden;
  position: absolute;
  top: calc(100% + 4px);
  border: var(--border-default);
  border-radius: var(--border-radius-default);
  box-shadow: var(--box-shadow-popover);
  background-color: var(--color-white);
  z-index: var(--z-index-dropdown);
  display: flex;
  flex-direction: column;

  &__header {
    padding: rem(7) rem(20) rem(7) rem(5);
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--color-grey-90);
    color: var(--color-text-90);
    @include font-regular(12);
  }

  &__group {
    padding: rem(10) rem(7) 0;

    & > label {
      margin-bottom: rem(10);
      @include font-regular(14);
    }
  }

  &__item {
    height: rem(40);
    padding-right: rem(13);
    padding-left: rem(25);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
