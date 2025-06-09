<script setup lang="ts">
import NovaInputNumber from "@/ui-kit/NovaInputNumber/NovaInputNumber.vue";
import {
  PaxType,
  Pricing,
} from "@/features/experience-calendar/components/PricingFormPaxPricingList/PricingFormPaxPricingTypes";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import NovaTooltip from "@/ui-kit/NovaTooltip/NovaTooltip.vue";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";
import { Currency } from "@/types/generated/ContractMasterDataApi";
import { useNetPrice } from "@/features/experience-calendar/components/PricingFormPaxPricingList/useNetPrice";

export type PaxPricingProps = {
  paxType: PaxType;
  currency: Currency;
  readonly: boolean;
};
const props = defineProps<PaxPricingProps>();

const pricing = defineModel<Pricing>({ required: true });

const netPrice = useNetPrice(readonly(pricing));

watch(netPrice, (newNetPrice) => {
  pricing.value.netPrice = newNetPrice;
});

const hasPurchasableAmountConstraint = computed(() => {
  return !!pricing.value.purchasableAmountConstraint;
});

const isRetailPriceInvalid = computed(() => !props.readonly && pricing.value.retailPrice <= 0);
const isCommissionInvalid = computed(() => !props.readonly && pricing.value.commissionPercentage < 0);
const isMinimumPurchasableQuantityInvalid = computed(
  () => !props.readonly && (pricing.value.purchasableAmountConstraint?.min ?? 0) <= 0
);
const isMaximumPurchasableQuantityInvalid = computed(
  () =>
    !props.readonly &&
    ((pricing.value.purchasableAmountConstraint?.max ?? 0) <= 0 ||
      (pricing.value.purchasableAmountConstraint?.max ?? 0) < (pricing.value.purchasableAmountConstraint?.min ?? 0))
);

function addPurchasableAmountConstraint() {
  pricing.value.purchasableAmountConstraint = {
    min: 1,
    max: 15,
  };
}

function removePurchasableAmountConstraint() {
  pricing.value.purchasableAmountConstraint = undefined;
}
</script>

<template>
  <div>
    <div class="flex flex-row">
      <div v-if="paxType.freeOfCharge" class="flex flex-col justify-center">
        <span class="text-xs text-text-90 mr-3">{{ $t("experience.holder.free-of-charge") }}</span>
      </div>
      <div v-else class="flex flex-row justify-between">
        <!-- Retail Price -->
        <div class="flex flex-col w-24">
          <div class="flex flex-row items-center h-5">
            <label class="text-xs text-text-90 inline-block" :for="`retail-price-${paxType.code}`">{{
              $t("experience.holder.retail-price.title")
            }}</label>
            <NovaTooltip theme="dark">
              <NovaButton variant="action" size="xxs">
                <NovaIcon name="circle-info" :size="13" class="text-text-90" />
              </NovaButton>
              <template #content>
                <p>{{ $t("experience.holder.retail-price.tooltip") }}</p>
              </template>
            </NovaTooltip>
          </div>
          <div class="flex flex-row items-center w-20">
            <NovaInputNumber
              :id="`retail-price-${paxType.code}`"
              v-model="pricing.retailPrice"
              :min-value="0"
              :max-value="1000"
              step=".01"
              class="grow"
              :is-invalid="isRetailPriceInvalid"
              :disabled="readonly"
            />
            <span class="ml-1 flex-none">{{ currency.symbol }}</span>
          </div>
        </div>

        <!-- Commission -->
        <div class="flex flex-col w-24">
          <div class="flex flex-row items-center h-5">
            <label class="text-xs text-text-90" :for="`commission-${paxType.code}`">{{
              $t("experience.holder.commission.title")
            }}</label>
          </div>
          <div class="flex flex-row items-center w-20">
            <NovaInputNumber
              :id="`commission-${paxType.code}`"
              v-model="pricing.commissionPercentage"
              :min-value="0"
              :max-value="100"
              step=".01"
              class="grow"
              :is-invalid="isCommissionInvalid"
              :disabled="readonly"
            />
            <span class="ml-1 flex-none">&percnt;</span>
          </div>
        </div>

        <!-- Net Price -->
        <div class="flex flex-col w-24">
          <div class="flex flex-row items-center h-5">
            <label class="text-xs text-text-90" :for="`net-price-${paxType.code}`">
              {{ $t("experience.holder.net-price.title") }}
            </label>
            <NovaTooltip theme="dark">
              <NovaButton variant="action" size="xxs">
                <NovaIcon name="circle-info" :size="13" class="text-text-90" />
              </NovaButton>
              <template #content>
                <p>{{ $t("experience.holder.net-price.tooltip") }}</p>
              </template>
            </NovaTooltip>
          </div>
          <div class="flex flex-row items-center w-20">
            <NovaInputNumber
              :id="`net-price-${paxType.code}`"
              :model-value="netPrice"
              :min-value="0"
              :disabled="true"
              class="grow"
            />
            <span class="ml-1 flex-none">{{ currency.symbol }}</span>
          </div>
        </div>
      </div>
      <!-- Add purchasable amount CTA -->
      <div class="flex flex-col justify-end">
        <div v-if="!hasPurchasableAmountConstraint && !readonly" class="flex flex-row">
          <NovaButton
            variant="text"
            size="xs"
            theme="primary"
            :data-testid="`add-purchasable-amount-${paxType.code}`"
            @click="addPurchasableAmountConstraint"
          >
            <NovaIcon name="plus" :size="12" class="mr-2" />
            {{ `${$t("experience.holder.purchasable-amount.set-amount")}` }}
          </NovaButton>
          <NovaTooltip theme="dark">
            <NovaButton variant="action" size="xxs">
              <NovaIcon name="circle-info" :size="13" class="text-text-90 mt-1" />
            </NovaButton>
            <template #content>
              <p>{{ $t("experience.holder.purchasable-amount.title") }}</p>
            </template>
          </NovaTooltip>
        </div>
      </div>
    </div>
    <div v-if="hasPurchasableAmountConstraint" class="flex flex-row mt-2">
      <!-- Purchasable Amount -->
      <div class="flex flex-col">
        <div class="flex flex-row items-center h-5">
          <label class="text-xs text-text-90" :for="`purchasable-amount-min-${paxType.code}`">{{
            $t("experience.holder.purchasable-amount.amount")
          }}</label>
          <NovaTooltip theme="dark">
            <NovaButton variant="action" size="xxs">
              <NovaIcon name="circle-info" :size="13" class="text-text-90" />
            </NovaButton>
            <template #content>
              <p>{{ $t("experience.holder.purchasable-amount.tooltip") }}</p>
            </template>
          </NovaTooltip>
        </div>
        <div class="flex flex-row items-center">
          <!-- Purchasable Amount MIN -->
          <NovaInputNumber
            :id="`purchasable-amount-min-${paxType.code}`"
            v-model="pricing.purchasableAmountConstraint!.min"
            :min-value="1"
            :is-invalid="isMinimumPurchasableQuantityInvalid"
            :disabled="readonly"
          />
          <span class="mx-2">{{ $t("common.seperator.to") }}</span>
          <!-- Purchasable Amount MAX -->
          <NovaInputNumber
            :id="`purchasable-amount-max-${paxType.code}`"
            v-model="pricing.purchasableAmountConstraint!.max"
            :min-value="pricing.purchasableAmountConstraint!.min"
            :is-invalid="isMaximumPurchasableQuantityInvalid"
            :disabled="readonly"
          />
          <!-- Purchasable Amount Remove -->
          <NovaButton
            v-if="!readonly"
            :data-testid="`purchasable-amount-remove-${paxType.code}`"
            variant="action"
            class="pl-3"
            size="xs"
            @click="removePurchasableAmountConstraint"
          >
            <NovaIcon name="trash" :size="20" />
          </NovaButton>
        </div>
      </div>
    </div>
  </div>
</template>
