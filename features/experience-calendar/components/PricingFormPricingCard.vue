<template>
  <NovaCollapse
    :model-value="pricing.isOpen"
    class="mb-4"
    :title="pricing.pricingName || $t('experience.pricing.title')"
    data-testid="pricing-item"
    @update:model-value="(isOpen) => handleToggleCard(isOpen, pricing)"
  >
    <template #actions>
      <NovaButtonIcon
        v-if="!readonly"
        name="trash"
        theme="dark"
        :size="20"
        data-testid="delete-pricing"
        shape="square"
        @click="() => (pricing.isDeleteModalVisible = true)"
      />
      <NovaModalConfirm
        :show-modal="pricing.isDeleteModalVisible"
        :title="$t('experience.pricing.delete-modal.title')"
        :description="$t('experience.pricing.delete-modal.description')"
        :cta-confirm-text="$t('common.delete')"
        :cta-cancel-text="$t('common.cancel')"
        :confirm-callback="() => pricingStore.deletePricingCard(optionId, pricing.cardId, pricing.holders)"
        :cancel-callback="() => (pricing.isDeleteModalVisible = false)"
      />
    </template>
    <div class="p-4">
      <div class="form-field">
        <NovaFieldHeading
          :title="$t('experience.pricing.name.title')"
          :description="$t('experience.pricing.name.description')"
          required
        />
        <div class="form-field__controls mt-3">
          <NovaInputText
            id="pricing-name"
            :disabled="readonly"
            :model-value="pricing.pricingName"
            :is-invalid="pricingStore.getPricingError(`${index}.name`) && !readonly"
            @update:model-value="
              (name) => {
                handlePricingNameChange(name, pricing);
              }
            "
          />
        </div>
      </div>

      <div class="holders">
        <div class="form-field mt-6">
          <NovaFieldHeading
            v-if="!useFeatureFlag('pax_enabled') || pricingType === 'group'"
            :title="$t(`experience.holder.${pricingType}.title`)"
            :description="$t(`experience.holder.${pricingType}.description`)"
            required
          />
          <NovaFieldHeading
            v-else
            :title="$t(`experience.pricings.${pricingType}.title`)"
            :description="$t(`experience.pricings.${pricingType}.description`)"
            required
          />
          <NovaAlert
            v-show="pricingType === 'group'"
            status="info"
            size="sm"
            variant="solid"
            class="my-4"
            data-testid="availability-overlapping-timeslots-error"
            >{{ $t("experience.availability.info.group.max-number") }}</NovaAlert
          >
          <NovaAlert
            v-show="pricing.holders.some((h) => pricingStore.getPricingError(`${h.pricingIndex}.age_range`))"
            status="error"
            size="sm"
            variant="solid"
            class="mt-3"
            data-testid="holder-overlapping-age-error"
            >{{ $t("experience.holder.holders.error.overlapping") }}
          </NovaAlert>
          <NovaAlert
            v-show="pricingStore.getPricingError('missing_retail_price')"
            status="error"
            size="sm"
            variant="solid"
            class="mt-3"
            data-testid="holder-overlapping-age-error"
          >
            {{ $t("experience.holder.holders.error.missing_retail_price") }}
          </NovaAlert>
          <template v-if="!useFeatureFlag('pax_enabled') || pricingType === 'group'">
            <div class="form-field__controls">
              <div v-for="holder in pricing.holders" :key="holder.cardId" class="mt-4 mb-4">
                <PricingFormHolderCard
                  :model-value="holder"
                  :readonly="readonly"
                  :option-id="optionId"
                  :pricing="pricing"
                  :currency="currency"
                />
              </div>
            </div>
            <NovaButton
              v-if="!readonly"
              size="sm"
              data-testid="add-holder"
              variant="outline"
              @click="pricingStore.handleAddHolder(pricing, optionId, pricingType)"
            >
              &plus; {{ $t(`experience.holder.add-holder.${pricingType}`) }}
            </NovaButton>
          </template>
          <template v-else>
            <PricingFormPaxPricingList
              :model-value="pricing.paxPricingList"
              :pax-types="pricingStore.state.paxTypes.length > 0 ? pricingStore.state.paxTypes : pricing.paxTypes"
              :currency="currency"
              :readonly="!!readonly"
            ></PricingFormPaxPricingList>
          </template>
        </div>
      </div>
    </div>
  </NovaCollapse>
</template>

<script setup lang="ts">
import { PricingCard } from "@/types/Pricing";
import NovaAlert from "@/ui-kit/NovaAlert/NovaAlert.vue";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import NovaButtonIcon from "@/ui-kit/NovaButtonIcon/NovaButtonIcon.vue";
import NovaCollapse from "@/ui-kit/NovaCollapse/NovaCollapse.vue";
import NovaFieldHeading from "@/ui-kit/NovaFieldHeading/NovaFieldHeading.vue";
import NovaInputText from "@/ui-kit/NovaInputText/NovaInputText.vue";
import NovaModalConfirm from "@/ui-kit/NovaModalConfirm/NovaModalConfirm.vue";
import { useVModel } from "@vueuse/core";
import { usePricingStore } from "@/features/experience-calendar/store/usePricingStore";
import PricingFormHolderCard from "./PricingFormHolderCard.vue";
import { Pricing } from "@/types/generated/OfferServiceApiOld";
import { Currency } from "@/types/generated/ContractMasterDataApi";
import { useFeatureFlag } from "@/features/experience-shared/composables/useFeatureFlag";
import PricingFormPaxPricingList from "@/features/experience-calendar/components/PricingFormPaxPricingList/PricingFormPaxPricingList.vue";

export interface Props {
  modelValue: PricingCard;
  optionId: string;
  index: number;
  pricingType: Pricing["pricing_type"];
  readonly?: boolean;
  currency: Currency;
}

interface Events {
  (e: "update:modelValue", value: PricingCard): void;
}

const props = defineProps<Props>();
const emits = defineEmits<Events>();

const pricing = useVModel(props, "modelValue", emits);

const pricingStore = usePricingStore();

const handleToggleCard = (isOpen: boolean, pricingCard: PricingCard) => {
  pricingCard.isOpen = isOpen;
};

const handlePricingNameChange = (name: string, pricingCard: PricingCard) => {
  pricingCard.pricingName = name;
  pricingCard.holders.forEach((holder) => {
    holder.fields.name = name;
  });
};
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";
</style>
