<!-- eslint-disable vue/valid-v-model -->
<template>
  <NovaCollapse
    class="mb-3"
    :model-value="props.isOpen"
    :title="availabilityForm.name || $t('experience.availability.title')"
    @update:model-value="$emit('toggle:availabilityCard', $event)"
  >
    <template #actions>
      <span v-if="!readonly">
        <NovaButtonIcon
          name="clear"
          theme="dark"
          :size="20"
          data-testid="clear-availability"
          @click="handleClearAvailability()"
        />
        <NovaButtonIcon
          name="trash"
          theme="dark"
          :size="20"
          data-testid="delete-availability"
          @click="() => (availabilityCard.isDeleteModalVisible = true)"
        />
      </span>
      <NovaModalConfirm
        :show-modal="availabilityCard.isDeleteModalVisible"
        :title="$t('experience.availability.delete-modal.title')"
        :description="$t('common.modal.delete.description')"
        :cta-confirm-text="$t('common.delete')"
        :cta-cancel-text="$t('common.cancel')"
        :confirm-callback="
          async () => {
            await deleteCallback();
            availabilityCard.isDeleteModalVisible = false;
            handleClearAvailability();
          }
        "
        :cancel-callback="() => (availabilityCard.isDeleteModalVisible = false)"
      />
    </template>

    <div class="p-4">
      <DocumentFormSection id="availability.name" :required="true" :slot-max-width="325">
        <NovaInputText
          id="availability_name"
          v-model="availabilityForm.name"
          :placeholder="$t('experience.title.input.placeholder')"
          :is-invalid="hasError('name') && !readonly"
          :disabled="readonly"
        />
      </DocumentFormSection>

      <DocumentFormSection
        v-if="experienceType === ExperienceType.NO_CALENDAR_FIXED_END"
        id="availability.expiration-date"
        class="mt-8"
        :required="true"
      >
        <div>
          <div>
            <NovaInputDate
              id="availability_expiration-date"
              :model-value="{
                from: availabilityForm.expiration_date ? new Date(availabilityForm.expiration_date) : undefined,
              }"
              single-date-selector
              :readonly="readonly"
              hide-label
              :is-invalid="hasError('expiration_date') && !readonly"
              @update:model-value="
                (dateRange) =>
                  (availabilityForm.expiration_date = dateRange.from ? formatDate(
                    dateRange.from as Date
                  ): null)
              "
            ></NovaInputDate>
          </div>
        </div>
      </DocumentFormSection>
      <DocumentFormSection v-else id="availability.expiration-days" class="mt-8" :required="true">
        <span class="flex">
          <NovaInputNumber
            id="availability.expiration-days"
            v-model="(availabilityForm.expiration_days as number)"
            :min-value="1"
            :is-invalid="hasError('expiration_days') && !readonly"
            :disabled="readonly"
          ></NovaInputNumber>
          <p class="ml-1 InputNumberLabel">{{ $t("common.days") }}</p>
        </span>
      </DocumentFormSection>

      <DocumentFormSection id="availability.schedule.open-ticket" class="mt-8" :required="true">
        <NovaCollapse
          :model-value="true"
          data-testid="availability-day-card"
          class="mt-4"
          :title="$t('common.any-day')"
          size="md"
        >
          <div class="p-4">
            <div class="timeslot__wrapper mt-5">
              <AvailabilitySlotItem
                id="availability.any-day"
                data-testid="time-slot-item"
                :show-titles="true"
                :pricing-list="pricingData"
                :model-value="availabilityForm"
                :option-data="optionData"
                :disabled="readonly"
                :actions="{
                  clear: { show: true },
                  duplicate: { show: false },
                  delete: {
                    show: false,
                    disabled: false,
                  },
                }"
                :validation-errors="errors ?? {}"
              />
            </div>
          </div>
        </NovaCollapse>
      </DocumentFormSection>
    </div>
  </NovaCollapse>
</template>

<script setup lang="ts">
import { Ref } from "vue";
import { useExperienceRaw } from "@/stores/experience-raw";
import { ExperienceType, Pricing, OpenTicket } from "@/types/generated/OfferServiceApiOld";
import { Option } from "@/types/generated/OfferServiceApi";
import NovaButtonIcon from "@/ui-kit/NovaButtonIcon/NovaButtonIcon.vue";
import NovaCollapse from "@/ui-kit/NovaCollapse/NovaCollapse.vue";
import NovaInputDate from "@/ui-kit/NovaInputDate/NovaInputDate.vue";
import NovaInputText from "@/ui-kit/NovaInputText/NovaInputText.vue";
import NovaModalConfirm from "@/ui-kit/NovaModalConfirm/NovaModalConfirm.vue";
import AvailabilitySlotItem from "@/features/experience-calendar/components/AvailabilitySlotItem.vue";
import NovaInputNumber from "@/ui-kit/NovaInputNumber/NovaInputNumber.vue";
import { formatDate } from "@/utils/date-utils";
import DocumentFormSection from "@/components/Document/FormSection/FormSection.vue";
import { watchDebounced } from "@vueuse/shared";
import { getFixedEndTicketSchema, getFixedValidityTicketSchema } from "../schemas/availability.schema";
import { CapacityType } from "@/types/Options";
import { useGenericValidation } from "../composables/useGenericValidation";

export interface Props {
  availability: OpenTicket;
  optionData?: Option;
  pricingData: Pricing[];
  isOpen: boolean;
  readonly?: boolean;
  deleteCallback: () => Promise<void>;
}

type AvailabilityCard = {
  isDeleteModalVisible: boolean;
  fields: OpenTicket;
};

interface Events {
  (e: "update:availability", { value, valid }: { value: OpenTicket; valid: boolean }): void;
  (e: "toggle:availabilityCard", value: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Events>();

const experienceRaw = useExperienceRaw();
const route = useRoute();
const config = useRuntimeConfig();
const optionId = route.params.optionId as string;

const document = computed(() => experienceRaw.rawContents[route.params.id as string]);
const experienceType: Ref<ExperienceType> = computed(() => document.value.fields.experience_type!.value);

// Form

const availabilityForm = reactive({ ...props.availability });

const availabilityMapFromService = (availability: OpenTicket): AvailabilityCard => {
  return {
    isDeleteModalVisible: false,
    fields: availability,
  };
};

const availabilityCard = ref<AvailabilityCard>(availabilityMapFromService(props.availability));

const handleClearAvailability = () => {
  availabilityForm.option = optionId;
  availabilityForm.expiration_date = null;
  availabilityForm.expiration_days = null;
  availabilityForm.name = "";
  availabilityForm.pricings = [];
};

watchDebounced(
  availabilityForm,
  () => {
    runValidation(availabilityForm);
    emit("update:availability", {
      value: availabilityForm,
      valid: isValid.value,
    });
  },
  { debounce: +config.public.WATCH_DEBOUNCE_TIMEOUT, immediate: true }
);

// Validation

if (!props.optionData) {
  throw new Error("No option data");
}

const validationSchema =
  experienceType.value === ExperienceType.NO_CALENDAR_FIXED_END
    ? getFixedEndTicketSchema(props.optionData.capacity_type as CapacityType, props.optionData.multilanguage)
    : getFixedValidityTicketSchema(props.optionData.capacity_type as CapacityType, props.optionData.multilanguage);

const { runValidation, isValid, hasError, errors } = useGenericValidation(validationSchema);
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.flex {
  display: flex;
  align-items: center;
}

.InputNumberLabel {
  @include font-regular(14);
}
</style>
