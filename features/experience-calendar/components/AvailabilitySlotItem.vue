<template>
  <div class="SlotItem">
    <span>
      <div v-if="showTime" class="SlotItem__timeslot">
        <p v-if="showTitles" class="SlotItem__titles">
          {{ $t("slotitem.titles.timeslot") }}
        </p>
        <NovaInputTime
          :id="`${id}-slot-item-time`"
          v-model="data.time"
          :disabled="disabled"
          :is-invalid="hasTimeError"
        />
      </div>

      <div class="SlotItem__pricing">
        <p v-if="showTitles" class="SlotItem__titles">
          {{ $t("slotitem.titles.pricing") }}
        </p>
        <PricingDropdown
          v-model="data.pricings"
          :type="props.optionData?.pricing_type_allowed"
          :limited-capacity="fields.pricings.limitedCapacity"
          :pricing-list="props.pricingList"
          :disabled="disabled"
          :validation-errors="validationErrors?.pricings"
        ></PricingDropdown>
      </div>

      <div v-if="fields.languages.show" class="SlotItem__languages">
        <p v-if="showTitles" class="SlotItem__titles">
          {{ $t("slotitem.titles.languages") }}
        </p>
        <LanguagesDropdown
          v-model="data.languages"
          :type="props.optionData?.pricing_type_allowed"
          :limited-capacity="fields.languages.limitedCapacity"
          :disabled="disabled"
          :validation-errors="validationErrors?.languages"
          :allowed-languages="allowedLanguagesAsArray"
        ></LanguagesDropdown>
      </div>

      <div v-if="fields.capacity.show" class="SlotItem__capacity">
        <p v-if="showTitles" class="SlotItem__titles">
          {{ $t(`slotitem.titles.capacity.${props.optionData?.pricing_type_allowed}`) }}
        </p>
        <NovaInputNumber
          v-if="!fields.capacity.unlimited"
          :id="`${id}-slot-item-capacity`"
          :model-value="(data.capacity as number || undefined)"
          :min-value="1"
          :disabled="disabled"
          :is-invalid="!!validationErrors?.capacity?._errors.length"
          @update:model-value="(e) => (data.capacity = e)"
        ></NovaInputNumber>
        <p v-else class="">{{ $t("common.unlimited") }}</p>
      </div>
    </span>
    <div class="SlotItem__actions">
      <span
        v-if="showTime"
        ref="component"
        class="SlotItem__actions-duplicate"
        :style="{ borderRight: '1px solid var(--color-grey-100)' }"
      >
        <NovaTooltip theme="dark" class="mr-2 SlotItem__tooltip">
          <template #content> {{ $t("slotitem.duplicate.tooltip") }} </template>
          <NovaButtonIcon
            data-testid="slot-item-duplicate"
            :disabled="!enableDuplicateAction || disabled"
            shape="square"
            name="duplicate"
            :size="16"
            theme="dark"
            @click="showDuplicateModal = !showDuplicateModal"
          >
          </NovaButtonIcon>
        </NovaTooltip>

        <div v-if="showDuplicateModal" class="DuplicateModal" :data-testid="`duplicate-modal-${id}`">
          <div class="DuplicateModal__title">
            {{ $t("slotitem.duplicate.modal.title") }}
          </div>
          <div class="DuplicateModal__section">
            <div class="DuplicateModal__section-title">
              {{ $t("slotitem.duplicate.modal.section.one.description") }}
            </div>
            <div class="DuplicateModal__section-content">
              {{ $t("common.every") }}
              <NovaInputNumber
                :id="`${id}-slot-item-duplicate-every`"
                v-model="duplicateSettings.repeatEvery"
                :min-value="0"
              ></NovaInputNumber>
              <NovaInputRadioGroup
                v-model="duplicateSettings.repeatUnit"
                name="duplicate-modal"
                :options="[
                  { label: 'hour', value: 'hour' },
                  { label: 'minutes', value: 'minutes' },
                ]"
              ></NovaInputRadioGroup>
            </div>
          </div>
          <div class="DuplicateModal__section">
            <div class="DuplicateModal__section-title">
              {{ $t("slotitem.duplicate.modal.section.two.description") }}
              <div class="DuplicateModal__section-content">
                <NovaInputNumber
                  :id="`${id}-slot-item-duplicate-hour`"
                  v-model="duplicateSettings.timeMax.hour"
                  :min-value="0"
                  :max-value="24"
                ></NovaInputNumber>
                :
                <NovaInputNumber
                  :id="`${id}-slot-item-duplicate-minutes`"
                  v-model="duplicateSettings.timeMax.minutes"
                  :min-value="0"
                  :max-value="59"
                ></NovaInputNumber>
              </div>
            </div>
          </div>
          <div class="DuplicateModal__btn">
            <NovaButton
              v-if="actions.duplicate.show"
              data-testid="slot-item-duplicate-button"
              size="sm"
              :disabled="!enableDuplicateBtn"
              @click="$emit('click:duplicate', duplicateSettings), (showDuplicateModal = false)"
            >
              {{ $t("common.duplicate") }}</NovaButton
            >
          </div>
        </div>
      </span>

      <NovaButtonIcon
        v-if="actions.clear.show"
        :disabled="!enableClear || disabled"
        data-testid="slot-item-clear"
        class="mr-2 ml-2"
        shape="square"
        theme="dark"
        name="clear"
        :size="16"
        @click="handleClear"
      >
      </NovaButtonIcon>
      <NovaButtonIcon
        v-if="actions.delete.show"
        :disabled="actions.delete.disabled || disabled"
        data-testid="slot-item-delete"
        shape="square"
        theme="dark"
        name="trash"
        :size="16"
        @click="() => handleDelete(id)"
      >
      </NovaButtonIcon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useVModel } from "@vueuse/core";
import NovaInputNumber from "@/ui-kit/NovaInputNumber/NovaInputNumber.vue";
import PricingDropdown from "./PricingDropdown.vue";
import LanguagesDropdown from "./LanguagesDropdown.vue";
import { Pricing, TimedTicket } from "@/types/generated/OfferServiceApiOld";
import { Option } from "@/types/generated/OfferServiceApi";
import { useDetectClickOutside } from "@/composables/useDetectClickOutside";
import { parseStringTime } from "@/utils/parse-string-time";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import NovaInputRadioGroup from "@/ui-kit/NovaInputRadioGroup/NovaInputRadioGroup.vue";
import NovaTooltip from "@/ui-kit/NovaTooltip/NovaTooltip.vue";
import NovaButtonIcon from "@/ui-kit/NovaButtonIcon/NovaButtonIcon.vue";
import NovaInputTime from "@/ui-kit/NovaInputTime/NovaInputTime.vue";
import { AvailableLanguage } from "@/types/Language";
import { getInitialLanguagesModel } from "../utils/option-language-utils";
import { isEmpty } from "lodash";

export interface Props {
  id: number | string;
  pricingList: Pricing[];
  validationErrors?: Record<string, any>;
  showTitles?: boolean;
  disabled?: boolean;
  modelValue: TimedTicket;
  optionData?: Option;
  showTime?: boolean;
  actions: {
    clear: { show: boolean };
    delete: { show: boolean; disabled?: boolean };
    duplicate: { show: boolean };
  };
}

export interface DuplicateSettings {
  item: Props["modelValue"];
  timeMax: {
    hour: number | undefined;
    minutes: number | undefined;
  };
  repeatEvery: number | undefined;
  repeatUnit: "hour" | "minutes";
}

interface Events {
  (e: "update:modelValue", value: Props["modelValue"]): void;
  (e: "click:duplicate", value: DuplicateSettings): void;
  (e: "click:delete", value: string): void;
}

const props = defineProps<Props>();
const emits = defineEmits<Events>();

const data = useVModel(props, "modelValue", emits);

function handleDelete(id: string | number) {
  emits("click:delete", String(id));
}

// Errors

const hasTimeError = computed(
  () => !!props.validationErrors?.time?._errors.length || !!props.validationErrors?.timeslot?._errors.length
);

// Timeslot

const fields = computed(() => {
  const isMultiLanguage = props.optionData?.multilanguage ?? false;
  const unlimitedCapacity = props.optionData?.capacity_type === "unlimited";
  const limitedPricingCapacity = props.optionData?.capacity_type === "pax";
  const limitedLanguageCapacity = props.optionData?.capacity_type === "language";

  return {
    languages: {
      show: isMultiLanguage,
      limitedCapacity: limitedLanguageCapacity,
    },
    pricings: { limitedCapacity: limitedPricingCapacity },
    capacity: {
      show: !limitedPricingCapacity && !limitedLanguageCapacity,
      unlimited: unlimitedCapacity,
    },
  };
});

const shouldPreSelectLanguages = fields.value.languages.show && isEmpty(data.value.languages);

if (shouldPreSelectLanguages) {
  data.value.languages = getInitialLanguagesModel(
    props.optionData?.allowed_languages,
    fields.value.languages.limitedCapacity
  );
}

const allowedLanguagesAsArray = props.optionData?.allowed_languages?.map((l) => l.language as AvailableLanguage) ?? [];

function handleClear() {
  data.value.pricings = [];
  if (props.showTime) {
    data.value.time = "";
  }
  if (fields.value.languages.show) {
    data.value.languages = [];
  }
  if (fields.value.capacity.show) {
    data.value.capacity = undefined;
  }
}

const duplicateSettings: DuplicateSettings = reactive({
  item: data.value,
  timeMax: {
    hour: 23,
    minutes: 59,
  },
  repeatEvery: undefined,
  repeatUnit: "hour",
});

const enableDuplicateAction = computed(() => {
  const timeslotValue = props.showTime ? !!data.value.time : true;
  const languages = fields.value.languages.show ? !!data.value.languages?.length : true;
  const capacity =
    fields.value.capacity.show && !fields.value.capacity.unlimited ? data.value.capacity !== undefined : true;

  return timeslotValue && languages && capacity && !!data.value.pricings?.length;
});

const enableDuplicateBtn = computed(() => {
  const { hour, minutes } = parseStringTime(data.value.time);
  if (
    duplicateSettings.timeMax.hour === undefined ||
    duplicateSettings.timeMax.minutes === undefined ||
    hour === undefined ||
    minutes === undefined ||
    !duplicateSettings.repeatEvery
  ) {
    return false;
  }
  const totFrom = hour * 60 + minutes;
  const totTo = duplicateSettings.timeMax.hour * 60 + duplicateSettings.timeMax.minutes;
  const repeatEvery =
    duplicateSettings.repeatUnit === "hour" ? duplicateSettings.repeatEvery * 60 : duplicateSettings.repeatEvery;

  if (totTo - totFrom >= repeatEvery) {
    return true;
  }
});

const enableClear = computed(() => {
  const timeslotValue = props.showTime ? !!data.value.time : false;
  const languages = fields.value.languages.show ? !!data.value.languages?.length : false;
  const capacity = fields.value.capacity.show ? data.value.capacity !== undefined : false;

  return timeslotValue || languages || capacity || !!data.value.pricings?.length;
});

const showDuplicateModal = ref(false);
const component = ref();
useDetectClickOutside(component, () => {
  showDuplicateModal.value = false;
});
</script>
<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.SlotItem {
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-default);
  display: flex;
  justify-content: space-between;
  padding: rem(16);
  position: relative;

  &__titles {
    position: absolute;
    top: rem(-25);
    color: var(--color-text-90);
    @include font-regular(12);
  }

  span {
    display: flex;

    .SlotItem__timeslot {
      display: flex;
      align-items: center;
      gap: rem(8);
      margin-right: rem(16);
    }

    .SlotItem__pricing,
    .SlotItem__languages {
      margin-right: rem(16);
      min-width: rem(174);
      width: 100%;
    }

    .SlotItem__capacity {
      margin-right: rem(16);
      display: flex;
      align-items: center;

      p {
        color: var(--color-text-100);
      }
    }

    .SlotItem__tooltip {
      filter: none;
    }
  }

  &__actions {
    align-self: center;
    display: flex;

    &-duplicate {
      position: relative;
    }
  }
}

.DuplicateModal {
  top: 120%;
  right: -40%;
  z-index: 2;
  box-shadow: var(--box-shadow-popover);
  position: absolute;
  border-radius: var(--border-radius-default);
  padding: rem(24);
  background-color: var(--color-white);
  width: rem(335);

  &__title {
    @include font-bold(16);
  }

  &__section-title {
    @include font-regular(12);

    color: var(--color-text-90);
    margin-top: rem(24);
  }

  &__section-content {
    @include font-regular(14);

    display: flex;
    align-items: center;
    gap: rem(16);
    color: #000;
    margin-top: rem(24);
  }

  &__section-content:first-of-type {
    gap: rem(6);
  }

  &__btn {
    display: flex;
    justify-content: center;
    padding-top: rem(16);
  }
}

@include start-from(desktop-sm) {
  .SlotItem {
    span {
      .SlotItem__languages,
      .SlotItem__pricing {
        width: rem(210);
      }
    }
  }
}
</style>
