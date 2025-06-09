<template>
  <NovaCollapse
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
          @click="isDeleteModalVisible = true"
        />
      </span>
      <NovaModalConfirm
        :show-modal="isDeleteModalVisible"
        :title="$t('experience.availability.delete-modal.title')"
        :description="$t('common.modal.delete.description')"
        :cta-confirm-text="$t('common.delete')"
        :cta-cancel-text="$t('common.cancel')"
        :confirm-callback="
          async () => {
            await deleteCallback();
            isDeleteModalVisible = false;
          }
        "
        :cancel-callback="() => (isDeleteModalVisible = false)"
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
      <DocumentFormSection id="availability.dates" class="mt-8" :required="true">
        <div>
          <div class="mt-7">
            <NovaInputDate
              id="availability_dates"
              :is-invalid="(hasError('date_range.from') || hasError('date_range.to')) && !readonly"
              :readonly="readonly"
              :model-value="{
                from: availabilityForm.date_range.from ? new Date(availabilityForm.date_range.from) : undefined,
                to: availabilityForm.date_range.to ? new Date(availabilityForm.date_range.to) : undefined,
              }"
              @update:model-value="
                availabilityForm.date_range = {
                  from: $event.from ? formatDate($event.from) : undefined,
                  to: $event.to ? formatDate($event.to) : undefined,
                }
              "
            ></NovaInputDate>
          </div>
        </div>
      </DocumentFormSection>

      <DocumentFormSection id="availability.schedule" class="mt-8" :required="true">
        <div class="mb-2">
          <ScheduleDays v-model="scheduleField" :disabled="readonly" :is-invalid="!isScheduleValid && !readonly" />
        </div>
        <NovaAlert
          v-show="props.optionData?.pricing_type_allowed === 'group' && !!scheduleDayCards.length"
          status="info"
          size="sm"
          variant="solid"
          class="my-4"
          data-testid="availability-overlapping-timeslots-error"
          >{{ $t("experience.availability.info.group.max-number") }}</NovaAlert
        >
        <template v-for="day in scheduleDayCards" :key="day.cardId">
          <NovaCollapse
            v-if="!day.isHidden"
            v-model="day.isOpen"
            size="md"
            data-testid="availability-day-card"
            class="mt-4"
            :title="day.cardTitle"
          >
            <template #actions>
              <NovaButton
                variant="underlined"
                size="sm"
                data-testid="copy-settings-btn"
                :disabled="readonly"
                @click="showCopySettingsModal = { [day.dayNumber]: true }"
              >
                {{ $t("experience.availability.copy.settings") }}
              </NovaButton>

              <AvailabilityCopySettingsModal
                :show="showCopySettingsModal[day.dayNumber] ?? false"
                :disabled-days="[...disabledDays, day.dayNumber]"
                @close="showCopySettingsModal[day.dayNumber] = false"
                @click:copy="handleCopySettings(day.dayNumber, $event)"
              />
            </template>

            <div class="p-4">
              <div class="timeslot__wrapper mt-5">
                <AvailabilitySlotItem
                  :id="day.timeSlots.itemId"
                  data-testid="time-slot-item"
                  :show-titles="true"
                  :pricing-list="pricingData"
                  :model-value="day.timeSlots.fields"
                  :option-data="optionData"
                  :actions="{
                    clear: { show: true },
                    delete: { show: false },
                    duplicate: { show: false },
                  }"
                  :disabled="readonly"
                  :validation-errors="getError(`days.${day.dayNumber}`)"
                />
              </div>
            </div>
          </NovaCollapse>
        </template>
      </DocumentFormSection>
    </div>
  </NovaCollapse>
</template>

<script lang="ts" setup>
import { Option } from "@/types/generated/OfferServiceApi";
import { Pricing, DateTicket, Ticket } from "@/types/generated/OfferServiceApiOld";
import { SHORT_DAY_NAMES } from "@/constants/date.constants";

import NovaCollapse from "@/ui-kit/NovaCollapse/NovaCollapse.vue";
import NovaInputText from "@/ui-kit/NovaInputText/NovaInputText.vue";
import NovaInputDate from "@/ui-kit/NovaInputDate/NovaInputDate.vue";
import ScheduleDays from "@/features/experience-shared/components/ScheduleDays.vue";
import DocumentFormSection from "@/components/Document/FormSection/FormSection.vue";
import NovaModalConfirm from "@/ui-kit/NovaModalConfirm/NovaModalConfirm.vue";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import NovaButtonIcon from "@/ui-kit/NovaButtonIcon/NovaButtonIcon.vue";
import { formatDate } from "@/utils/date-utils";
import { ShortDayNames } from "@/types/DateTypes";
import AvailabilitySlotItem from "@/features/experience-calendar/components/AvailabilitySlotItem.vue";
import { uuid } from "@/utils/uuid";
import { useScheduleDays } from "@/features/experience-shared/composables/useScheduleDays";
import AvailabilityCopySettingsModal from "@/features/experience-calendar/components/AvailabilityCopySettingsModal.vue";
import { watchDebounced } from "@vueuse/shared";
import { getDateTicketSchema } from "../schemas/availability.schema";
import { useGenericValidation } from "../composables/useGenericValidation";
import { CapacityType } from "@/types/Options";
import NovaAlert from "@/ui-kit/NovaAlert/NovaAlert.vue";

export interface TimeSlotItem {
  itemId: string;
  fields: Ticket;
  isDeleteModalVisible: boolean;
}

export type DayCard = {
  cardId: string;
  cardTitle: string;
  isOpen: boolean;
  isHidden: boolean;
  dayNumber: number;
  timeSlots: TimeSlotItem;
};

export interface Props {
  availability: DateTicket;
  optionData?: Option;
  pricingData: Pricing[];
  isOpen: boolean;
  readonly?: boolean;
  deleteCallback: () => Promise<void>;
}

interface Events {
  (e: "update:availability", { value, valid }: { value: DateTicket; valid: boolean }): void;
  (e: "toggle:availabilityCard", value: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Events>();

const { $t } = useNuxtApp();
const route = useRoute();
const config = useRuntimeConfig();
const optionId = route.params.optionId as string;
const isDeleteModalVisible = ref(false);

// Form

const availabilityForm = reactive({ ...props.availability });
watchDebounced(
  availabilityForm,
  () => {
    runValidation(availabilityForm);
    emit("update:availability", {
      value: availabilityForm,
      valid: isFormValid.value,
    });
  },
  { debounce: +config.public.WATCH_DEBOUNCE_TIMEOUT, immediate: true }
);

function handleClearAvailability() {
  availabilityForm.id = "";
  availabilityForm.days = {};
  availabilityForm.option = optionId;
  availabilityForm.date_range = { from: undefined, to: undefined };
  availabilityForm.name = "";
}

// Validation

if (!props.optionData) {
  throw new Error("No option data");
}

const validationSchema = getDateTicketSchema(
  props.optionData.capacity_type as CapacityType,
  props.optionData.multilanguage
);
const isScheduleValid = computed(() => Object.keys(availabilityForm.days).length > 0);
const isFormValid = computed(() => isValid.value && isScheduleValid.value);

const { runValidation, isValid, hasError, getError } = useGenericValidation(validationSchema);

// Schedule

const scheduleDayCards = ref<DayCard[]>(createDayCards(availabilityForm.days));
const scheduleField = useScheduleDays(toRef(availabilityForm, "date_range"), handleScheduleUpdate);

onMounted(() => {
  const uncheckedDayNames = SHORT_DAY_NAMES.filter(
    (_, idx) => !availabilityForm.days[(idx + 1).toString() as keyof DateTicket["days"]]
  ) as ShortDayNames[];

  uncheckedDayNames.forEach((dayName) => {
    scheduleField.value[dayName].checked = false;
  });
});

function handleScheduleUpdate() {
  const days: Record<string, Ticket> = {};

  Object.keys(scheduleField.value).forEach((key, index) => {
    if (scheduleField.value[key as ShortDayNames].checked) {
      days[`${index + 1}`] =
        availabilityForm.days[`${index + 1}` as keyof typeof availabilityForm.days] ?? getDefaultTimeSlot();
    }
  });

  scheduleDayCards.value = createDayCards(days);

  for (const dayCard of scheduleDayCards.value) {
    const { dayNumber, timeSlots, isHidden } = dayCard;
    const dayIndex = dayNumber.toString() as keyof DateTicket["days"];

    if (!isHidden) {
      days[dayIndex] = timeSlots.fields;
    }
  }
  availabilityForm.days = days;
}

// Timeslots

const getDefaultTimeSlot = (): Ticket => {
  return {
    pricings: [],
    languages: [],
    capacity: undefined,
  };
};

function createTimeSlotItem(fields: Ticket, override: Partial<TimeSlotItem> = {}): TimeSlotItem {
  return {
    itemId: uuid(),
    fields,
    isDeleteModalVisible: false,
    ...override,
  };
}

// Day cards

function getDayNameByNumber(index: number): string {
  const shortDayNames: Record<number, string> = {
    1: $t("common.monday"),
    2: $t("common.tuesday"),
    3: $t("common.wednesday"),
    4: $t("common.thursday"),
    5: $t("common.friday"),
    6: $t("common.saturday"),
    7: $t("common.sunday"),
  };
  return shortDayNames[index];
}

function createDayCard(fields: Ticket | null, override: Partial<DayCard> = {}): DayCard {
  return {
    cardTitle: "",
    cardId: uuid(),
    isOpen: false,
    isHidden: false,
    dayNumber: 0,
    timeSlots: createTimeSlotItem(fields ?? getDefaultTimeSlot()),
    ...override,
  };
}

function createDayCards(daysValue: DateTicket["days"]) {
  const dayCards: DayCard[] = [];
  Object.entries(daysValue).forEach(([key, days], index) => {
    const dayName = getDayNameByNumber(Number(key));
    const dayCard = createDayCard(days, {
      cardTitle: dayName,
      dayNumber: Number(key),
      isOpen: index === 0,
    });
    if (days) {
      dayCard.timeSlots = createTimeSlotItem(days);
    } else {
      dayCard.timeSlots = createTimeSlotItem(getDefaultTimeSlot());
    }
    dayCards.push(dayCard);
  });
  return dayCards;
}

// Copy settings modal

const showCopySettingsModal = ref<Record<number, boolean>>({});
const disabledDays = computed(() =>
  [1, 2, 3, 4, 5, 6, 7].filter((d) => !scheduleDayCards.value.map((c) => c.dayNumber).includes(d))
);

function handleCopySettings(fromDay: number, toDays: number[]) {
  if (toDays.length === 0) {
    return;
  }

  const currentSettings = scheduleDayCards.value.find((c) => c.dayNumber === fromDay)?.timeSlots.fields;

  if (!currentSettings) {
    throw new Error("no settings to copy for the current day!");
  }

  const newFields = {
    ...currentSettings,
    pricings: currentSettings.pricings.map((p) => ({ ...p })),
    languages: currentSettings.languages?.map((l) => ({ ...l })),
  };

  toDays.forEach((d) => {
    const card = scheduleDayCards.value.find((c) => c.dayNumber === d);
    if (!card) {
      throw new Error(`no existing card with dayNumber: ${d}`);
    }
    card.timeSlots.fields = { ...newFields };

    availabilityForm.days[`${d}` as keyof typeof availabilityForm.days] = {
      ...newFields,
    };
  });
}
</script>
