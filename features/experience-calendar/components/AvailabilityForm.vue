<template>
  <NovaFieldHeading
    :title="$t('experience.availability.title.plural')"
    :description="$t('experience.availability.description')"
    class="mb-4"
    required
  />
  <template v-for="(availability, idx) in availabilityCards" :key="availability.cardId">
    <div v-if="optionData" class="mb-4">
      <AvailabilityDaysOfWeek
        v-if="experienceType === 'CALENDAR-NO-TIMESLOTS'"
        :readonly="readonly"
        data-testid="availability-card-days-of-week"
        :availability="(availability.value as DateTicket)"
        :option-data="optionData"
        :pricing-data="pricingStore.pricings"
        :is-open="idx === 0 || availability.isOpen"
        :delete-callback="() => handleDeleteAvailability(idx, availability.value.id)"
        @update:availability="handleUpdateAvailability(idx, $event)"
        @toggle:availability-card="availability.isOpen = !availability.isOpen"
      />
      <AvailabilityDateAndTime
        v-if="experienceType === 'CALENDAR-TIMESLOTS'"
        :readonly="readonly"
        data-testid="availability-card-date-and-time"
        :availability="(availability.value as DatetimeTicket)"
        :option-data="optionData"
        :pricing-data="pricingStore.pricings"
        :is-open="idx === 0 || availability.isOpen"
        :delete-callback="() => handleDeleteAvailability(idx, availability.value.id)"
        @update:availability="handleUpdateAvailability(idx, $event)"
        @toggle:availability-card="availability.isOpen = !availability.isOpen"
      />
      <AvailabilityOpen
        v-if="
          experienceType === ExperienceType.NO_CALENDAR_FIXED_END ||
          experienceType === ExperienceType.NO_CALENDAR_FIXED_VALIDITY
        "
        data-testid="availability-card-open"
        :readonly="readonly"
        :availability="(availability.value as OpenTicket)"
        :option-data="optionData"
        :pricing-data="pricingStore.pricings"
        :is-open="idx === 0 || availability.isOpen"
        :delete-callback="() => handleDeleteAvailability(idx, availability.value.id)"
        @update:availability="handleUpdateAvailability(idx, $event)"
        @toggle:availability-card="availability.isOpen = !availability.isOpen"
      />
    </div>
  </template>

  <div>
    <NovaButton v-if="!readonly" size="sm" data-testid="add-availability" @click="handleAddAvailability"
      >&plus; {{ $t("experience.availability.add-availability") }}</NovaButton
    >
  </div>
</template>

<script setup lang="ts">
import { useNotifications } from "@/stores/notifications";
import { DateTicket, DatetimeTicket, ExperienceType, OpenTicket } from "@/types/generated/OfferServiceApiOld";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import NovaFieldHeading from "@/ui-kit/NovaFieldHeading/NovaFieldHeading.vue";
import { getDefaultAvailabilityFields } from "../lib/experience-option-availability";
import { useExperienceOptionsStore } from "@/features/experience-calendar/store/useExperienceOptionsStore";
import { usePricingStore } from "@/features/experience-calendar/store/usePricingStore";
import { AvailabilityType } from "../types/Availability";
import AvailabilityDateAndTime from "./AvailabilityDateAndTime.vue";
import AvailabilityDaysOfWeek from "./AvailabilityDaysOfWeek.vue";
import AvailabilityOpen from "./AvailabilityOpen.vue";

export interface Props {
  isCuration: boolean;
  optionId: string;
  experienceType: ExperienceType;
  readonly?: boolean;
}

const props = defineProps<Props>();
const { optionId, experienceType } = toRefs(props);

const notification = useNotifications();
const optionsStore = useExperienceOptionsStore();
const optionData = computed(() => optionsStore.state.option);
const pricingStore = usePricingStore();

const availabilityCards = computed(() => optionsStore.state.availabilities);

watch(
  () => availabilityCards.value.length,
  () => {
    // if there are no availabilities add a default
    if (!availabilityCards.value.length) {
      handleAddAvailability();
    }
  },
  { immediate: true }
);

function handleAddAvailability() {
  optionsStore.state.availabilities.push(
    getDefaultAvailabilityFields<DateTicket>(optionId.value, experienceType.value)
  );
}

async function handleDeleteAvailability(index: number, availabilityId?: string) {
  try {
    await optionsStore.deleteAvailability(index, optionId.value, experienceType.value, availabilityId);

    notification.addNotification({
      theme: "success",
      message: "notifications.success.saving.document",
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
    notification.addNotification({
      theme: "error",
      message: "notifications.error.saving.document",
    });
  }
}

function handleUpdateAvailability(index: number, event: { value: AvailabilityType; valid: boolean }) {
  availabilityCards.value[index].value = event.value;
  availabilityCards.value[index].isValid = event.valid;
}
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";
</style>
