<template>
  <NovaCollapse
    size="md"
    :model-value="true"
    :title="getHolderCardTitle(holder) || $t(`experience.options.pricing.holder.${holder.fields.pricing_type}`)"
    data-testid="holder-item"
  >
    <template #actions>
      <NovaTooltip theme="dark">
        <NovaButtonIcon
          v-if="!readonly"
          id="clear-button"
          name="clear"
          theme="dark"
          :size="20"
          data-testid="clear-holder"
          shape="square"
          @click="handleClearHolder(holder)"
        />
        <template #content>
          <p>{{ $t("common.clear") }}</p>
        </template>
      </NovaTooltip>

      <NovaTooltip theme="dark">
        <NovaButtonIcon
          v-if="pricing.holders.length > 1 && !readonly"
          name="trash"
          theme="dark"
          :size="20"
          data-testid="delete-holder"
          shape="square"
          @click="() => (holder.isDeleteModalVisible = true)"
        />
        <template #content>
          <p>{{ $t("common.delete") }}</p>
        </template>
      </NovaTooltip>

      <NovaModalConfirm
        :show-modal="holder.isDeleteModalVisible"
        :title="$t('experience.holder.delete-modal.title')"
        :description="$t('experience.holder.delete-modal.description')"
        :cta-confirm-text="$t('common.delete')"
        :cta-cancel-text="$t('common.cancel')"
        :confirm-callback="() => pricingStore.deletePricingCard(optionId, pricing.cardId, [holder])"
        :cancel-callback="() => (holder.isDeleteModalVisible = false)"
      />
    </template>
    <div class="p-4">
      <PricingFormHolderItem
        v-model:name="holder.fields.name"
        v-model:selected-holder="holder.fields.holder"
        v-model:age-range-from="holder.fields.age_range.from"
        v-model:age-range-to="holder.fields.age_range.to"
        v-model:retail-price="holder.fields.tiers[0].retail_price"
        v-model:commission="holder.fields.tiers[0].commission"
        v-model:net-price="holder.fields.tiers[0].net_price"
        v-model:amount-from="holder.fields.tiers[0].from"
        v-model:amount-to="holder.fields.tiers[0].to"
        :readonly="readonly"
        :pricing-type="holder.fields.pricing_type"
        :index="holder.pricingIndex"
        :show-all-ages="isAgeRequired(holder.fields.holder)"
        :holder-type-options="getFilteredHolderOptions(pricing.holders, holder.fields.holder)"
        :currency="currency"
        @edited="(edited) => handleHolderChange(edited, holder)"
      />
    </div>
  </NovaCollapse>
</template>

<script setup lang="ts">
import { HolderCard, PricingCard } from "@/types/Pricing";
import NovaButtonIcon from "@/ui-kit/NovaButtonIcon/NovaButtonIcon.vue";
import NovaCollapse from "@/ui-kit/NovaCollapse/NovaCollapse.vue";
import NovaModalConfirm from "@/ui-kit/NovaModalConfirm/NovaModalConfirm.vue";
import { useVModel } from "@vueuse/core";
import {
  getDefaultPricingFields,
  masterDataGroupHolderOptions,
  masterDataPricingHolderOptions,
} from "@/features/experience-calendar/lib/experience-option-pricing";
import { usePricingStore } from "@/features/experience-calendar/store/usePricingStore";
import PricingFormHolderItem from "./PricingFormHolderItem.vue";
import NovaTooltip from "@/ui-kit/NovaTooltip/NovaTooltip.vue";
import { Currency } from "@/types/generated/ContractMasterDataApi";

export interface Props {
  modelValue: HolderCard;
  pricing: PricingCard;
  optionId: string;
  readonly?: boolean;
  currency: Currency;
}

interface Events {
  (e: "update:modelValue", value: HolderCard): void;
}

const props = defineProps<Props>();
const emits = defineEmits<Events>();
const holder = useVModel(props, "modelValue", emits);

const pricingStore = usePricingStore();

// there is an issue with masterdata service so for now its inlined todo: https://jira.tuigroup.com/browse/OFF-793
/* eslint-disable prettier/prettier */
const masterDataHolderOptions =
  holder.value.fields.pricing_type === "person" ? masterDataPricingHolderOptions : masterDataGroupHolderOptions;

/**
 * Get filtered holder options for each holder.
 *
 * Each pricing can only have one holder type,
 * so if the holder type is set to "adult" then you cannot add another holder with the same holder type of "adult".
 */
const getFilteredHolderOptions = (_holders: HolderCard[], currentHolderName: string) => {
  const selected = _holders.map((_holder) => _holder.fields.holder).filter((name) => name !== currentHolderName);

  return masterDataHolderOptions.filter((holderOption) => {
    return !selected.includes(holderOption.value);
  });
};

const isAgeRequired = (selectedHolder: string) => {
  const foundHolderOption = masterDataHolderOptions.find((holderOption) => {
    return holderOption.value === selectedHolder;
  });
  return foundHolderOption?.is_age_required || false;
};

const getHolderCardTitle = (_holder: HolderCard) => {
  const holderOptionFound = masterDataHolderOptions.find(
    (holderOption) => holderOption.value === _holder.fields.holder
  );

  if (holderOptionFound && props.modelValue.fields.pricing_type === "person") {
    return `${holderOptionFound.label} ${_holder.fields.age_range.from} - ${_holder.fields.age_range.to} `;
  }

  if (holderOptionFound && props.modelValue.fields.pricing_type === "group") {
    return `${holderOptionFound.label}`;
  }
};

const handleHolderChange = (isEdited: boolean, holderCard: HolderCard) => {
  holderCard.isChanged = isEdited;
};

const handleClearHolder = (_holder: HolderCard) => {
  _holder.fields = getDefaultPricingFields(props.optionId, _holder.fields.pricing_type);
};
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

:deep(#clear-button) svg {
  height: 17px !important;
}
</style>
