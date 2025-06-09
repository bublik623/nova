<template>
  <div class="holder__wrapper">
    <div class="holder">
      <div class="holder__type">
        <div class="holder__select">
          <div class="form-label__wrapper">
            <span class="form-label">{{ $t(`experience.holder.holder-type.${pricingType}.title`) }}</span>
          </div>

          <NovaSelect
            data-testid="holder_type"
            :max-height="260"
            :loading="false"
            :placeholder="$t('input.option.placeholder')"
            :disabled="readonly"
            :options="holder.holderTypeOptions.value"
            :selected="selectedOption"
            :is-invalid="pricingStore.getPricingError(`${index}.holder`) && !readonly"
            @select:option="(e) => handleOptionSelect(e as ExtendedHolderOption)"
          ></NovaSelect>
        </div>
        <div class="holder__age-range">
          <div class="form-label__wrapper">
            <span class="form-label">{{ $t("experience.holder.age-range.title") }}</span>
          </div>

          <div>
            <NovaInputNumber
              id="holder-age-from"
              data-testid="holder-age-from"
              :model-value="holder.ageRangeFrom.value"
              :disabled="(allAgesSelected && showAllAges) || readonly"
              :min-value="0"
              :max-value="99"
              placeholder="0"
              :is-invalid="
                (pricingStore.getPricingError(`${index}.age_range`) ||
                  pricingStore.getPricingError(`${index}.age_range.from`)) &&
                !readonly
              "
              @update:model-value="(value) => (holder.ageRangeFrom.value = value)"
            />
            <span class="px-2">{{ $t("common.seperator.to") }}</span>
            <NovaInputNumber
              id="holder-age-to"
              data-testid="holder-age-to"
              :model-value="holder.ageRangeTo.value"
              :disabled="(allAgesSelected && showAllAges) || readonly"
              :min-value="0"
              :max-value="99"
              placeholder="0"
              :is-invalid="
                (pricingStore.getPricingError(`${index}.age_range`) ||
                  pricingStore.getPricingError(`${index}.age_range.to`)) &&
                !readonly
              "
              @update:model-value="(value) => (holder.ageRangeTo.value = value)"
            />
          </div>
        </div>
        <div class="holder__all-ages">
          <NovaCheckbox
            v-if="showAllAges"
            data-testid="holder-all-ages"
            :label="$t('experience.holder.all-ages.title')"
            :value="allAgesStatus"
            :disabled="readonly"
            :status="allAgesStatus"
            @update:status="handleAllAgesStatus"
          />
        </div>
      </div>
      <div class="holder__pricing">
        <div class="holder__price-settings">
          <div class="holder__retail-price">
            <div class="form-label__wrapper">
              <span class="form-label">{{ $t("experience.holder.retail-price.title") }}</span>
              <NovaTooltip theme="dark">
                <NovaButton variant="action" size="xxs">
                  <NovaIcon name="circle-info" :size="15" />
                </NovaButton>
                <template #content>
                  <p>{{ $t("experience.holder.retail-price.tooltip") }}</p>
                </template>
              </NovaTooltip>
            </div>

            <div>
              <NovaInputNumber
                id="holder-retail-price"
                data-testid="holder-retail-price"
                :model-value="holder.retailPrice.value"
                :min-value="0"
                :max-value="999999999"
                :disabled="readonly"
                step=".01"
                placeholder="0"
                :is-invalid="pricingStore.getPricingError(`${index}.tiers.0.retail_price`) && !readonly"
                @update:model-value="(val) => (holder.retailPrice.value = val)"
              />
              <span data-testid="retail-price-currency-symbol" class="ml-1">{{ currency.symbol }}</span>
            </div>
          </div>

          <div class="holder__commission">
            <div class="form-label__wrapper">
              <span class="form-label">{{ $t("experience.holder.commission.title") }}</span>
            </div>

            <div>
              <NovaInputNumber
                id="holder-commission"
                data-testid="holder-commission"
                :model-value="holder.commission.value"
                :min-value="0"
                :max-value="100"
                :disabled="readonly"
                placeholder="0"
                step=".01"
                :is-invalid="pricingStore.getPricingError(`${index}.tiers.0.commission`) && !readonly"
                @update:model-value="(val) => (holder.commission.value = val)"
              />
              <span class="ml-1">&percnt;</span>
            </div>
          </div>

          <div class="holder__net-price">
            <div class="form-label__wrapper">
              <span class="form-label">{{ $t("experience.holder.net-price.title") }}</span>
              <NovaTooltip theme="dark">
                <NovaButton variant="action" size="xxs">
                  <NovaIcon name="circle-info" :size="15" />
                </NovaButton>
                <template #content>
                  <p>{{ $t("experience.holder.net-price.tooltip") }}</p>
                </template>
              </NovaTooltip>
            </div>

            <div>
              <NovaInputNumber
                id="holder-net-price"
                data-testid="holder-net-price"
                :model-value="holder.netPrice.value"
                :min-value="0"
                :max-value="999999999"
                step=".01"
                placeholder="0"
                :is-invalid="pricingStore.getPricingError(`${index}.tiers.0.net_price`) && !readonly"
                :disabled="true"
              />
              <span class="ml-1">{{ currency.symbol }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="flex mt-6 w-fit">
        <div v-if="pricingType !== 'group'">
          <p class="text-sm text-text-90">{{ $t("experience.holder.purchasable-amount.title") }}</p>
          <div class="pt-2.5">
            <NovaButton
              v-if="!isPurchasableAmountVisible"
              variant="underlined"
              size="xs"
              data-testid="button-purchasable"
              @click="isPurchasableAmountVisible = !isPurchasableAmountVisible"
              >{{ `+ ${$t("experience.holder.purchasable-amount.set-amount")}` }}</NovaButton
            >
            <div v-if="isPurchasableAmountVisible">
              <div class="form-label__wrapper">
                <p class="form-label">{{ $t("experience.holder.purchasable-amount.amount") }}</p>
                <NovaTooltip theme="dark">
                  <NovaButton variant="action" size="xxs">
                    <NovaIcon name="circle-info" :size="15" />
                  </NovaButton>
                  <template #content>
                    <p>{{ $t("experience.holder.purchasable-amount.tooltip") }}</p>
                  </template>
                </NovaTooltip>
              </div>
              <div class="flex items-center">
                <NovaInputNumber
                  id="holder-amount-from"
                  data-testid="holder-amount-from"
                  :model-value="holder.amountFrom.value"
                  :disabled="readonly"
                  :min-value="1"
                  :max-value="1000"
                  placeholder="0"
                  :is-invalid="pricingStore.getPricingError(`${index}.tiers.0.from`) && !readonly"
                  @update:model-value="(value) => (holder.amountFrom.value = value)"
                />
                <span class="px-2">{{ $t("common.seperator.to") }}</span>
                <NovaInputNumber
                  id="holder-amount-to"
                  data-testid="holder-amount-to"
                  :model-value="holder.amountTo.value"
                  :disabled="readonly"
                  :min-value="0"
                  :max-value="1000"
                  placeholder="0"
                  :is-invalid="pricingStore.getPricingError(`${index}.tiers.0.to`) && !readonly"
                  @update:model-value="(value) => (holder.amountTo.value = value)"
                />
                <NovaIcon class="pl-3 cursor-pointer" name="trash" :size="20" @click="handleClosePurchasable" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toReactive, useVModels } from "@vueuse/core";
import { Option } from "@/types/Option";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";
import NovaInputNumber from "@/ui-kit/NovaInputNumber/NovaInputNumber.vue";
import NovaSelect from "@/ui-kit/NovaSelect/NovaSelect.vue";
import NovaTooltip from "@/ui-kit/NovaTooltip/NovaTooltip.vue";
import NovaCheckbox, { NovaCheckBoxStatus } from "@/ui-kit/NovaCheckbox/NovaCheckbox.vue";
import { usePricingStore } from "@/features/experience-calendar/store/usePricingStore";
import { Pricing } from "@/types/generated/OfferServiceApiOld";
import { masterDataAgeRangeDefaults, masterDataAllAgesDefaults } from "../lib/experience-option-pricing";
import { Currency } from "@/types/generated/ContractMasterDataApi";

export interface HolderItemProps {
  holderTypeOptions: ExtendedHolderOption[];
  selectedHolder: string;
  ageRangeFrom: number;
  ageRangeTo: number;
  amountFrom: number;
  amountTo: number;
  retailPrice: number;
  commission: number;
  netPrice: number;
  showAllAges: boolean;
  name: string;
  index: number;
  pricingType: Pricing["pricing_type"];
  readonly?: boolean;
  currency: Currency;
}

export interface ExtendedHolderOption extends Option {
  is_age_required: boolean;
}

const props = defineProps<HolderItemProps>();
const emit = defineEmits<{
  (event: "update:selectedHolder", value: string): void;
  (event: "update:ageRangeFrom", value: number): void;
  (event: "update:ageRangeTo", value: number): void;
  (event: "update:amountFrom", value: number): void;
  (event: "update:amountTo", value: number): void;
  (event: "update:retailPrice", value: number): void;
  (event: "update:commission", value: number): void;
  (event: "update:netPrice", value: number): void;
  (event: "update:holderTypeOptions", value: Option[]): void;
  (event: "update:showAllAges", value: boolean): void;
  (event: "update:name", value: string): void;
  (event: "update:index", value: string): void;
  (event: "edited", value: boolean): void;
}>();
const pricingStore = usePricingStore();

const holder = useVModels(props, emit, { passive: true });

const handleClosePurchasable = () => {
  isPurchasableAmountVisible.value = false;
};

const allAgesSelected = ref(false);
const isPurchasableAmountVisible = ref(false);
const allAgesStatus = computed<NovaCheckBoxStatus>(() => (allAgesSelected.value ? "checked" : "unchecked"));
const handleAllAgesStatus = (status: NovaCheckBoxStatus | string) => {
  allAgesSelected.value = status !== "checked";
};
const selectedOption = ref<Option | undefined>(undefined);
const handleOptionSelect = (option: ExtendedHolderOption) => {
  selectedOption.value = option;
  holder.selectedHolder.value = option.value;

  const defaults = option.is_age_required ? masterDataAllAgesDefaults() : masterDataAgeRangeDefaults();

  // on selection of a new holder, apply the given defaults
  holder.ageRangeFrom.value = defaults.age_range.from;
  holder.ageRangeTo.value = defaults.age_range.to;
};

watch(
  () => holder.selectedHolder,
  () => {
    const optionFound = props.holderTypeOptions.find((option) => option.value === holder.selectedHolder.value);
    selectedOption.value = optionFound;
  },
  { deep: true, immediate: true }
);

// formula: NetPrice = RP - (RP / 100 * C)
const calculatedNetPrice = computed(() => {
  const retailPrice = holder.retailPrice.value;
  const commission = holder.commission.value;
  const result = retailPrice - (retailPrice / 100) * commission;
  return result.toFixed(2);
});

// formula:  C = 100 - (NP * 100 / RP)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const calculatedCommission = computed(() => {
  const netPrice = holder.netPrice.value;
  const retailPrice = holder.retailPrice.value;
  const result = 100 - (netPrice * 100) / retailPrice;
  return result;
});

watch(
  calculatedNetPrice,
  () => {
    holder.netPrice.value = parseFloat(calculatedNetPrice.value);
  },
  { immediate: true }
);

watch(
  () => allAgesSelected.value,
  () => {
    if (allAgesSelected.value) {
      holder.ageRangeFrom.value = 0;
      holder.ageRangeTo.value = 99;
    } else {
      holder.ageRangeFrom.value = 0;
      holder.ageRangeTo.value = 0;
    }
  }
);

// the all ages checkbox should be checked when ageRangeFrom is 0 and ageRangeTo is 99
watch(
  () => [holder.ageRangeFrom, holder.ageRangeTo, holder.showAllAges],
  () => {
    if (holder.showAllAges.value === true && holder.ageRangeFrom.value === 0 && holder.ageRangeTo.value === 99) {
      allAgesSelected.value = true;
    }
  },
  { immediate: true, deep: true }
);

const getHolderWithoutHolderTypeOptions = () => {
  const newHolder = JSON.parse(JSON.stringify(toReactive(holder)));
  // holderTypeOptions shouldn't count as a change so just remove it
  newHolder.holderTypeOptions = "";
  return JSON.stringify(newHolder);
};

const initialData = ref<string>("");
onMounted(() => {
  initialData.value = getHolderWithoutHolderTypeOptions();
});

watch(
  () => holder,
  () => {
    const updatedHolder = getHolderWithoutHolderTypeOptions();
    const isEdited = initialData.value !== updatedHolder;
    emit("edited", isEdited);
  },
  { deep: true }
);
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.form-label__wrapper {
  display: flex;
  align-items: center;
  gap: rem(1);
  height: rem(24);

  .NovaTooltip {
    margin-bottom: rem(2);
  }
}

.form-label {
  @include font-regular(12);

  color: var(--color-text-100);
}

.holder {
  @include font-regular(14);

  .InputNumber {
    margin: 0;
  }

  &__type {
    display: flex;
    margin-top: rem(-5);
  }

  &__pricing {
    display: flex;
    margin-top: rem(20);
  }

  &__select {
    width: rem(260);
    margin-right: rem(50);
  }

  &__price-settings {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    column-gap: rem(12);
  }

  &__all-ages {
    margin-left: rem(16);
    align-self: flex-end;
  }
}
</style>
